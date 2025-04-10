import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button, Heading, Input } from "../components";
import axios from "axios";

// Background image (replace with your preferred Unsplash URL)
const background =
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80";

function CaptainLogin() {
  const [responseError, setResponseError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const navigation = useNavigate();

  const loginCaptain = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/captain/login`,
        data
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          type: "captain",
          data: response.data.captain,
        })
      );
      navigation("/captain/home");
    } catch (error) {
      setResponseError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (responseError) {
      const timer = setTimeout(() => setResponseError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [responseError]);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <img
        src={background}
        alt="Captain Login Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />

      {/* Login Box */}
      <div className="relative z-10 w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-md text-white rounded-2xl shadow-xl p-8 sm:p-10 mx-4">
        <Heading title="Captain Login" />

        <form onSubmit={handleSubmit(loginCaptain)} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            register={register}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            register={register}
            error={errors.password}
          />
          {responseError && (
            <p className="text-sm text-center text-red-400">{responseError}</p>
          )}
          <div className="flex justify-end text-sm mb-2">
            <Link
              to="/forgotPassword"
              className="underline hover:text-gray-200"
            >
              Forgot Password?
            </Link>
          </div>
          <Button title="Login" loading={loading} type="submit" />
        </form>

        <p className="text-sm font-normal text-center mt-4">
          Don't have an account?{" "}
          <Link to="/captain/signup" className="font-semibold underline">
            Sign up
          </Link>
        </p>

        <div className="mt-8">
          <Button
            type="link"
            path="/login"
            title="Login as User"
            classes="bg-green-500 hover:bg-green-600"
          />
        </div>

        <p className="text-xs text-gray-300 mt-6 text-center">
          This site is protected by reCAPTCHA and the Google{" "}
          <span className="underline">Privacy Policy</span> and{" "}
          <span className="underline">Terms of Service</span> apply.
        </p>
      </div>
    </div>
  );
}

export default CaptainLogin;
