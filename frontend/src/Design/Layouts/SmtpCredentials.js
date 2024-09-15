import React, { useState, useEffect } from "react";

export default function SmtpCredentials(prop) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acc, setAcc] = useState("");
  const [psw, setPsw] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

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

        // Update acc and psw after userData is successfully set
        if (data.data && data.data.smtp) {
          setAcc(data.data.smtp.email);
          setPsw(data.data.smtp.password);
        }
      } else {
        setError(data.message || "Failed to fetch user data");
      }
    } catch (err) {
      setError("Error fetching user data");
    }

    setLoading(false);
  };

  // Function to update SMTP credentials
  const updateSmtpCredentials = async () => {
    setUpdateError("");
    setUpdateMessage("");
    try {
      const response = await fetch("http://localhost:5000/update-smtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: storedUserName, // Assuming username is the same as stored email
          smtpEmail: acc,
          smtpPassword: psw,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateMessage("SMTP details updated successfully.");
      } else {
        setUpdateError(data.message || "Failed to update SMTP details.");
      }
    } catch (err) {
      setUpdateError("Error updating SMTP details.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []); // Automatically fetch user data when component mounts

  useEffect(() => {
    // Log acc and psw after they are updated
    console.log("Account:", acc);
    console.log("Password:", psw);
  }, [acc, psw]); // Log when acc or psw are updated

  return (
    <div>
      <div className="container py-5 smtp">
        <div className="row">
          <div className="col-12">
            <p
              className="back-btn"
              onClick={() => {
                prop.setCurrentPage("dashboard");
              }}
            >
              Back to App List
            </p>
            <h3 className="mt-5 title1">SMTP Credentials</h3>
            <div className="form-card p-4 mt-3">
              <div className="row">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    id="acc"
                    value={acc}
                    onChange={(e) => setAcc(e.target.value)}
                    placeholder="Enter Email Address"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    id="psw"
                    value={psw}
                    onChange={(e) => setPsw(e.target.value)}
                    placeholder="Enter Password"
                    required
                  />
                </div>
                <div className="col-md-3 mx-md-5 submit-btn">
                  <button
                    type="button" // Changing to type="button" to prevent form submission behavior
                    className="btn btn-2 w-100"
                    onClick={updateSmtpCredentials} // Triggering the update function
                  >
                    Update Now
                  </button>
                </div>
              </div>
              {loading && <p>Loading...</p>}
              {error && <p className="text-danger">{error}</p>}
              {updateMessage && <p className="text-success">{updateMessage}</p>}
              {updateError && <p className="text-danger">{updateError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
