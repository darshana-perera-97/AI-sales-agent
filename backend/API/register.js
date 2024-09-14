const express = require("express");
const fs = require("fs");
const path = require("path");

// Create a router object
const router = express.Router();

// Define the path to store the file
const filePath = path.join(__dirname, "userData.json");

// Helper function to read and write to the JSON file
const readUsersFromFile = () => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }
  return [];
};

const writeUsersToFile = (users) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf8");
};

// Helper function to generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
};

// Route to handle registration
router.post("/register", (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Basic validation
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  let users = readUsersFromFile();

  const isUsernameDuplicate = users.some((user) => user.username === username);
  const isEmailDuplicate = users.some((user) => user.email === email);

  if (isUsernameDuplicate) {
    return res.status(400).json({ message: "Username already exists" });
  }

  if (isEmailDuplicate) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // Generate OTP
  const otp = generateOtp();

  // Add the new user data to the array, set emailVerification and store OTP temporarily
  const newUser = { username, email, password, emailVerification: false, otp };
  users.push(newUser);

  // Write the updated users array back to the file
  writeUsersToFile(users);

  // Respond with success and send the generated OTP
  res
    .status(200)
    .json({ message: "User registered successfully", otp, data: newUser });
});

// Route to handle OTP verification and update emailVerification status
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  // Read users from file
  let users = readUsersFromFile();

  // Find the user by email
  const userIndex = users.findIndex((user) => user.email === email);

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  if (users[userIndex].otp === otp) {
    // If OTP is correct, update emailVerification to true
    users[userIndex].emailVerification = true;
    users[userIndex].otp = null; // Clear the OTP

    // Save updated users back to the file
    writeUsersToFile(users);

    return res
      .status(200)
      .json({ message: "OTP verified successfully, email verified." });
  } else {
    return res.status(400).json({ message: "Invalid OTP." });
  }
});

// Export the router to use in other files
module.exports = router;
