const mongoose = require('mongoose');

const ProcMsgSchema = new mongoose.Schema({
  wa_id: String,
  name: String,
  number: String,
  message: String,
  timestamp: Date,
  status: String,
  meta_msg_id: String,
  external_id: String // in case payload uses `id` or other key
}, { collection: 'processed_messages' });

module.exports = mongoose.model('ProcessedMessage', ProcMsgSchema);
