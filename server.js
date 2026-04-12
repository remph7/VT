import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Debug env (remove later)
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded ✅" : "Missing ❌");

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API route
app.post('/api/private-message', async (req, res) => {
  try {
    const { message } = req.body;

    console.log("Incoming message:", message);

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (message.trim().length > 3000) {
      return res.status(400).json({ error: 'Message too long.' });
    }

    const { error } = await supabase
      .from('private_messages')
      .insert([{ message: message.trim() }]);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
