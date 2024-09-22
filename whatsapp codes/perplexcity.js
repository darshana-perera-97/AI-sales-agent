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
async function fetchResponseFromPerplexity(messages) {
  const apiKey = process.env.API_KEY; // Ensure API key is set in .env

  // Ensure messages array is valid
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Invalid message format.");
  }

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online", // Ensure model name is correct
      messages: messages,
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
      // Throw an error if the response status is not OK (200)
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data; // Return the API response data
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

  // Check if the message is "hi" and respond with a fixed welcome message without quoting the message
  if (message.body.toLowerCase() === "hi") {
    await client.sendMessage(
      message.from,
      "Welcome to our service! How can I assist you today?"
    );
    return; // Return early so the message does not go through further processing
  }

  // Check if the message contains a quoted message (message mentioning another message)
  if (message.hasQuotedMsg) {
    const quotedMessage = await message.getQuotedMessage();
    console.log("Quoted message: " + quotedMessage.body);

    // Combine both messages (quoted message and the user's message)
    const combinedMessages = [
      { role: "user", content: `Quoted message: ${quotedMessage.body}` },
      { role: "user", content: `New message: ${message.body}` },
    ];

    // Fetch a response for both the user's message and the quoted message together
    async function fetchResponseFromPerplexity(messages) {
      const apiKey = process.env.API_KEY; // Get API key from .env file

      // Ensure that the messages array is valid
      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error("Invalid message format.");
      }

      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: messages,
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

      console.log(
        "Request payload being sent to Perplexity API:",
        JSON.stringify(options.body, null, 2)
      ); // Log the request payload

      try {
        const response = await fetch(
          "https://api.perplexity.ai/chat/completions",
          options
        );
        if (!response.ok) {
          // If there's an error, log the response status and response text
          const errorText = await response.text();
          console.error(`HTTP error! Status: ${response.status}`, errorText);
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
                content:
                  "Sorry, I couldn't fetch the information at the moment.",
              },
            },
          ],
        };
      }
    }

    // Send the response considering both messages
    await client.sendMessage(
      message.from,
      combinedResponse.choices[0].message.content
    );
    return;
  }

  // Check if the message contains an image
  if (message.hasMedia) {
    const media = await message.downloadMedia();

    // Define the path where the image will be saved
    const imagePath = path.join(uploadsDir, `${message.id.id}.jpg`);

    // Save the image to the file system
    fs.writeFileSync(imagePath, media.data, { encoding: "base64" });

    // Send a processing message to the user
    await client.sendMessage(message.from, "Image is processing...");

    try {
      // Extract text or description from the image using OpenAI Vision API
      const result = await extractTextFromImage(imagePath);

      // Reply with the extracted text/description
      await client.sendMessage(message.from, result.choices[0].message.content);

      // Delete the image after processing
      fs.unlinkSync(imagePath);
      console.log(
        `Image processed and deleted. View it at: file://${imagePath}`
      );
    } catch (error) {
      console.error("Error processing image:", error.message);
      await client.sendMessage(
        message.from,
        "Sorry, there was an error processing the image."
      );
    }
  } else {
    // Fetch a response from the Perplexity API for text messages
    const apiResponse = await fetchResponseFromPerplexity([
      { role: "user", content: message.body },
    ]);

    // Send the AI response as a regular message (without quoting the original message)
    await client.sendMessage(
      message.from,
      apiResponse.choices[0].message.content
    );
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
