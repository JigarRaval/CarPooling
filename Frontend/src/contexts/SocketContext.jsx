import React, { createContext, useContext, useEffect } from "react";
import { io } from "socket.io-client";

export const SocketDataContext = createContext();

const socket = io(`${import.meta.env.VITE_SERVER_URL}`); // Replace with your server URL

function SocketContext({ children }) {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }, []);

  return (
    <SocketDataContext.Provider value={{ socket }}>
      {children}
    </SocketDataContext.Provider>
  );
}

export default SocketContext;
