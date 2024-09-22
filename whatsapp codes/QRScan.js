const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const OpenAI = require("openai");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

let qrCodeDataUrl = null;
let clientReady = false; // Variable to track client readiness

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

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
        // Store the connection to notify later
        client.once("ready", () => {
            res.write(`data: ${JSON.stringify({ status: "ready" })}\n\n`);
        });
    }
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox"],
        timeout: 60000,
    },
});

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

client.on("ready", () => {
    console.log("Client is ready!");
    clientReady = true; // Update readiness status
});

client.on("error", (error) => {
    console.error("An error occurred:", error);
});

client.on("disconnected", (reason) => {
    console.log("Client was logged out:", reason);
    clientReady = false; // Reset readiness status on disconnection
});

client.initialize().catch((error) => {
    console.error("Failed to initialize client:", error);
});

app.post("/send-message", async(req, res) => {
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`HTTP server is running on port ${PORT}`);
});