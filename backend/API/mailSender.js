const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Optional: For handling environment variables

// Create a router object
const router = express.Router();

// SMTP Transporter Configuration (to be dynamically set)
let transporter;

// Load user data from JSON file
const loadUserData = () => {
  const filePath = path.join(__dirname, "userData.json");
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
};

// Endpoint to send email
router.post("/send-email", (req, res) => {
  const { to, subject, text, html } = req.body;

  // Load user data
  const users = loadUserData();

  // Find the user by email
  const user = users.find((u) => u.email === to);

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  // Log user data to console
  console.log("User Data:", user);

  // Configure the SMTP transporter based on user-specific SMTP credentials
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // Or use 465 for secure
    secure: false, // true for port 465, false for port 587
    auth: {
      user: user.smtp.email, // Use the user's email for SMTP
      pass: user.smtp.password, // Use the user's SMTP password
    },
    tls: {
      rejectUnauthorized: false, // Only use this for debugging. In production, set this to true.
    },
    logger: true, // Enable logging
    debug: true, // Include debugging output
  });

  const mailOptions = {
    from: user.smtp.email, // Sender address from user data
    to, // Recipient's email address
    subject, // Email subject
    text, // Plain text body
    html, // HTML body (optional)
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res
        .status(500)
        .send({ error: "Failed to send email", details: error });
    }
    res.status(200).send({ message: "Email sent successfully!", info });
  });
});

module.exports = router;
