const axios = require("axios");

const SERVER_URL = process.env.SERVER_URL;
const interval = 840000; // 14 Minutes

function reloadWebsite() {
  axios
    .get(SERVER_URL)
    .then((response) => {
      console.log("Server reloaded");
    })
    .catch((error) => {
      console.log("Error reloading server");
    });
}

function keepServerRunning() {
  setInterval(reloadWebsite, interval);
}

module.exports = keepServerRunning;