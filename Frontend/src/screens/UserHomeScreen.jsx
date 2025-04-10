import React, { useCallback, useContext, useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import map from "/map.png";
import {
  Button,
  LocationSuggestions,
  SelectVehicle,
  RideDetails,
  Sidebar,
} from "../components";
import axios from "axios";
import debounce from "lodash.debounce";
import { SocketDataContext } from "../contexts/SocketContext";

function UserHomeScreen() {
  const token = localStorage.getItem("token"); // this token is in use
  const { socket } = useContext(SocketDataContext);
  const { user } = useUser();
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [loading, setLoading] = useState(false);
  const [selectedInput, setSelectedInput] = useState("pickup");
  const [locationSuggestion, setLocationSuggestion] = useState([]);
  const [mapLocation, setMapLocation] = useState("");
  const [rideCreated, setRideCreated] = useState(false);

  // Ride details
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [fare, setFare] = useState({
    auto: 0,
    car: 0,
    bike: 0,
  });
  const [confirmedRideData, setConfirmedRideData] = useState(null);

  // Panels
  const [showFindTripPanel, setShowFindTripPanel] = useState(true);
  const [showSelectVehiclePanel, setShowSelectVehiclePanel] = useState(false);
  const [showRideDetailsPanel, setShowRideDetailsPanel] = useState(false);

  const handleLocationChange = useCallback(
    debounce(async (inputValue, token) => {
      if (inputValue.length >= 3) {
        try {
          const response = await axios.get(
            `${
              import.meta.env.VITE_SERVER_URL
            }/map/get-suggestions?input=${inputValue}`,
            {
              headers: {
                token: token,
              },
            }
          );
          console.log(response);
          setLocationSuggestion(response.data);
        } catch (error) {
          console.log(error);
        }
      }
    }, 500),
    []
  );

  const onChangeHandler = (e) => {
    setSelectedInput(e.target.id);
    const value = e.target.value;
    if (e.target.id == "pickup") {
      setPickupLocation(value);
    } else if (e.target.id == "destination") {
      setDestinationLocation(value);
    }

    // handleLocationChange(value, token);

    if (e.target.value.length < 3) {
      setLocationSuggestion([]);
    }
  };

  const getDistanceAndFare = async (pickupLocation, destinationLocation) => {
    console.log(pickupLocation, destinationLocation);
    try {
      setLoading(true);
      setMapLocation(
        `https://www.google.com/maps?q=${pickupLocation} to ${destinationLocation}&output=embed`
      );
      const response = await axios.get(
        `${
          import.meta.env.VITE_SERVER_URL
        }/ride/get-fare?pickup=${pickupLocation}&destination=${destinationLocation}`,
        {
          headers: {
            token: token,
          },
        }
      );
      console.log(response);
      setFare(response.data.fare);

      setShowFindTripPanel(false);
      setShowSelectVehiclePanel(true);
      setLocationSuggestion([]);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const createRide = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ride/create`,
        {
          pickup: pickupLocation,
          destination: destinationLocation,
          vehicleType: selectedVehicle,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      console.log(response);
      const rideData = {
        pickup: pickupLocation,
        destination: destinationLocation,
        vehicleType: selectedVehicle,
        fare: fare,
        confirmedRideData: confirmedRideData,
        _id: response.data._id,
      };
      localStorage.setItem("rideDetails", JSON.stringify(rideData));
      setLoading(false);
      setRideCreated(true);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const cancelRide = async () => {
    const rideDetails = JSON.parse(localStorage.getItem("rideDetails"));
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/cancel?rideId=${
          rideDetails._id || rideDetails.confirmedRideData._id
        }`,
        {
          pickup: pickupLocation,
          destination: destinationLocation,
          vehicleType: selectedVehicle,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      setLoading(false);
      updateLocation();
      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(true);
      setDefaults();
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      localStorage.removeItem("messages");
      localStorage.removeItem("showPanel");
      localStorage.removeItem("showBtn");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  // Set ride details to default values
  const setDefaults = () => {
    setPickupLocation("");
    setDestinationLocation("");
    setSelectedVehicle("car");
    setFare({
      auto: 0,
      car: 0,
      bike: 0,
    });
    setConfirmedRideData(null);
    setRideCreated(false);
  };

  // Update Location
  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapLocation(
            `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}&output=embed`
          );
        },
        (error) => {
          console.error("Error fetching position:", error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              console.error("The request to get user location timed out.");
              break;
            default:
              console.error("An unknown error occurred.");
          }
        }
      );
    }
  };
  useEffect(() => {
    updateLocation();
  }, []);

  // Socket Events
  useEffect(() => {
    if (user._id) {
      socket.emit("join", {
        userId: user._id,
        userType: "user",
      });
    }

    socket.on("ride-confirmed", (data) => {
      console.log("Ride Confirmed");
      console.log(data.captain.location);
      setMapLocation(
        `https://www.google.com/maps?q=${data.captain.location.ltd},${data.captain.location.lng} to ${pickupLocation}&output=embed`
      );
      setConfirmedRideData(data);
    });

    socket.on("ride-started", (data) => {
      console.log("Ride started");
      setMapLocation(
        `https://www.google.com/maps?q=${data.pickup} to ${data.destination}&output=embed`
      );
    });

    socket.on("ride-ended", (data) => {
      console.log("Ride Ended");
      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(true);
      setDefaults();
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapLocation(
              `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}&output=embed`
            );
          },
          (error) => {
            console.error("Error fetching position:", error);
          }
        );
      }
    });
  }, [user]);

  // Get ride details
  useEffect(() => {
    const storedRideDetails = localStorage.getItem("rideDetails");
    const storedPanelDetails = localStorage.getItem("panelDetails");

    if (storedRideDetails) {
      const ride = JSON.parse(storedRideDetails);
      setPickupLocation(ride.pickup);
      setDestinationLocation(ride.destination);
      setSelectedVehicle(ride.vehicleType);
      setFare(ride.fare);
      setConfirmedRideData(ride.confirmedRideData);
    }

    if (storedPanelDetails) {
      const panels = JSON.parse(storedPanelDetails);
      setShowFindTripPanel(panels.showFindTripPanel);
      setShowSelectVehiclePanel(panels.showSelectVehiclePanel);
      setShowRideDetailsPanel(panels.showRideDetailsPanel);
    }
  }, []);

  // Store Ride Details
  useEffect(() => {
    const rideData = {
      pickup: pickupLocation,
      destination: destinationLocation,
      vehicleType: selectedVehicle,
      fare: fare,
      confirmedRideData: confirmedRideData,
    };
    localStorage.setItem("rideDetails", JSON.stringify(rideData));
  }, [
    pickupLocation,
    destinationLocation,
    selectedVehicle,
    fare,
    confirmedRideData,
  ]);

  // Store panel information
  useEffect(() => {
    const panelDetails = {
      showFindTripPanel,
      showSelectVehiclePanel,
      showRideDetailsPanel,
    };
    localStorage.setItem("panelDetails", JSON.stringify(panelDetails));
  }, [showFindTripPanel, showSelectVehiclePanel, showRideDetailsPanel]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    socket.emit("join-room", confirmedRideData?._id);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, { msg, by: "other" }]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [confirmedRideData]);
  return (
    <div
      className="relative w-full h-dvh bg-contain"
      style={{ backgroundImage: `url(${map})` }}
    >
      <Sidebar />
      <iframe
        src={mapLocation}
        className="absolute map w-full h-[120vh]"
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
      {/* Find a trip component */}
      {showFindTripPanel && (
        <div className="absolute b-0 flex flex-col justify-start p-4 pb-2 gap-4 rounded-b-lg bg-white h-fit w-full">
          <h1 className="text-2xl font-semibold">Find a trip</h1>
          <div className="flex items-center relative w-full h-fit">
            <div className="h-3/5 w-[3px] flex flex-col items-center justify-between bg-black rounded-full absolute mx-5">
              <div className="w-2 h-2 rounded-full border-[3px]  bg-white border-black"></div>
              <div className="w-2 h-2 rounded-sm border-[3px]  bg-white border-black"></div>
            </div>
            <div>
              <input
                id="pickup"
                placeholder="Add a pick-up location"
                className="w-full bg-zinc-100 pl-10 pr-4 py-3 rounded-lg outline-black text-sm mb-2 truncate"
                value={pickupLocation}
                onChange={onChangeHandler}
                autoComplete="off"
              />
              <input
                id="destination"
                placeholder="Add a drop-off location"
                className="w-full bg-zinc-100 pl-10 pr-4 py-3 rounded-lg outline-black text-sm truncate"
                value={destinationLocation}
                onChange={onChangeHandler}
                autoComplete="off"
              />
            </div>
          </div>
          {pickupLocation.length > 2 && destinationLocation.length > 2 && (
            <Button
              title={"Search"}
              loading={loading}
              fun={() => {
                getDistanceAndFare(pickupLocation, destinationLocation);
              }}
            />
          )}

          <div className="w-full h-full overflow-y-scroll ">
            {locationSuggestion.length > 0 && (
              <LocationSuggestions
                suggestions={locationSuggestion}
                setSuggestions={setLocationSuggestion}
                setPickupLocation={setPickupLocation}
                setDestinationLocation={setDestinationLocation}
                input={selectedInput}
              />
            )}
          </div>
        </div>
      )}

      {/* Select Vehicle Panel */}
      <SelectVehicle
        selectedVehicle={setSelectedVehicle}
        showPanel={showSelectVehiclePanel}
        setShowPanel={setShowSelectVehiclePanel}
        showPreviousPanel={setShowFindTripPanel}
        showNextPanel={setShowRideDetailsPanel}
        fare={fare}
      />

      {/* Ride Details Panel */}
      <RideDetails
        pickupLocation={pickupLocation}
        destinationLocation={destinationLocation}
        selectedVehicle={selectedVehicle}
        fare={fare}
        showPanel={showRideDetailsPanel}
        setShowPanel={setShowRideDetailsPanel}
        showPreviousPanel={setShowSelectVehiclePanel}
        createRide={createRide}
        cancelRide={cancelRide}
        loading={loading}
        rideCreated={rideCreated}
        confirmedRideData={confirmedRideData}
      />
    </div>
  );
}

export default UserHomeScreen;
