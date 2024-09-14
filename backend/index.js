const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const registerRoute = require("./API/register");
const adminsendemail = require("./API/adminMail");
const mailSender = require("./API/mailSender");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // To allow requests from your React frontend
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use the registration route
app.use("/", registerRoute);
app.use("/", adminsendemail);
app.use("/", mailSender);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
