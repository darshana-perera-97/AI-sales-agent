import React, { useState, useEffect } from "react";
import config from "../config"; // Import config file

const WhatsappBulkMessages = (prop) => {
  const [formData, setFormData] = useState({
    to: "94771461925",
    message: "Type your test message here.",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const storedUserName = localStorage.getItem("userName");
  const [loading1, setLoading1] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchUserData = async () => {
    if (!storedUserName) {
      setError("No user found in localStorage");
      return;
    }

    setLoading1(true);
    setError("");

    try {
      const response = await fetch(`${config.API_BASE_URL}/view-user`, {
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

    setLoading1(false);
  };
  useEffect(() => {
    fetchUserData();
  }, []); // Automatically fetch user data when component mounts

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    fetch(`${userData.wplink}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((result) => {
        setLoading(false);
        setSuccessMessage("Message sent successfully!");
      })
      .catch((error) => {
        setLoading(false);
        // setError("Failed to send the message. Please try again.");
      });
  };

  return (
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
          <h3 className="mt-5 title1">Send Message</h3>
          <div className="form-card p-4 mt-3">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    id="to"
                    name="to"
                    value={formData.to}
                    onChange={handleChange}
                    placeholder="Enter Recipient"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter Message"
                    required
                  />
                </div>
                <div className="col-md-3 mx-md-5 submit-btn">
                  <button type="submit" className="btn btn-2 w-100">
                    Send Now
                  </button>
                </div>
              </div>
              {loading && <p>Loading...</p>}
              {error && <p className="text-danger">{error}</p>}
              {successMessage && (
                <p className="text-success">{successMessage}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsappBulkMessages;
