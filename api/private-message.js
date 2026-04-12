import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 🔍 Debug logs (REMOVE after testing)
    console.log("ENV CHECK:", {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING"
    });

    console.log("BODY:", req.body);

    const { message } = req.body;

    // ✅ Validation
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message required.' });
    }

    if (message.trim().length > 3000) {
      return res.status(400).json({ error: 'Message too long.' });
    }

    // ✅ Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ✅ Insert message
    const { error } = await supabase
      .from('private_messages')
      .insert([{ message: message.trim() }]);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
