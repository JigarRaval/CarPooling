const asyncHandler = require("express-async-handler");
const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");

module.exports.registerCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname, email, password, phone, vehicle } = req.body;

  const alreadyExists = await captainModel.findOne({ email });

  if (alreadyExists) {
    return res.status(400).json({ message: "Captain already exists" });
  }

  const captain = await captainService.createCaptain(
    fullname.firstname,
    fullname.lastname,
    email,
    password,
    phone,
    vehicle.color,
    vehicle.number,
    vehicle.capacity,
    vehicle.type
  );

  const token = captain.generateAuthToken();
  res
    .status(201)
    .json({ message: "Captain registered successfully", token, captain });
});

module.exports.loginCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select("+password");
  if (!captain) {
    res.status(404).json({ message: "Invalid email or password" });
  }

  const isMatch = await captain.comparePassword(password);

  if (!isMatch) {
    return res.status(404).json({ message: "Invalid email or password" });
  }

  const token = captain.generateAuthToken();
  res.cookie("token", token);
  res.json({ message: "Logged in successfully", token, captain });
});

module.exports.captainProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ captain: req.captain });
});

module.exports.updateCaptainProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { captainData } = req.body;
  const updatedCaptainData = await captainModel.findOneAndUpdate(
    { email: req.captain.email },
    captainData,
    { new: true }
  );

  res.status(200).json({
    message: "Profile updated successfully",
    user: updatedCaptainData,
  });
});

module.exports.logoutCaptain = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.token;

  await blacklistTokenModel.create({ token });

  res.status(200).json({ message: "Logged out successfully" });
});
