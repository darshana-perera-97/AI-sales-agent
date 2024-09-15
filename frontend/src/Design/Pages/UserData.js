import React, { useState, useEffect } from "react";
import Header from "../Components/Header";

export default function UserData() {
  const [userData, setUserData] = useState(null);
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

  return (
    <div>
      <Header />
      <div className="contianer">
        <div className="col-lg-4 offset-lg-4 col-md-6 offset-md-3 pt-5">
          <div className="form-card p-5 acc-data">
            {loading && <p>Loading...</p>}

            {error && <p style={{ color: "red" }}>{error}</p>}
            {userData && (
              <div>
                <h2 className="text-center">User Information</h2>
                <h4 className="mb-5">Your Account details will be here</h4>
                <table>
                  <thead></thead>
                  <tbody>
                    <tr>
                      <td>Username</td>
                      <td> - {userData.username}</td>
                    </tr>
                    <tr>
                      <td>Email</td>
                      <td> - {userData.email}</td>
                    </tr>
                    {userData.emailVerification && (
                      <tr>
                        <td>Email Verified</td>
                        <td> - {userData.emailVerification ? "Yes" : "No"}</td>
                      </tr>
                    )}
                    {userData.smtp && (
                      <tr>
                        <td>SMTP Configured</td>
                        <td>
                          {" "}
                          - {userData.smtp.email ? userData.smtp.email : "No"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
