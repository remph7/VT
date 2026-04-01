import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, passcode } = req.body;

    if (passcode !== process.env.SECRET_PASSCODE) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message required.' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase
      .from('private_messages')
      .insert([{ message: message.trim() }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}