require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); // ✅ Import http for WebSockets
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app); // ✅ Create HTTP Server
const wss = new WebSocket.Server({ server }); // ✅ WebSocket server attached

// ✅ CORS Configuration
const allowedOrigins =
  process.env.NODE_ENV === "development"
    ? ["http://localhost:3000"]
    : ["https://techsidra-my-portfolio-wn9h.vercel.app"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json());

// ✅ Connect to MongoDB (Only Once)
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MongoDB URI is missing! Set MONGO_URI in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define Contact Schema & Model
const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", ContactSchema);

// ✅ API Routes
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const newMessage = new Contact({ name, email, message });
    await newMessage.save();
    res.status(201).json({ message: "Message saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving message:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/contact", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("❌ Error retrieving messages:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ WebSocket Handling
wss.on("connection", (ws) => {
  console.log("✅ WebSocket connected");

  ws.on("message", (message) => {
    console.log("💬 Received:", message);
    ws.send("Message received!");
  });

  ws.on("close", () => console.log("⚠️ WebSocket disconnected"));
});

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running! 🚀");
  });
  
  // API route
  app.get("/api/projects", (req, res) => {
    res.json({ message: "Projects API is working!" });
  });

// ✅ Start Server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

process.on("SIGTERM", () => {
    console.log("Received SIGTERM. Gracefully shutting down...");
    process.exit(0);
  });
  
  const projectsRoutes = require("./routes/projects");
app.use("/api/projects", projectsRoutes);
