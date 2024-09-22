const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const bodyParser = require("body-parser");

// Create a new client instance
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox"],
        timeout: 60000,
    },
});

// Initialize the Express app
const app = express();
app.use(bodyParser.json());

// Generate and display the QR code in the terminal
client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("Scan the QR code above to log in to WhatsApp.");
});

// Log a message when successfully authenticated
client.on("ready", () => {
    console.log("Client is ready!");
});

// Error handling
client.on("error", (error) => {
    console.error("An error occurred:", error);
});

// Listen for incoming messages
client.on("message", (message) => {
    console.log(`Message received: ${message.body}`);

    const lowerCaseMessage = message.body.toLowerCase();

    if (lowerCaseMessage === "hello") {
        message.reply("Hi there! How can I help you today?");
    } else if (lowerCaseMessage === "how are you?") {
        message.reply(
            "I'm just a bot, but I'm here to assist you! How can I help?"
        );
    } else if (lowerCaseMessage === "what's your name?") {
        message.reply("I'm your friendly WhatsApp bot. What's yours?");
    } else if (lowerCaseMessage === "bye") {
        message.reply("Goodbye! Feel free to message me anytime.");
    } else if (lowerCaseMessage.includes("help")) {
        message.reply(
            "Sure! Here's what I can do:\n- Say 'hello' to start a conversation.\n- Ask 'how are you?'\n- Ask 'what's your name?'\n- Say 'bye' to end the conversation.\n- Or type 'help' to see this message again."
        );
    } else {
        message.reply(
            "I'm not sure how to respond to that. You can type 'help' to see what I can do."
        );
    }
});

// Handle disconnection events
client.on("disconnected", (reason) => {
    console.log("Client was logged out:", reason);
});

// API endpoint to send messages
app.post("/send-message", (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ error: "Number and message are required" });
    }

    client
        .sendMessage(number, message)
        .then(() => {
            res.status(200).json({ success: "Message sent" });
        })
        .catch((error) => {
            res.status(500).json({ error: "Failed to send message", details: error });
        });
});

// Start the client and server
client.initialize().catch((error) => {
    console.error("Failed to initialize client:", error);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});