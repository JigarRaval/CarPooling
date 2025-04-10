import axios from "axios";
import React, { Children, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

function UserProtectedWrapper({ children }) {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }

    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/user/profile`, {
        headers: {
          token: token,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setUser(response.data.user);
          localStorage.setItem("userData", JSON.stringify({
            type: "user",
            data: response.data.user,
          }));
        }
      })
      .catch((err) => {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/login");
      });
  }, [token]);

  return <>{children}</>;
}

export default UserProtectedWrapper;
