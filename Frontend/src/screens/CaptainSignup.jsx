import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button, Heading, Input } from "../components";
import axios from "axios";
import { ArrowLeft, ChevronRight } from "lucide-react";

const background =
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80";

function CaptainSignup() {
  const [responseError, setResponseError] = useState("");
  const [showVehiclePanel, setShowVehiclePanel] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const navigation = useNavigate();

  const signupCaptain = async (data) => {
    const captainData = {
      fullname: {
        firstname: data.firstname,
        lastname: data.lastname,
      },
      email: data.email,
      password: data.password,
      phone: data.phone,
      vehicle: {
        color: data.color,
        number: data.number,
        capacity: data.capacity,
        type: data.type,
      },
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/captain/register`,
        captainData
      );
      localStorage.setItem("token", response.data.token);
      navigation("/captain/home");
    } catch (error) {
      setResponseError(
        error.response?.data?.[0]?.msg ||
          error.response?.data?.message ||
          "Signup failed"
      );
      setShowVehiclePanel(false);
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
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-6">
      {/* Background */}
      <img
        src={background}
        alt="Signup Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />

      {/* Form Box */}
      <div className="relative z-10 w-full max-w-xl bg-white/10 border border-white/20 backdrop-blur-md text-white rounded-2xl shadow-xl p-4 sm:p-6">
        <Heading title="Captain Sign Up" />

        <form onSubmit={handleSubmit(signupCaptain)} className="mt-4 space-y-3">
          {!showVehiclePanel ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                label="Phone Number"
                type="number"
                name="phone"
                register={register}
                error={errors.phone}
              />
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
                <p className="text-sm text-center text-red-400">
                  {responseError}
                </p>
              )}
              <div
                className="cursor-pointer flex justify-center items-center gap-2 py-2.5 font-semibold bg-green-600 hover:bg-green-700 transition rounded-xl"
                onClick={() => setShowVehiclePanel(true)}
              >
                Next <ChevronRight size={18} />
              </div>
            </>
          ) : (
            <>
              <ArrowLeft
                className="cursor-pointer mb-2"
                onClick={() => setShowVehiclePanel(false)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Vehicle Color"
                  name="color"
                  register={register}
                  error={errors.color}
                />
                <Input
                  label="Vehicle Capacity"
                  type="number"
                  name="capacity"
                  register={register}
                  error={errors.capacity}
                />
              </div>
              <Input
                label="Vehicle Number"
                name="number"
                register={register}
                error={errors.number}
              />
              <Input
                label="Vehicle Type"
                type="select"
                options={["Car", "Bike", "Auto"]}
                name="type"
                register={register}
                error={errors.type}
              />
              {responseError && (
                <p className="text-sm text-center text-red-400">
                  {responseError}
                </p>
              )}
              <Button title="Sign Up" loading={loading} type="submit" />
            </>
          )}
        </form>

        <p className="text-sm text-center mt-3">
          Already have an account?{" "}
          <Link to="/captain/login" className="underline font-semibold">
            Login
          </Link>
        </p>

        <div className="mt-4">
          <Button
            type="link"
            path="/signup"
            title="Sign Up as User"
            classes="bg-green-500 hover:bg-green-600"
          />
        </div>

        <p className="text-xs text-gray-300 mt-4 text-center">
          This site is protected by reCAPTCHA and the Google{" "}
          <span className="underline">Privacy Policy</span> and{" "}
          <span className="underline">Terms of Service</span> apply.
        </p>
      </div>
    </div>
  );
}

export default CaptainSignup;
