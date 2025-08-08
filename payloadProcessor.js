// Run: node payloadProcessor.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const ProcMsg = require('./models/ProcessedMessage');

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for payload processing');
};

const toDate = (ts) => {
  if (!ts) return new Date();
  // some payloads provide seconds, others ms
  const n = Number(ts);
  return n > 1e12 ? new Date(n) : new Date(n * 1000);
};

const extractFromWebhook = (json) => {
  // returns { messages: [], statuses: [] }
  const out = { messages: [], statuses: [] };

  // Common WhatsApp Business format:
  // - contacts + messages
  // - statuses

  if (json?.messages) {
    json.messages.forEach(m => {
      const wa_id = m.from || m.author || m.recipient || (m.sender && m.sender.id) || null;
      const text = m.text?.body || (m.body) || (m.message) || '';
      const id = m.id || m._id || m.message_id;
      const ts = m.timestamp || m.time || m.t || m.date;
      out.messages.push({
        wa_id,
        name: (json.contacts && json.contacts.find(c => c.wa_id === wa_id)?.profile?.name) || m.profile?.name || null,
        number: wa_id,
        message: text,
        timestamp: toDate(ts),
        meta_msg_id: id
      });
    });
  }

  // look for statuses array
  if (json?.statuses) {
    json.statuses.forEach(s => {
      out.statuses.push({
        meta_msg_id: s.id || s.message_id,
        status: s.status,
        timestamp: toDate(s.timestamp)
      });
    });
  }

  // sometimes payload is top-level message object
  if (json?.type === 'message' || json?.type === 'incoming_message' || json?.text) {
    const wa_id = json.from || json.wa_id || json.sender;
    out.messages.push({
      wa_id,
      name: json.name || json.profile?.name,
      number: wa_id,
      message: json.text?.body || json.message || json.body,
      timestamp: toDate(json.timestamp),
      meta_msg_id: json.id || json.meta_msg_id || json.message_id
    });
  }

  // sometimes a status-only payload
  if (json?.type === 'status' || json?.status) {
    out.statuses.push({
      meta_msg_id: json.meta_msg_id || json.id || json.msg_id,
      status: json.status,
      timestamp: toDate(json.timestamp)
    });
  }

  return out;
};

const processFile = async (filePath) => {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const { messages, statuses } = extractFromWebhook(json);

  // insert messages if not exists (by meta_msg_id or by text+wa_id+timestamp)
  for (const m of messages) {
    if (!m.meta_msg_id) {
      // generate a fallback meta id
      m.meta_msg_id = `local_${m.wa_id}_${m.timestamp.getTime()}`;
    }
    const exists = await ProcMsg.findOne({ meta_msg_id: m.meta_msg_id });
    if (!exists) {
      await ProcMsg.create({
        wa_id: m.wa_id,
        name: m.name || null,
        number: m.number || m.wa_id,
        message: m.message,
        timestamp: m.timestamp,
        status: 'sent',
        meta_msg_id: m.meta_msg_id,
      });
      console.log('Inserted message', m.meta_msg_id);
    } else {
      // optionally update fields if changed
      await ProcMsg.updateOne({ meta_msg_id: m.meta_msg_id }, { $set: { message: m.message, timestamp: m.timestamp }});
      console.log('Updated existing message', m.meta_msg_id);
    }
  }

  // update statuses
  for (const s of statuses) {
    if (!s.meta_msg_id) continue;
    const found = await ProcMsg.findOne({ meta_msg_id: s.meta_msg_id });
    if (found) {
      await ProcMsg.updateOne({ meta_msg_id: s.meta_msg_id }, { $set: { status: s.status, timestamp: s.timestamp }});
      console.log('Updated status', s.meta_msg_id, s.status);
    } else {
      console.log('Status refers to unknown message', s.meta_msg_id);
    }
  }
};

const run = async () => {
  await connect();
  const folder = path.join(__dirname, 'payloads');
  if (!fs.existsSync(folder)) {
    console.error('No payloads folder found. Create backend1/payloads and put JSON files there.');
    process.exit(1);
  }

  const files = fs.readdirSync(folder).filter(f => f.endsWith('.json'));
  for (const f of files) {
    console.log('Processing', f);
    await processFile(path.join(folder, f));
  }
  console.log('Done processing payloads');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
