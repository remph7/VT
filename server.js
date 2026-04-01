import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/private-message', async (req, res) => {
  try {
    const { message, passcode } = req.body;

    if (passcode !== process.env.SECRET_PASSCODE) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (message.trim().length > 3000) {
      return res.status(400).json({ error: 'Message is too long.' });
    }

    const { error } = await supabase
      .from('private_messages')
      .insert([
        {
          message: message.trim()
        }
      ]);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Could not save message.' });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});