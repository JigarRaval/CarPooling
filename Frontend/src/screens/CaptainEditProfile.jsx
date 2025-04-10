import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button, Heading, Input } from "../components";
import axios from "axios";
import { useCaptain } from "../contexts/CaptainContext";
import { ArrowLeft, CheckCircle2, Car, Bike, Clock } from "lucide-react";
import { motion } from "framer-motion";

function CaptainEditProfile() {
  const token = localStorage.getItem("token");
  const [responseError, setResponseError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { captain } = useCaptain();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors, isDirty },
    watch,
  } = useForm({
    defaultValues: {
      firstname: captain?.fullname?.firstname || "",
      lastname: captain?.fullname?.lastname || "",
      email: captain?.email || "",
      phone: captain?.phone || "",
      color: captain?.vehicle?.color || "",
      number: captain?.vehicle?.number || "",
      capacity: captain?.vehicle?.capacity || "",
      type: captain?.vehicle?.type || "car",
    },
  });

  const vehicleType = watch("type");
  const maxCapacity = {
    bike: 2,
    auto: 3,
    car: 4,
  };

  const updateCaptainProfile = async (data) => {
    const captainData = {
      fullname: {
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
      },
      phone: data.phone.trim(),
      vehicle: {
        color: data.color.trim(),
        number: data.number.trim().toUpperCase(),
        capacity: parseInt(data.capacity),
        type: data.type.toLowerCase(),
      },
    };

    try {
      setLoading(true);
      setResponseError("");

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/captain/update`,
        { captainData },
        { headers: { token } }
      );

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        navigate("/captain/home");
      }, 1500);
    } catch (error) {
      setResponseError(
        error.response?.data?.[0]?.msg ||
          "Failed to update profile. Please try again."
      );
      console.error("Update error:", error);
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

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="w-full h-dvh flex flex-col p-4 pt-6 bg-gray-50">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft strokeWidth={2.5} className="h-5 w-5 text-gray-600" />
          </button>
          <Heading
            title={"Edit Profile"}
            className="text-2xl font-bold text-gray-800"
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(updateCaptainProfile)}
          className="flex-1 flex flex-col overflow-auto pb-4"
        >
          <div className="space-y-4 flex-1">
            <Input
              label={"Email Address"}
              type={"email"}
              name={"email"}
              register={register}
              error={errors.email}
              disabled={true}
              className="bg-gray-100"
            />

            <Input
              label={"Phone Number"}
              type={"tel"}
              name={"phone"}
              register={register}
              validation={{
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit phone number",
                },
              }}
              error={errors.phone}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={"First Name"}
                name={"firstname"}
                register={register}
                validation={{
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "Minimum 2 characters required",
                  },
                  maxLength: {
                    value: 30,
                    message: "Maximum 30 characters allowed",
                  },
                }}
                error={errors.firstname}
              />

              <Input
                label={"Last Name"}
                name={"lastname"}
                register={register}
                validation={{
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Minimum 2 characters required",
                  },
                  maxLength: {
                    value: 30,
                    message: "Maximum 30 characters allowed",
                  },
                }}
                error={errors.lastname}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={"Vehicle Color"}
                name={"color"}
                register={register}
                validation={{
                  required: "Color is required",
                  pattern: {
                    value: /^[a-zA-Z]+$/,
                    message: "Please enter a valid color name",
                  },
                }}
                error={errors.color}
              />

              <Input
                label={"Vehicle Capacity"}
                type={"number"}
                name={"capacity"}
                register={register}
                validation={{
                  required: "Capacity is required",
                  min: {
                    value: 1,
                    message: "Minimum capacity is 1",
                  },
                  max: {
                    value: maxCapacity[vehicleType] || 4,
                    message: `Maximum capacity for ${vehicleType} is ${
                      maxCapacity[vehicleType] || 4
                    }`,
                  },
                }}
                error={errors.capacity}
              />
            </div>

            <Input
              label={"Vehicle Number"}
              name={"number"}
              register={register}
              validation={{
                required: "Vehicle number is required",
                pattern: {
                  value: /^[A-Za-z]{2}[0-9]{2}[A-Za-z]{0,2}[0-9]{4}$/,
                  message:
                    "Please enter a valid vehicle number (e.g. MH01AB1234)",
                },
              }}
              error={errors.number}
            />

            <Input
              label={"Vehicle Type"}
              type={"select"}
              options={[
                { value: "car", label: "Car", icon: <Car size={16} /> },
                { value: "bike", label: "Bike", icon: <Bike size={16} /> },
                { value: "auto", label: "Auto", icon: <Clock size={16} /> },
              ]}
              name={"type"}
              register={register}
              validation={{
                required: "Vehicle type is required",
              }}
              error={errors.type}
            />
          </div>

          {/* Messages */}
          {responseError && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-center mb-4 text-red-500"
            >
              {responseError}
            </motion.p>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mb-4 text-green-600"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            title={"Update Profile"}
            loading={loading}
            type="submit"
            disabled={!isDirty || loading}
            className={`mt-6 ${
              !isDirty ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
        </form>
      </div>
    </div>
  );
}

export default CaptainEditProfile;
