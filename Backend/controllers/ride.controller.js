const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/map.service");
const { sendMessageToSocketId } = require("../socket");
const rideModel = require("../models/ride.model");
const userModel = require("../models/user.model");

module.exports.chatDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const ride = await rideModel
      .findOne({ _id: id })
      .populate("user", "socketId fullname phone")
      .populate("captain", "socketId fullname phone");

    if (!ride) {
      return res.status(400).json({ message: "Ride not found" });
    }

    const response = {
      user: {
        socketId: ride.user?.socketId,
        fullname: ride.user?.fullname,
        phone: ride.user?.phone,
      },
      captain: {
        socketId: ride.captain?.socketId,
        fullname: ride.captain?.fullname,
        phone: ride.captain?.phone,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination, vehicleType } = req.body;

  try {
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    const user = await userModel.findOne({ _id: req.user._id });
    if (user) {
      user.rides.push(ride._id);
      await user.save();
    }

    res.status(201).json(ride);

    const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
    console.log("Pickup Coordinates", pickupCoordinates);

    const captainsInRadius = await mapService.getCaptainsInTheRadius(
      pickupCoordinates.ltd,
      pickupCoordinates.lng,
      4,
      vehicleType
    );

    ride.otp = "";

    const rideWithUser = await rideModel
      .findOne({ _id: ride._id })
      .populate("user");

    captainsInRadius.map((captain) => {
      console.log(captain._id);
      sendMessageToSocketId(captain.socketId, {
        event: "new-ride",
        data: rideWithUser,
      });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const { fare, distanceTime } = await rideService.getFare(
      pickup,
      destination
    );
    return res.status(200).json({ fare, distanceTime });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.confirmRide({
      rideId,
      captain: req.captain,
    });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.endRide({ rideId, captain: req.captain });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-ended",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.cancelRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.query;

  try {
    const ride = await rideModel.findOneAndUpdate(
      { _id: rideId },
      {
        status: "cancelled",
      },
      { new: true }
    );
    
    const pickupCoordinates = await mapService.getAddressCoordinate(ride.pickup);
    const captainsInRadius = await mapService.getCaptainsInTheRadius(
      pickupCoordinates.ltd,
      pickupCoordinates.lng,
      4,
      ride.vehicle
    );

    captainsInRadius.map((captain) => {
      sendMessageToSocketId(captain.socketId, {
        event: "ride-cancelled",
        data: ride,
      });
    });
    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
