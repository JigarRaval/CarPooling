import axios from "axios";
import { ArrowLeft, Send } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { SocketDataContext } from "../contexts/SocketContext";

function ChatScreen() {
  const { rideId, userType } = useParams();
  const navigation = useNavigate();
  const scrollableDivRef = useRef(null);

  const { socket } = useContext(SocketDataContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [userData, setUserData] = useState({});
  const [socketID, setSocketID] = useState({});

  const scrollToBottom = () => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop =
        scrollableDivRef.current.scrollHeight;
    }
  };

  const getUserDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/chat-details/${rideId}`
      );
      if (userType == "user") {
        setUserData(response.data.captain);
      }
      if (userType == "captain") {
        setUserData(response.data.user);
      }
      const socketIds = {
        user: response.data.user.socketId,
        captain: response.data.captain.socketId,
      };
      setSocketID(socketIds);
    } catch (error) {
      console.log("No such ride exists.");
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit("message", { rideId: rideId, msg: message });
    setMessages((prev) => [...prev, { msg: message, by: "me" }]);

    setMessage("");
  };

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    getUserDetails();

    socket.emit("join-room", rideId);

    socket.on("receiveMessage", (msg) => {
      // console.log("Received message: ", msg);
      setMessages((prev) => [...prev, { msg, by: "other" }]);
      scrollToBottom();
    });

    scrollToBottom();

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  return (
    <div className="flex flex-col h-dvh">
      {/* header */}
      <div className="flex h-fit items-center p-3 bg-green-50 border-b-2 border-b-green-600 gap-2">
        <ArrowLeft
          strokeWidth={3}
          className="cursor-pointer"
          onClick={() => navigation(-1)}
        />
        <div className="select-none rounded-full w-10 h-10 bg-green-600 flex items-center justify-center">
          <h1 className="text-lg font-semibold text-white">
            {userData?.fullname?.firstname[0]}
            {userData?.fullname?.lastname[0]}
          </h1>
        </div>

        <div>
          <h1 className="text-lg font-semibold text-black leading-6">
            {userData?.fullname?.firstname} {userData?.fullname?.lastname}
          </h1>
        </div>
      </div>
      <div className="overflow-scroll  h-full" ref={scrollableDivRef}>
        <div className="flex flex-col justify-end  w-full p-3">
          
          {messages.length > 0 &&
            messages.map((message, i) => {
              return (
                <span
                  key={i}
                  className={`${
                    message.by == "me"
                      ? "ml-auto rounded-br-none"
                      : "mr-auto rounded-bl-none"
                  } rounded-xl mb-1 bg-zinc-200 px-3 py-2 text-sm max-w-64 leading-4`}
                >
                  {message.msg}
                </span>
              );
            })}
        </div>
      </div>

      {/* Message */}
      <form
        className="flex items-center p-3 h-fit  gap-2"
        onSubmit={sendMessage}
      >
        <input
          placeholder="Enter message..."
          className="w-full border-2 border-black outline-none  rounded-md p-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          autoFocus
        />
        <button className="cursor-pointer px-1">
          <Send />
        </button>
      </form>
    </div>
  );
}

export default ChatScreen;
