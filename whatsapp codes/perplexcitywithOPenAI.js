require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fetch = require("node-fetch"); // Ensure you have node-fetch installed
const fs = require("fs");
const path = require("path");
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
    return {
      choices: [
        {
          message: {
            content: "Sorry, I couldn't fetch the information at the moment.",
          },
        },
      ],
    };
  }
}

// Function to encode image to base64
function encodeImage(imagePath) {
  const image = fs.readFileSync(imagePath);
  return Buffer.from(image).toString("base64");
}

// Function to extract text from image using OpenAI Vision API
async function extractTextFromImage(imagePath) {
  const base64Image = encodeImage(imagePath);

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What’s in this image? describe the image in a single paragraph. if there are handwriting or text, provide the answers for that identified text",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  return response.data;
}

// Define the uploads folder path
const uploadsDir = path.join(__dirname, "upload");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Listen for incoming messages
client.on("message", async (message) => {
  console.log("Message received: " + message.body);

  // Check if the message contains an image
  if (message.hasMedia) {
    const media = await message.downloadMedia();

    // Define the path where the image will be saved
    const imagePath = path.join(uploadsDir, `${message.id.id}.jpg`);

    // Save the image to the file system
    fs.writeFileSync(imagePath, media.data, { encoding: "base64" });

    // Send a processing message to the user
    await message.reply("Image is processing...");

    try {
      // Extract text or description from the image using OpenAI Vision API
      const result = await extractTextFromImage(imagePath);

      // Reply with the extracted text/description
      await message.reply(result.choices[0].message.content);

      // Delete the image after processing
      fs.unlinkSync(imagePath);
      console.log(
        `Image processed and deleted. View it at: file://${imagePath}`
      );
    } catch (error) {
      console.error("Error processing image:", error.message);
      await message.reply("Sorry, there was an error processing the image.");
    }
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
