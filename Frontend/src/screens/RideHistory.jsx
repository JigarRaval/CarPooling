import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronUp,
  Clock,
  CreditCard,
  Route,
  Timer,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function RideHistory() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("today");

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData) {
          setUser(userData.data);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  function classifyAndSortRides(rides = []) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = (date) =>
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    const isYesterday = (date) =>
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();

    const sortByDate = (rides) =>
      [...rides].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const todayRides = [];
    const yesterdayRides = [];
    const earlierRides = [];

    rides.forEach((ride) => {
      const createdDate = new Date(ride.createdAt);
      if (isToday(createdDate)) {
        todayRides.push(ride);
      } else if (isYesterday(createdDate)) {
        yesterdayRides.push(ride);
      } else {
        earlierRides.push(ride);
      }
    });

    return {
      today: sortByDate(todayRides),
      yesterday: sortByDate(yesterdayRides),
      earlier: sortByDate(earlierRides),
    };
  }

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const classifiedRides = classifyAndSortRides(user?.rides || []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sticky top-0 bg-gray-50 pt-4 pb-2 z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft strokeWidth={2.5} className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Ride History</h1>
        </div>

        {/* Ride Sections */}
        <div className="space-y-6">
          {["today", "yesterday", "earlier"].map((section) => (
            <div key={section} className="bg-white rounded-xl shadow-sm">
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 capitalize">
                    {section}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {classifiedRides[section].length}
                  </span>
                </div>
                <ChevronUp
                  className={`w-5 h-5 transition-transform duration-300 ${
                    activeSection === section ? "rotate-0" : "rotate-180"
                  } text-gray-500`}
                />
              </button>

              <AnimatePresence>
                {activeSection === section && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {classifiedRides[section].length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {classifiedRides[section].map((ride) => (
                          <RideCard ride={ride} key={ride._id} />
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No rides found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const RideCard = ({ ride }) => {
  const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (inputDate) => {
    const date = new Date(inputDate);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(ride.createdAt)}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={12} />
              {formatTime(ride.createdAt)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800">{formatCurrency(ride.fare)}</p>
          {ride.distance && (
            <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
              <Route size={12} />
              {(ride.distance / 1000).toFixed(1)} km
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 mb-2">
        <div className="flex flex-col items-center pt-1">
          <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
          <div className="w-0.5 h-6 bg-gray-300 my-1"></div>
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 truncate">
            {ride.pickup}
          </p>
          <p className="text-sm font-medium text-gray-800 truncate mt-3">
            {ride.destination}
          </p>
        </div>
        <ChevronRight size={16} className="text-gray-400 mt-2" />
      </div>

      {ride.duration && (
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <Timer size={12} />
          <span>{(ride.duration / 60).toFixed(0)} minutes</span>
        </div>
      )}
    </motion.div>
  );
};

export default RideHistory;
