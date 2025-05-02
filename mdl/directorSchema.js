const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const directorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthYear: { type: String, required: true },
  nationality: { type: String, required: true },
  password: { type: String, required: true },
  films: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Film' }]
});

directorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Director', directorSchema);
