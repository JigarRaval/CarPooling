import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useCaptain } from "../contexts/CaptainContext";
import { Phone, User, MapPin, Car, Bike, Clock, Calendar } from "lucide-react";
import { SocketDataContext } from "../contexts/SocketContext";
import { NewRide, Sidebar } from "../components";
import { motion, AnimatePresence } from "framer-motion";

const defaultRideData = {
  user: {
    fullname: {
      firstname: "No",
      lastname: "User",
    },
    _id: "",
    email: "example@gmail.com",
    rides: [],
  },
  pickup: "Place, City, State, Country",
  destination: "Place, City, State, Country",
  fare: 0,
  vehicle: "car",
  status: "pending",
  duration: 0,
  distance: 0,
  _id: "123456789012345678901234",
};

function CaptainHomeScreen() {
  const token = localStorage.getItem("token");
  const { captain } = useCaptain();
  const { socket } = useContext(SocketDataContext);
  const [loading, setLoading] = useState(false);

  const [riderLocation, setRiderLocation] = useState({
    ltd: null,
    lng: null,
  });
  const [mapLocation, setMapLocation] = useState("");
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
    weekly: 0,
  });

  const [rides, setRides] = useState({
    accepted: 0,
    cancelled: 0,
    distanceTravelled: 0,
    averageRating: 0,
  });

  const [newRide, setNewRide] = useState(
    JSON.parse(localStorage.getItem("rideDetails")) || defaultRideData
  );
  const [otp, setOtp] = useState("");
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );

  // Panels
  const [showCaptainDetailsPanel, setShowCaptainDetailsPanel] = useState(true);
  const [showNewRidePanel, setShowNewRidePanel] = useState(
    JSON.parse(localStorage.getItem("showPanel")) || false
  );
  const [showBtn, setShowBtn] = useState(
    JSON.parse(localStorage.getItem("showBtn")) || "accept"
  );
  const [isOnline, setIsOnline] = useState(true);

  // Memoized functions
  const updateLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setRiderLocation({ ltd: latitude, lng: longitude });
          setMapLocation(
            `https://www.google.com/maps/embed/v1/view?key=${
              import.meta.env.VITE_GMAPS_KEY
            }&center=${latitude},${longitude}&zoom=15`
          );

          if (isOnline && captain._id) {
            socket.emit("update-location-captain", {
              userId: captain._id,
              location: { ltd: latitude, lng: longitude },
            });
          }
        },
        (error) => {
          console.error("Location error:", error);
          // Fallback to default location
          setMapLocation(
            `https://www.google.com/maps/embed/v1/view?key=${
              import.meta.env.VITE_GMAPS_KEY
            }&center=28.6139,77.2090&zoom=12`
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [captain, isOnline, socket]);

  const calculateEarnings = useCallback(() => {
    let stats = {
      total: 0,
      today: 0,
      weekly: 0,
      accepted: 0,
      cancelled: 0,
      distanceTravelled: 0,
      ratingSum: 0,
    };

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    captain.rides.forEach((ride) => {
      const rideDate = new Date(ride.updatedAt);

      if (ride.status === "completed") {
        stats.accepted++;
        stats.distanceTravelled += ride.distance;
        stats.total += ride.fare;
        stats.ratingSum += ride.rating || 0;

        // Today's earnings
        if (
          rideDate.getDate() === today.getDate() &&
          rideDate.getMonth() === today.getMonth() &&
          rideDate.getFullYear() === today.getFullYear()
        ) {
          stats.today += ride.fare;
        }

        // Weekly earnings
        if (rideDate >= weekAgo) {
          stats.weekly += ride.fare;
        }
      } else if (ride.status === "cancelled") {
        stats.cancelled++;
      }
    });

    setEarnings({
      total: stats.total,
      today: stats.today,
      weekly: stats.weekly,
    });

    setRides({
      accepted: stats.accepted,
      cancelled: stats.cancelled,
      distanceTravelled: Math.round(stats.distanceTravelled / 1000),
      averageRating:
        stats.accepted > 0 ? (stats.ratingSum / stats.accepted).toFixed(1) : 0,
    });
  }, [captain]);

  // API Calls
  const acceptRide = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ride/confirm`,
        { rideId: newRide._id },
        { headers: { token } }
      );

      setShowBtn("otp");
      setMapLocation(
        `https://www.google.com/maps/embed/v1/directions?key=${
          import.meta.env.VITE_GMAPS_KEY
        }&origin=${riderLocation.ltd},${riderLocation.lng}&destination=${
          newRide.pickup
        }&mode=driving`
      );
    } catch (err) {
      console.error("Accept ride error:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      if (otp.length === 6) {
        setLoading(true);
        await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/ride/start-ride?rideId=${
            newRide._id
          }&otp=${otp}`,
          { headers: { token } }
        );

        setShowBtn("end-ride");
        setMapLocation(
          `https://www.google.com/maps/embed/v1/directions?key=${
            import.meta.env.VITE_GMAPS_KEY
          }&origin=${riderLocation.ltd},${riderLocation.lng}&destination=${
            newRide.destination
          }&mode=driving`
        );
      }
    } catch (err) {
      console.error("OTP verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const endRide = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ride/end-ride`,
        { rideId: newRide._id },
        { headers: { token } }
      );

      // Reset state
      setShowBtn("accept");
      setShowCaptainDetailsPanel(true);
      setShowNewRidePanel(false);
      setNewRide(defaultRideData);
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("showPanel");
      updateLocation();
    } catch (err) {
      console.error("End ride error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (captain._id) {
      socket.emit("join", { userId: captain._id, userType: "captain" });
      updateLocation();

      const locationInterval = setInterval(updateLocation, 30000);
      return () => clearInterval(locationInterval);
    }
  }, [captain, updateLocation, socket]);

  useEffect(() => {
    socket.on("new-ride", (data) => {
      setShowBtn("accept");
      setNewRide(data);
      setShowNewRidePanel(true);
    });

    socket.on("ride-cancelled", () => {
      setShowBtn("accept");
      setShowCaptainDetailsPanel(true);
      setShowNewRidePanel(false);
      setNewRide(defaultRideData);
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("showPanel");
      updateLocation();
    });

    return () => {
      socket.off("new-ride");
      socket.off("ride-cancelled");
    };
  }, [socket, updateLocation]);

  useEffect(() => {
    calculateEarnings();
  }, [captain, calculateEarnings]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
    localStorage.setItem("rideDetails", JSON.stringify(newRide));
    localStorage.setItem("showPanel", JSON.stringify(showNewRidePanel));
    localStorage.setItem("showBtn", JSON.stringify(showBtn));
  }, [messages, newRide, showNewRidePanel, showBtn]);

  useEffect(() => {
    if (newRide._id) {
      socket.emit("join-room", newRide._id);
      socket.on("receiveMessage", (msg) => {
        setMessages((prev) => [...prev, { msg, by: "other" }]);
      });

      return () => socket.off("receiveMessage");
    }
  }, [newRide, socket]);

  return (
    <div className="relative w-full h-dvh bg-gray-100">
      <Sidebar />

      {/* Online Status Toggle */}
      <div className="absolute top-4 right-4 z-20 bg-white p-2 rounded-full shadow-md">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isOnline}
            onChange={() => setIsOnline(!isOnline)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          <span className="ml-2 text-sm font-medium text-gray-700">
            {isOnline ? "Online" : "Offline"}
          </span>
        </label>
      </div>

      {/* Map */}
      <div className="absolute inset-0 z-0">
        <iframe
          src={mapLocation}
          className="w-full h-full"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Captain Map View"
        />
      </div>

      {/* Captain Details Panel */}
      <AnimatePresence>
        {showCaptainDetailsPanel && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute bottom-0 left-0 right-0 z-10 bg-white rounded-t-3xl shadow-xl p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {captain?.fullname?.firstname?.[0]}
                  {captain?.fullname?.lastname?.[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {captain?.fullname?.firstname} {captain?.fullname?.lastname}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone size={14} />
                    {captain?.phone}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500">Today's Earnings</p>
                <p className="text-xl font-bold text-green-600">
                  ₹{earnings.today.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard
                value={rides.accepted}
                label="Rides"
                icon={<Car size={16} />}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                value={rides.distanceTravelled}
                label="Km"
                icon={<MapPin size={16} />}
                color="bg-green-100 text-green-600"
              />
              <StatCard
                value={rides.averageRating}
                label="Rating"
                icon={<Star size={16} />}
                color="bg-yellow-100 text-yellow-600"
              />
            </div>

            {/* Vehicle Card */}
            <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">
                  {captain?.vehicle?.number}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="capitalize">{captain?.vehicle?.color}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {captain?.vehicle?.capacity}
                  </span>
                </p>
              </div>
              <div className="w-16 h-16">
                {captain?.vehicle?.type === "car" ? (
                  <Car size={64} className="text-gray-700" />
                ) : (
                  <Bike size={64} className="text-gray-700" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Ride Panel */}
      <NewRide
        rideData={newRide}
        otp={otp}
        setOtp={setOtp}
        showBtn={showBtn}
        showPanel={showNewRidePanel}
        setShowPanel={setShowNewRidePanel}
        showPreviousPanel={setShowCaptainDetailsPanel}
        loading={loading}
        acceptRide={acceptRide}
        verifyOTP={verifyOTP}
        endRide={endRide}
        isOnline={isOnline}
      />
    </div>
  );
}

// Helper Component
const StatCard = ({ value, label, icon, color }) => (
  <div className={`${color} p-3 rounded-xl flex flex-col items-center`}>
    <div className="flex items-center gap-1">
      {icon}
      <span className="font-bold">{value}</span>
    </div>
    <span className="text-xs mt-1">{label}</span>
  </div>
);

export default CaptainHomeScreen;
