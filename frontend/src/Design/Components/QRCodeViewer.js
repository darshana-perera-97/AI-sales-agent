import React, { useState, useEffect } from "react";

const QRCodeViewer = () => {
  const [qrCode, setQrCode] = useState(null);
  const [clientReady, setClientReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [masterPrompt, setMasterPrompt] = useState(""); // Single state for both viewing and updating

  const [userData, setUserData] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [error, setError] = useState("");

  // Time in milliseconds before refreshing the page (e.g., 5 seconds)
  const refreshInterval = 8000;

  // Get stored username from localStorage
  const storedUserName = localStorage.getItem("userName");

  // Function to fetch user data based on the stored username
  const fetchUserData = async () => {
    if (!storedUserName) {
      setError("No user found in localStorage");
      return;
    }

    setLoading1(true);
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

    setLoading1(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []); // Automatically fetch user data when component mounts

  // Function to fetch the QR code from the backend
  const fetchQRCode = async () => {
    if (!userData || !userData.wplink) return;

    try {
      const response = await fetch(`${userData.wplink}/qr`);
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setLoading(false);
      } else {
        console.error("Failed to load QR code");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
      setLoading(false);
    }
  };

  // Function to fetch the current master prompt
  const fetchMasterPrompt = async () => {
    if (!userData || !userData.wplink) return;

    try {
      const response = await fetch(`${userData.wplink}/master-prompt`);
      if (response.ok) {
        const data = await response.json();
        setMasterPrompt(data.masterPrompt); // Set the master prompt
      } else {
        console.error("Failed to load master prompt");
      }
    } catch (error) {
      console.error("Error fetching master prompt:", error);
    }
  };

  // Function to update the master prompt
  const updateMasterPrompt = async () => {
    if (!userData || !userData.wplink) return;

    try {
      const response = await fetch(`${userData.wplink}/master-prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPrompt: masterPrompt }), // Send updated master prompt
      });
      if (response.ok) {
        alert("Master prompt updated successfully!"); // Confirmation message
      } else {
        console.error("Failed to update master prompt");
      }
    } catch (error) {
      console.error("Error updating master prompt:", error);
    }
  };

  // Listen for the status of the WhatsApp client
  const checkClientStatus = () => {
    if (!userData || !userData.wplink) return;

    const eventSource = new EventSource(`${userData.wplink}/status`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "ready") {
        setClientReady(true);
        fetchMasterPrompt(); // Fetch the master prompt once the client is connected
      }
    };
  };

  // Fetch QR code and start status check on component mount
  useEffect(() => {
    if (userData) {
      fetchQRCode();
      checkClientStatus();
    }
  }, [userData]); // Depend on userData to fetch QR code and status

  // Reload the page if QR code is not loaded after a certain time
  useEffect(() => {
    if (!qrCode && !clientReady) {
      const refreshTimeout = setTimeout(() => {
        window.location.reload(); // Refresh the page
      }, refreshInterval);

      return () => clearTimeout(refreshTimeout); // Clear timeout if QR code is loaded
    }
  }, [qrCode, clientReady]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>WhatsApp Web QR Code</h1>
      {loading ? (
        <p>Loading QR Code...</p>
      ) : clientReady ? (
        <>
          <p>Client is ready! You can now use WhatsApp Web.</p>
          <h2>Master Prompt</h2>
          <textarea
            value={masterPrompt}
            onChange={(e) => setMasterPrompt(e.target.value)} // Allow editing the master prompt
            rows="10"
            cols="50"
          />
          <br />
          <button onClick={updateMasterPrompt}>Update Prompt</button>
        </>
      ) : qrCode ? (
        <img src={qrCode} alt="WhatsApp QR Code" />
      ) : (
        <p>QR code not available. Please try again later.</p>
      )}
    </div>
  );
};

export default QRCodeViewer;
