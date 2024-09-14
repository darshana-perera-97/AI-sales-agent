const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Optional: For handling environment variables

// Create a router object
const router = express.Router();

// SMTP Transporter Configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Use 465 for a secure connection (if needed)
  secure: false, // Set to true if using port 465
  auth: {
    user: process.env.SMTP_USER, // Your email address
    pass: process.env.SMTP_PASS, // Your email password or app password
  },
});

// Endpoint to send email
router.post("/send-email", (req, res) => {
  const { to, subject, text, html } = req.body;

  const mailOptions = {
    from: process.env.SMTP_USER, // Sender address
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
