const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");

// Create a new client instance with increased timeout and error handling
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true, // Run in headless mode
    args: ["--no-sandbox"], // Required for some environments
    timeout: 60000, // Increase the timeout to 60 seconds
  },
});

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
  // Optional: add logic to retry initialization or alert on persistent issues
});

// Listen for incoming messages
client.on("message", async (message) => {
  console.log(`Message received: ${message.body}`);

  // Convert the message to lowercase for easier keyword matching
  const lowerCaseMessage = message.body.toLowerCase();

  // Check for specific keywords and respond accordingly
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
  } else if (lowerCaseMessage === "image") {
    // Fetch the image from the URL
    const url =
      "https://cdn.britannica.com/84/73184-050-05ED59CB/Sunflower-field-Fargo-North-Dakota.jpg";

    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const media = new MessageMedia(
        "image/jpeg",
        response.data.toString("base64"),
        "sunflower.jpg"
      );
      await client.sendMessage(message.from, media);
    } catch (error) {
      console.error("Failed to send image:", error);
      message.reply(
        "Sorry, I couldn't retrieve the image. Please try again later."
      );
    }
  } else {
    // Default response if the message doesn't match any predefined keywords
    message.reply(
      "I'm not sure how to respond to that. You can type 'help' to see what I can do."
    );
  }
});

// Handle disconnection events
client.on("disconnected", (reason) => {
  console.log("Client was logged out:", reason);
  // Optional: Add reconnection logic here if necessary
});

// Start the client
client.initialize().catch((error) => {
  console.error("Failed to initialize client:", error);
  // Optional: retry logic or other error handling
});
