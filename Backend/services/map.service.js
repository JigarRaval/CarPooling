const axios = require("axios");
const captainModel = require("../models/captain.model");

// Add rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function makeNominatimRequest(url) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
  return axios.get(url, {
    headers: {
      "User-Agent": "YourAppName/1.0 (your@email.com)",
    },
  });
}

module.exports.getAddressCoordinate = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;

  try {
    const response = await makeNominatimRequest(url);
    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return {
        ltd: parseFloat(location.lat),
        lng: parseFloat(location.lon),
      };
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  // Get coordinates for both locations
  const getCoords = async (address) => {
    const response = await makeNominatimRequest(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`
    );
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    throw new Error(`Could not find coordinates for address: ${address}`);
  };

  try {
    const [originData, destinationData] = await Promise.all([
      getCoords(origin),
      getCoords(destination),
    ]);

    // Use OSRM for distance and duration
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originData.lon},${originData.lat};${destinationData.lon},${destinationData.lat}?overview=false`;
    const osrmResponse = await axios.get(osrmUrl);

    if (
      osrmResponse.data &&
      osrmResponse.data.routes &&
      osrmResponse.data.routes.length > 0
    ) {
      const route = osrmResponse.data.routes[0];
      return {
        distance: {
          text: `${(route.distance / 1000).toFixed(1)} km`,
          value: route.distance,
        },
        duration: {
          text: `${Math.ceil(route.duration / 60)} mins`,
          value: route.duration,
        },
        status: "OK",
      };
    } else {
      throw new Error("No routes found");
    }
  } catch (err) {
    console.error("Routing error:", err);
    throw err;
  }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("query is required");
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    input
  )}&addressdetails=1&limit=5`;

  try {
    const response = await makeNominatimRequest(url);
    if (response.data && response.data.length > 0) {
      return response.data.map((item) => {
        const address = item.address || {};
        const parts = [
          address.road,
          address.neighbourhood,
          address.suburb,
          address.city,
          address.town,
          address.village,
          address.county,
          address.state,
          address.country,
        ].filter(Boolean);

        return parts.join(", ") || item.display_name;
      });
    } else {
      return [];
    }
  } catch (err) {
    console.error("Autocomplete error:", err.message);
    throw err;
  }
};

module.exports.getCaptainsInTheRadius = async (
  ltd,
  lng,
  radius,
  vehicleType
) => {
  try {
    const captains = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[ltd, lng], radius / 6371],
        },
      },
      "vehicle.type": vehicleType,
    });
    return captains;
  } catch (error) {
    console.error("Captain radius error:", error);
    throw new Error("Error in getting captain in radius");
  }
};
