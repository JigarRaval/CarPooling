import { MapPin, Clock, Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function LocationSuggestions({
  suggestions = [],
  setSuggestions,
  setPickupLocation,
  setDestinationLocation,
  input,
}) {
  const [recentLocations, setRecentLocations] = useState([]);

  // Load recent locations from localStorage on mount
  useEffect(() => {
    const storedLocations =
      JSON.parse(localStorage.getItem("recentLocations")) || [];
    setRecentLocations(storedLocations);
  }, []);

  // Save to recent locations when a suggestion is selected
  const handleLocationSelect = (location) => {
    // Update the selected field
    if (input === "pickup") {
      setPickupLocation(location);
    } else {
      setDestinationLocation(location);
    }

    setSuggestions([]);

    // Add to recent locations if not already there
    if (!recentLocations.some((loc) => loc.name === location.name)) {
      const updatedLocations = [
        { ...location, timestamp: new Date() },
        ...recentLocations.slice(0, 4), // Keep only 5 most recent
      ];
      setRecentLocations(updatedLocations);
      localStorage.setItem("recentLocations", JSON.stringify(updatedLocations));
    }
  };

  return (
    <AnimatePresence>
      {(suggestions.length > 0 || recentLocations.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto"
        >
          {/* Recent Locations Section */}
          {suggestions.length === 0 && recentLocations.length > 0 && (
            <div className="p-2">
              <h3 className="text-xs font-medium text-gray-500 px-3 py-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Recent locations
              </h3>
              {recentLocations.map((location, index) => (
                <motion.div
                  key={`recent-${index}`}
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  onClick={() => handleLocationSelect(location)}
                  className="cursor-pointer flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <Clock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-medium truncate">
                      {location.name}
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                      {location.location}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Search Suggestions Section */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <h3 className="text-xs font-medium text-gray-500 px-3 py-1">
                Search results
              </h3>
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={`suggestion-${index}`}
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  onClick={() =>
                    handleLocationSelect({
                      name: suggestion,
                      location: suggestion, // Using the same string for both for now
                    })
                  }
                  className="cursor-pointer flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-medium truncate">
                      {suggestion}
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion}
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    4.5
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 p-2 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Powered by Map Service
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LocationSuggestions;
