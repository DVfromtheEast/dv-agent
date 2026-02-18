import { useEffect, useState } from 'react'
import './App.css'


type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const API_URL = "http://localhost:3001/chat";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("sessionId");
    if (savedSession) {
      setSessionId(savedSession);
    }
  }, []);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("sessionId", data.sessionId);
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <div style={styles.container}>
        <h1>Agent Playground</h1>

        <div style={styles.chatBox}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background:
                  msg.role === "user" ? "#007bff" : "#f1f1f1",
                color: msg.role === "user" ? "white" : "black",
              }}
            >
              {msg.content}
            </div>
          ))}

          {loading && <div>Agent is thinking...</div>}
        </div>
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
          />
          <button style={styles.button} onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>

    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 700,
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    fontFamily: "sans-serif",
  },
  chatBox: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    height: 400,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  message: {
    padding: "10px 14px",
    borderRadius: 12,
    maxWidth: "70%",
  },
  inputRow: {
    display: "flex",
    marginTop: 16,
    gap: 8,
  }, input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: "#007bff",
    color: "white",
    cursor: "pointer",
  },
};