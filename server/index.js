const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { createParser } = require("eventsource-parser");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/chat-stream", async (req, res) => {
  const { chat } = req.body;

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: chat.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
    });

    // Read the stream and forward chunks to client
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${content}\n\n`);
      }
    }

    res.write("data: [END]\n\n");
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error streaming response");
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));