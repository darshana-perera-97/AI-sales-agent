import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Header = (prop) => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    emailVerification: false,
    otp: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get stored username from localStorage
  const storedUserName = localStorage.getItem("userName");

  // Function to fetch user data based on the stored username
  const fetchUserData = async () => {
    if (!storedUserName) {
      setError("No user found in localStorage");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/view-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: storedUserName }), // Using storedUserName as the email
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data.data);
      } else {
        setError(data.message || "Failed to fetch user data");
      }
    } catch (err) {
      setError("Error fetching user data");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []); // Automatically fetch user data when component mounts

  // Helper function to get first two letters of the username
  const getUserInitials = (username) => {
    if (!username) return "NA"; // Default if no username is available
    return username.substring(0, 2).toUpperCase(); // Get first two characters
  };

  return (
    <div className="bg-light">
      <div className="container pb-3 mt-0 pt-3">
        <div className="row align-items-center">
          {/* Left Side - Product Name and Subtitle */}
          <div className="col-8">
            <div
              className="d-flex flex-column"
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                prop.setCurrentPage("dashboard");
              }}
            >
              <h5 className="mb-0">
                <span className="product-name">Product Name</span>
              </h5>
              <small className="text-muted">Sub Title is here</small>
            </div>
          </div>

          {/* Right Side - User Info */}
          <div className="col-4 d-flex justify-content-end align-items-center">
            <div
              className="d-flex align-items-center"
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                prop.setCurrentPage("userData");
              }}
            >
              {/* Circle with Initials */}
              <div className="user-initials-circle d-flex justify-content-center align-items-center">
                <span className="user-initials">
                  {getUserInitials(userData.username)}
                </span>
              </div>
              {/* User Name and Email */}
              <div className="ml-3">
                <h6 className="mb-0 mt-2">{userData.username}</h6>
                <small className="text-muted">{storedUserName}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
