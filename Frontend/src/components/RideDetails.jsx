import {
  ChevronDown,
  CreditCard,
  MapPinMinus,
  MapPinPlus,
  PhoneCall,
  SendHorizontal,
} from "lucide-react";
import React from "react";
import Button from "./Button";

function RideDetails({
  pickupLocation = "",
  destinationLocation = "",
  selectedVehicle = "car",
  fare = {},
  showPanel,
  setShowPanel,
  showPreviousPanel,
  createRide,
  cancelRide,
  loading,
  rideCreated,
  confirmedRideData,
}) {
  const splitAddress = (address) => {
    const parts = address.split(", ");
    return {
      primary: parts[0],
      secondary: parts.slice(1).join(", "),
    };
  };

  const pickup = splitAddress(pickupLocation);
  const destination = splitAddress(destinationLocation);

  return (
    <div
      className={`fixed inset-x-0 z-20 ${
        showPanel ? "bottom-0" : "-bottom-[60%]"
      } transition-all duration-500 bg-white rounded-t-3xl shadow-xl p-4 pt-2`}
    >
      {/* Panel Drag Handle */}
      <div
        onClick={() => {
          setShowPanel(false);
          showPreviousPanel(true);
        }}
        className="flex justify-center py-2 cursor-pointer"
      >
        <ChevronDown strokeWidth={2.5} className="text-zinc-300" />
      </div>

      {/* Searching animation */}
      {rideCreated && !confirmedRideData && (
        <div className="text-center mb-3">
          <p className="text-sm text-gray-700 font-medium">
            Looking for nearby drivers...
          </p>
          <div className="h-1.5 mt-2 bg-blue-500 rounded-full animate-pulse w-2/3 mx-auto" />
        </div>
      )}

      {/* Vehicle and Driver Info */}
      <div
        className={`flex items-center gap-4 mb-4 ${
          confirmedRideData ? "justify-between" : "justify-center"
        }`}
      >
        <img
          src={
            selectedVehicle === "car" ? "/car.png" : `/${selectedVehicle}.webp`
          }
          className={`${
            confirmedRideData ? "h-20" : "h-12"
          } w-auto object-contain`}
          alt="Selected vehicle"
        />

        {confirmedRideData?._id && (
          <div className="text-right leading-tight">
            <h1 className="text-sm font-medium">
              {confirmedRideData?.captain?.fullname?.firstname}{" "}
              {confirmedRideData?.captain?.fullname?.lastname}
            </h1>
            <p className="font-semibold">
              {confirmedRideData?.captain?.vehicle?.number}
            </p>
            <p className="text-xs text-zinc-500 capitalize">
              {confirmedRideData?.captain?.vehicle?.color}{" "}
              {confirmedRideData?.captain?.vehicle?.type}
            </p>
            <span className="mt-1 inline-block bg-black text-white px-3 py-1 rounded text-sm font-semibold">
              OTP: {confirmedRideData?.otp}
            </span>
          </div>
        )}
      </div>

      {/* Message + Call */}
      {confirmedRideData?._id && (
        <div className="flex gap-2 mb-4">
          <Button
            type="link"
            path={`/user/chat/${confirmedRideData?._id}`}
            title="Message"
            icon={<SendHorizontal size={18} />}
            classes="flex-1 bg-zinc-100 font-medium text-sm text-zinc-800"
          />
          <a
            href={`tel:${confirmedRideData?.captain?.phone}`}
            className="flex items-center justify-center w-14 h-12 rounded-md bg-zinc-100"
          >
            <PhoneCall size={18} color="black" />
          </a>
        </div>
      )}

      {/* Pickup Location */}
      <div className="flex items-start gap-3 border-t pt-3 pb-2">
        <MapPinMinus size={18} className="text-zinc-600 mt-1" />
        <div>
          <h3 className="text-base font-semibold">{pickup.primary}</h3>
          <p className="text-xs text-gray-600">{pickup.secondary}</p>
        </div>
      </div>

      {/* Destination Location */}
      <div className="flex items-start gap-3 border-t pt-3 pb-2">
        <MapPinPlus size={18} className="text-zinc-600 mt-1" />
        <div>
          <h3 className="text-base font-semibold">{destination.primary}</h3>
          <p className="text-xs text-gray-600">{destination.secondary}</p>
        </div>
      </div>

      {/* Fare Info */}
      <div className="flex items-center gap-3 border-t pt-3 pb-2">
        <CreditCard size={18} className="text-zinc-600" />
        <div>
          <h3 className="text-lg font-bold">₹ {fare[selectedVehicle]}</h3>
          <p className="text-xs text-gray-600">Cash</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        {rideCreated || confirmedRideData ? (
          <Button
            title="Cancel Ride"
            loading={loading}
            classes="bg-red-600 hover:bg-red-700"
            fun={cancelRide}
          />
        ) : (
          <Button
            title="Confirm Ride"
            loading={loading}
            fun={createRide}
            classes="bg-primary hover:bg-primary-dark"
          />
        )}
      </div>
    </div>
  );
}

export default RideDetails;
