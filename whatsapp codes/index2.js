const OpenAI = require("openai");
require("dotenv").config();

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey });

async function main() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello!" },
      ],
    });

    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error with OpenAI API request:", error);
  }
}

main();
