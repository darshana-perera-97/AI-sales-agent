const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const OpenAI = require("openai");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Create a new OpenAI client instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let qrCodeDataUrl = null;
let clientReady = false; // Variable to track client readiness

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Serve the index.html file for QR code display
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve the QR code as JSON
app.get("/qr", (req, res) => {
  if (qrCodeDataUrl) {
    res.json({ qrCode: qrCodeDataUrl });
  } else {
    res.status(503).send("QR code not available yet. Please try again later.");
  }
});

// SSE endpoint to notify when the client is ready
app.get("/status", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (clientReady) {
    res.write(`data: ${JSON.stringify({ status: "ready" })}\n\n`);
  } else {
    client.once("ready", () => {
      res.write(`data: ${JSON.stringify({ status: "ready" })}\n\n`);
    });
  }
});

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
    timeout: 60000,
  },
});

// Generate and display the QR code
client.on("qr", (qr) => {
  console.log("QR code has been generated.");
  qrcode.toDataURL(qr, (err, url) => {
    if (err) {
      console.error("Failed to generate QR code:", err);
    } else {
      qrCodeDataUrl = url;
    }
  });
});

// Log a message when successfully authenticated
client.on("ready", () => {
  console.log("Client is ready!");
  clientReady = true; // Update readiness status
});

// Error handling
client.on("error", (error) => {
  console.error("An error occurred:", error);
});

// Handle disconnection events
client.on("disconnected", (reason) => {
  console.log("Client was logged out:", reason);
  clientReady = false; // Reset readiness status on disconnection
});

// Handle incoming WhatsApp messages
client.on("message", async (message) => {
  console.log(`Message received from: ${message.from} : ${message.body}`);

  // Forward the message to OpenAI and get a response
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Darshana Perera is the Marketing Manager at ABC Company, a Colombo 20-based leader in chatbot solutions for WhatsApp and web platforms. Under the guidance of CEO is Dulangi, the company specializes in AI-driven customer engagement tools. In addition to chatbots, ABC Company offers advanced analytics and CRM integration. Darshana drives marketing strategies to enhance brand visibility and customer growth. Provide simple short replies",
        },
        { role: "user", content: message.body },
      ],
    });

    // Send the OpenAI response back to the user on WhatsApp
    const aiResponse = completion.choices[0].message.content;
    message.reply(aiResponse);
  } catch (error) {
    console.error("Error with OpenAI API request:", error);
    message.reply("Sorry, there was an error processing your request.");
  }
});

// Start the client
client.initialize().catch((error) => {
  console.error("Failed to initialize client:", error);
});

// API endpoint to send WhatsApp messages
app.post("/send-message", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).send("Both 'to' and 'message' fields are required.");
  }

  try {
    await client.sendMessage(to, message);
    res.status(200).send("Message sent successfully.");
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send("Failed to send message.");
  }
});

// Start the HTTP server on port 3000
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`HTTP server is running on port ${PORT}`);
});
