import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button, Heading, Input } from "../components";
import axios from "axios";

// Background image (same as CaptainLogin)
const background =
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80";

function UserSignup() {
  const [responseError, setResponseError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const signupUser = async (data) => {
    const userData = {
      fullname: {
        firstname: data.firstname,
        lastname: data.lastname,
      },
      email: data.email,
      password: data.password,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/register`,
        userData
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          type: "user",
          data: response.data.user,
        })
      );
      navigate("/home");
    } catch (error) {
      setResponseError(error.response?.data?.[0]?.msg || "Signup failed.");
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
        alt="Signup Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />

      {/* Signup Box */}
      <div className="relative z-10 w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-md text-white rounded-2xl shadow-xl p-8 sm:p-10 mx-4">
        <Heading title="Create Your Account" />

        <form onSubmit={handleSubmit(signupUser)} className="mt-6 space-y-4">
          <div className="flex gap-4">
            <Input
              label="First Name"
              name="firstname"
              register={register}
              error={errors.firstname}
            />
            <Input
              label="Last Name"
              name="lastname"
              register={register}
              error={errors.lastname}
            />
          </div>

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

          <Button title="Sign Up" loading={loading} type="submit" />
        </form>

        <p className="text-sm font-normal text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold underline">
            Login
          </Link>
        </p>

        <div className="mt-8">
          <Button
            type="link"
            path="/captain/signup"
            title="Sign Up as Captain"
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

export default UserSignup;
