import React, { useState } from "react";
import axios from "axios";
import Header2 from "../Components/Header2";
import "bootstrap/dist/css/bootstrap.min.css";
import config from "../config"; // Import config file

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${config.API_BASE_URL}/login`, {
        email,
        password,
      });
      setMessage(response.data.message);

      if (response.status === 200) {
        // window.alert("Login successful!");

        // Assuming the response includes a userName field
        const userName = email;
        // console.log(object);

        // Store the userName in localStorage
        localStorage.setItem("userName", userName);

        props.setCurrentPage("dashboard");
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("An error occurred during login.");
      }
    }
  };

  return (
    <div>
      <Header2 />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 form-card p-md-5">
            <h2 className="text-center">System Login</h2>
            <h4 className="mb-5">Login to your account to continue</h4>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Login Now
              </button>
              <p
                className="nav-link text-center"
                onClick={() => {
                  props.setCurrentPage("register");
                }}
              >
                Do not have an accont?
              </p>
            </form>

            {/* Display message if it exists */}
            {message && (
              <div
                className={`alert mt-3 ${
                  message.includes("successful")
                    ? "alert-success"
                    : "alert-danger"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
