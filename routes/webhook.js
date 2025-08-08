const express = require('express');
const router = express.Router();
const ProcMsg = require('../models/ProcessedMessage');

// Generic webhook receiver. Accepts the JSON payloads you have and inserts/updates DB.
router.post('/', async (req, res) => {
  try {
    const json = req.body;

    // Reuse the same extraction logic as payloadProcessor:
    // simple inline handling for common WA shapes:
    if (json?.messages) {
      for (const m of json.messages) {
        const wa_id = m.from || m.author || m.recipient;
        const text = m.text?.body || m.body || m.message;
        const meta = m.id || m.message_id || (m._id);
        const ts = m.timestamp || m.time;
        const timestamp = ts ? (Number(ts) > 1e12 ? new Date(Number(ts)) : new Date(Number(ts) * 1000)) : new Date();

        const exists = await ProcMsg.findOne({ meta_msg_id: meta });
        if (!exists) {
          await ProcMsg.create({
            wa_id,
            name: m.profile?.name || json.contacts?.[0]?.profile?.name || null,
            number: wa_id,
            message: text,
            timestamp,
            status: 'sent',
            meta_msg_id: meta || `hook_${Date.now()}`
          });
        }
      }
    }

    if (json?.statuses) {
      for (const s of json.statuses) {
        const meta = s.id || s.message_id;
        const status = s.status || s.state;
        if (!meta) continue;
        await ProcMsg.findOneAndUpdate({ meta_msg_id: meta }, { status }, { new: true });
      }
    }

    // If nothing matched, try a generic shape
    if (json?.type === 'message' || json?.text) {
      const wa_id = json.from || json.wa_id || null;
      const meta = json.id || json.meta_msg_id || `hook_${Date.now()}`;
      await ProcMsg.create({
        wa_id,
        name: json.name || null,
        number: wa_id,
        message: json.text?.body || json.message || json.body,
        timestamp: new Date(),
        status: 'sent',
        meta_msg_id: meta
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('webhook error', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

module.exports = router;
