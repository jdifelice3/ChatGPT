import React, { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message) return;

    const updatedChat = [...chat, { sender: "user", text: message }];
    setChat(updatedChat);
    setMessage("");

    // Temporary bot message to update as we stream
    let botMessage = { sender: "bot", text: "" };
    setChat((prev) => [...prev, botMessage]);

    const response = await fetch("http://localhost:5000/api/chat-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat: updatedChat }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const pieces = chunk.split("\n\n").filter(Boolean);

      for (const piece of pieces) {
        if (piece.includes("[END]")) return;
        const data = piece.replace("data: ", "");
        botMessage.text += data;

        // Re-render with the updated bot message
        setChat((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...botMessage };
          return updated;
        });
      }
    }
};

  return (
    <div style={{ padding: 20 }}>
      <h1>ChatGPT App</h1>
      <div style={{ marginBottom: 20 }}>
        {chat.map((c, i) => (
          <p key={i}><strong>{c.sender}:</strong> {c.text}</p>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
