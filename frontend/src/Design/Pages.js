import React, { useState, useEffect } from "react";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Success from "./Pages/Success";
import Dashboard from "./Pages/Dashboard";
import UserData from "./Pages/UserData";
import FormFill from "./Pages/FormFill";

export default function Pages() {
  // Declare state variables to track the current page and random key
  const [currentPage, setCurrentPage] = useState("formSubmit");
  // const [currentPage, setCurrentPage] = useState("register");
  const [randomKey, setRandomKey] = useState("");

  // Function to generate a random 6-digit key
  const generateRandomKey = () => {
    const key = Math.floor(100000 + Math.random() * 900000).toString();
    setRandomKey(key);
  };

  // Generate a new key when the component first mounts or when you want
  useEffect(() => {
    generateRandomKey();
  }, []);

  return (
    <div>
      {currentPage === "register" && (
        <Register setCurrentPage={setCurrentPage} randomKey={randomKey} />
      )}
      {currentPage === "login" && <Login setCurrentPage={setCurrentPage} />}
      {currentPage === "success" && <Success setCurrentPage={setCurrentPage} />}
      {currentPage === "dashboard" && (
        <Dashboard setCurrentPage={setCurrentPage} currentPage={currentPage} />
      )}
      {currentPage === "userData" && (
        <UserData setCurrentPage={setCurrentPage} currentPage={currentPage} />
      )}
      {currentPage === "formSubmit" && (
        <FormFill setCurrentPage={setCurrentPage} currentPage={currentPage} />
      )}
    </div>
  );
}
