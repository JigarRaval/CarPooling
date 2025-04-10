require("dotenv").config();
const socket = require("./socket");
const express = require("express");
const { createServer } = require("http");
const app = express();
const server = createServer(app);

socket.initializeSocket(server);

const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const userRoutes = require("./routes/user.routes");
const captainRoutes = require("./routes/captain.routes");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");
const keepServerRunning = require("./services/active.service");
require("./config/db");
const PORT = process.env.PORT || 4000;

app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.ENVIRONMENT == "production") {
  keepServerRunning();
}

app.get("/", (req, res) => {
  res.json("Hello, World!");
});

app.use("/user", userRoutes);
app.use("/captain", captainRoutes);
app.use("/map", mapsRoutes);
app.use("/ride", rideRoutes);

server.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});
