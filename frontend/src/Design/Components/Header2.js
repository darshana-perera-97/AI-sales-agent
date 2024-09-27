import React from "react";
import config from "../config"; // Import config file
import "bootstrap/dist/css/bootstrap.min.css";

const Header2 = () => {
  return (
    <div className="bg-light">
      <div className="container  py-3">
        <div className="row align-items-center">
          {/* Left Side - Product Name and Subtitle */}
          <div className="col-8">
            <div className="d-flex flex-column">
              <h5 className="mb-0">
                <span className="product-name">Product Name</span>
              </h5>
              <small className="text-muted">Sub Title is here</small>
            </div>
          </div>

          {/* <div className="col-4 d-flex justify-content-end align-items-center">
            <div className="d-flex align-items-center">
              <div className="user-initials-circle d-flex justify-content-center align-items-center">
                <span className="user-initials">Us</span>
              </div>
              <div className="ml-3">
                <h6 className="mb-0 mt-2">User Name</h6>
                <small className="text-muted">EmailAddress@gmail.com</small>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Header2;
