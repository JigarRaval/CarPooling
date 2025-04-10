import React, { useEffect, useState } from "react";
import { ChevronRight, CircleUserRound, History, Menu, X } from "lucide-react";
import Button from "./Button";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const token = localStorage.getItem("token");
  const [showSidebar, setShowSidebar] = useState(false);
  const [newUser, setNewUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    setNewUser(userData);
  }, []);

  const logout = async () => {
    try {
      await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/${newUser.type}/profile`,
        {
          headers: { token },
        }
      );

      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <div
        className="fixed top-4 right-4 z-40 bg-white rounded-full shadow-md p-2 cursor-pointer hover:shadow-lg transition-all"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        {showSidebar ? <X size={24} /> : <Menu size={24} />}
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-30 w-80 h-full bg-white transform transition-transform duration-300 ease-in-out shadow-xl flex flex-col justify-between ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 overflow-y-auto">
          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>

          {/* Avatar and Info */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg text-4xl font-bold select-none">
              {newUser?.data?.fullname?.firstname?.[0]}
              {newUser?.data?.fullname?.lastname?.[0]}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {newUser?.data?.fullname?.firstname}{" "}
              {newUser?.data?.fullname?.lastname}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{newUser?.data?.email}</p>
          </div>

          {/* Menu Links */}
          <div className="space-y-3">
            <SidebarItem
              icon={<CircleUserRound className="text-gray-700" />}
              label="Edit Profile"
              to={`/${newUser?.type}/edit-profile`}
              onClick={() => setShowSidebar(false)}
            />
            <SidebarItem
              icon={<History className="text-gray-700" />}
              label="Ride History"
              to={`/${newUser?.type}/rides`}
              onClick={() => setShowSidebar(false)}
            />
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-gray-100">
          <Button
            title="Logout"
            fun={logout}
            classes="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold"
          />
        </div>
      </div>

      {/* Backdrop */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </>
  );
}

const SidebarItem = ({ icon, label, to, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-gray-800 font-medium">{label}</span>
    </div>
    <ChevronRight className="text-gray-500" size={18} />
  </Link>
);

export default Sidebar;
