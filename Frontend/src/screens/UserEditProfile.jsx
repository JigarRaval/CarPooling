import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button, Heading, Input } from "../components";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

function UserEditProfile() {
  const token = localStorage.getItem("token");
  const [responseError, setResponseError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: {
      firstname: user?.fullname?.firstname || "",
      lastname: user?.fullname?.lastname || "",
      email: user?.email || "",
    },
  });

  const updateUserProfile = async (data) => {
    const userData = {
      fullname: {
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
      },
    };

    try {
      setLoading(true);
      setResponseError("");
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/update`,
        { userData },
        { headers: { token } }
      );

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error) {
      setResponseError(
        error.response?.data?.[0]?.msg ||
          "Failed to update profile. Please try again."
      );
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
          onSubmit={handleSubmit(updateUserProfile)}
          className="flex-1 flex flex-col"
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

export default UserEditProfile;
