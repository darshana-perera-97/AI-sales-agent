// Load environment variables from .env file
require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fetch = require("node-fetch"); // Ensure you have node-fetch installed
const fs = require("fs");
const path = require("path");

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
});

// Function to fetch response from Perplexity API
async function fetchResponseFromPerplexity(userMessage) {
  const apiKey = process.env.API_KEY; // Get API key from .env file

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content:
            "Provide simple short answers. Like a human is handling the chat. Use a conversation model for this like you are a person chatting.",
        },
        { role: "user", content: userMessage },
      ],
      max_tokens: 500,
      temperature: 1.0,
      top_p: 0.9,
      return_citations: true,
      search_domain_filter: ["perplexity.ai"],
      return_images: false,
      return_related_questions: false,
      search_recency_filter: "month",
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1,
    }),
  };

  try {
    const response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      options
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data; // Return the response data
  } catch (error) {
    console.error("Fetch error:", error);
    return "Sorry, I couldn't fetch the information at the moment.";
  }
}

// Define the downloads folder path
const downloadsDir = path.join(__dirname, "downloads");

// Ensure the downloads directory exists
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Listen for incoming messages
client.on("message", async (message) => {
  console.log("Message received: " + message.body);

  // Check if the message contains an image
  if (message.hasMedia) {
    const media = await message.downloadMedia();

    // Define the path where the image will be saved
    const imagePath = path.join(downloadsDir, `${message.id.id}.jpg`);

    // Save the image to the file system
    fs.writeFileSync(imagePath, media.data, { encoding: "base64" });

    // Log the image as a link in the console
    console.log(`Image received. View it at: file://${imagePath}`);
  } else {
    // Fetch a response from the Perplexity API for text messages
    const apiResponse = await fetchResponseFromPerplexity(message.body);

    // Send the AI response as a reply
    message.reply(apiResponse.choices[0].message.content);
  }
});

// Handle disconnection events
client.on("disconnected", (reason) => {
  console.log("Client was logged out:", reason);
});

// Start the client
client.initialize().catch((error) => {
  console.error("Failed to initialize client:", error);
});
