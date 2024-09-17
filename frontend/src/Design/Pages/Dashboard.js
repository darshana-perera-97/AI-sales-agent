import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import UserData from "./UserData";
import Packages from "../Layouts/Packages";

export default function Dashboard(prop) {
  const [userName, setUserName] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    // Retrieve the userName from localStorage when the component mounts
    const storedUserName = localStorage.getItem("userName");

    if (storedUserName) {
      setUserName(storedUserName);
    }

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
    fetchUserData();
  }, []);
  return (
    <div>
      <Header setCurrentPage={prop.setCurrentPage} />
      <div className="container dashboard">
        <div className="row">
          <div className="col-md-12 pt-5 pb-4">
            <h3>Welcome, {userName ? userName : "Guest"}!</h3>
          </div>
          <div className="col-md-8">
            <div className="card p-4"> Main asset</div>
          </div>
          <div className="col-md-4">
            <div className="card p-4"> Latest News</div>
          </div>
          <div className="col-md-12 pt-5">
            <h3 className="pb-1">Available Apps</h3>
            <Packages
              setCurrentPage={prop.setCurrentPage}
              userData={userData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
