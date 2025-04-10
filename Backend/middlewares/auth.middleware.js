const blacklistTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");

module.exports.authUser = async (req, res, next) => {
  const token = req.cookies.token || req.headers.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ _id: decoded.id }).populate("rides");
    if(!user){
      return res.status(401).json({ message: "Unauthorized User" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized User", error });
  }
};


module.exports.authCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const captain = await captainModel.findOne({ _id: decoded.id }).populate("rides");
    if(!captain){
      return res.status(401).json({ message: "Unauthorized User" });
    }
    req.captain = captain;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized User", error });
  }
};
