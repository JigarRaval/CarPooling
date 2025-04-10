const asyncHandler = require("express-async-handler");
const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");

module.exports.registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname, email, password } = req.body;

  const alreadyExists = await userModel.findOne({ email });

  if (alreadyExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await userService.createUser(
    fullname.firstname,
    fullname.lastname,
    email,
    password
  );

  const token = user.generateAuthToken();
  res
    .status(201)
    .json({ message: "User registered successfully", token, user });
});

module.exports.loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    res.status(404).json({ message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(404).json({ message: "Invalid email or password" });
  }

  const token = user.generateAuthToken();
  res.cookie("token", token);
  res.json({ message: "Logged in successfully", token, user });
});

module.exports.userProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { userData } = req.body;
  console.log(req.body);
  const updatedUserData = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    userData,
    { new: true }
  );

  res
    .status(200)
    .json({ message: "Profile updated successfully", user: updatedUserData });
});

module.exports.logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.token;

  await blacklistTokenModel.create({ token });

  res.status(200).json({ message: "Logged out successfully" });
});
