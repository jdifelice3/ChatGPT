import React, { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message) return;
    setChat([...chat, { sender: "user", text: message }]);
    setMessage("");

    const res = await axios.post("http://localhost:5000/api/chat", { message });
    setChat((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
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
