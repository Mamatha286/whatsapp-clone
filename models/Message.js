const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  wa_id: String,
  name: String,
  number: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: String,
  meta_msg_id: String,
});

module.exports = mongoose.model('Message', messageSchema);
