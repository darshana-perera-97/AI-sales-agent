import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import UserData from "./UserData";
import Packages from "../Layouts/Packages";

export default function Dashboard(prop) {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    // Retrieve the userName from localStorage when the component mounts
    const storedUserName = localStorage.getItem("userName");

    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);
  return (
    <div>
      <Header />
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
            <Packages setCurrentPage={prop.setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
