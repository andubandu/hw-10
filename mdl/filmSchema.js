const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  img: { type: String, required: true },
  director: { type: mongoose.Schema.Types.ObjectId, ref: 'Director', required: true }
});

const Film = mongoose.model('Film', filmSchema);

module.exports = Film;