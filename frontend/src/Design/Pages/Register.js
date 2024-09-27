import React, { useState } from "react";
import Header2 from "../Components/Header2";
import config from "../config"; // Import config file

export default function Register(prop) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false); // State to toggle between forms
  const [otp, setOtp] = useState(""); // State to handle OTP input

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success message

    try {
      // Send registration data to the backend
      const response = await fetch(`${config.API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Please enter the OTP to continue.");
        setShowOtpForm(true); // Show OTP form

        // Use the OTP returned from the backend
        const { otp } = data;

        // Send registration email after successful registration
        const emailResponse = await fetch(
          `${config.API_BASE_URL}/admin-send-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: formData.email, // Send the email to the user's email address
              subject: "Email Verification - Platform Name",
              text: `Hello user,\n\nThank you for registering!`,
              html: `<p>Hello User,</p><p>Thank you for registering!</p><p>Enter <h4>${otp}</h4> as the OTP to verify your email address.</p>`,
            }),
          }
        );

        const emailData = await emailResponse.json();

        if (emailResponse.ok) {
          console.log("Email sent successfully:", emailData);
        } else {
          console.error("Failed to send email:", emailData);
        }
      } else {
        setErrorMessage(data.message); // Show error message from the backend
      }
    } catch (error) {
      setErrorMessage("An error occurred while registering."); // Show generic error message
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any previous errors

    try {
      const response = await fetch(`${config.API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Email verified successfully.");
        prop.setCurrentPage("login"); // Redirect to login page after successful OTP verification
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage("An error occurred during OTP verification.");
    }
  };

  return (
    <div>
      <Header2 />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 form-card p-md-5">
            <h2 className="text-center ">Account Registration</h2>
            <h4 className="mb-5">Create your account to work with Us.</h4>
            {/* Registration form */}
            {!showOtpForm ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="User Name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Register Now
                </button>
                <p
                  className="nav-link text-center"
                  onClick={() => {
                    prop.setCurrentPage("login");
                  }}
                >
                  Already have an accont?
                </p>
              </form>
            ) : (
              // OTP Form
              <form onSubmit={handleOtpSubmit}>
                <div className="mb-3">
                  <label htmlFor="otp" className="form-label">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="otp"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="Enter the OTP"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Submit OTP
                </button>
              </form>
            )}

            {/* Display error message if it exists */}
            {errorMessage && (
              <div className="alert alert-danger mt-3" role="alert">
                {errorMessage}
              </div>
            )}

            {/* Display success message if it exists */}
            {successMessage && (
              <div className="alert alert-success mt-3" role="alert">
                {successMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
