const express = require("express");
const Film = require("../mdl/filmSchema.js");
const Director = require("../mdl/directorSchema.js");
const isAuth = require("../mw/isAuth.js");
const axios = require('axios');

const router = express.Router();

const findPoster = async (title) => {
  try {
    const response = await axios.get(`http://www.omdbapi.com/?t=${title}&apikey=${process.env.OMDB_API}`);
    return response.data.Poster || "https://res.cloudinary.com/dyuabsnoo/image/upload/v1744385056/poster_u1gneg.png";
  } catch (error) {
    console.error("Error fetching poster:", error);
    return "https://res.cloudinary.com/dyuabsnoo/image/upload/v1744385056/poster_u1gneg.png";
  }
};

router.get('/', async (req, res) => {
  try {
    const { genre, year } = req.query;
    const query = {};

    if (genre) query.genre = genre;
    if (year) query.year = year;

    const films = await Film.find(query).populate('director', '-password -__v');
    res.json(films);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const film = await Film.findById(req.params.id).populate('director', '-password -__v');
    if (!film) {
      return res.status(404).json({ msg: "film not found" });
    }
    res.json(film);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

router.post('/new', isAuth, async (req, res) => {
  try {
    const { title, year, genre } = req.body;

    if (!title || !year || !genre) {
      return res.status(400).json({ msg: "all fields are required" });
    }

    const poster = await findPoster(title);

    const film = new Film({
      title,
      year,
      genre,
      img: poster,
      director: req.director._id
    });

    const newFilm = await film.save();

    req.director.films.push(newFilm._id);
    await req.director.save();

    await newFilm.populate('director');
    res.status(201).json(newFilm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

router.put('/:id', isAuth, async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) {
      return res.status(404).json({ msg: "film not found" });
    }

    if (film.director.toString() !== req.director._id.toString()) {
      return res.status(403).json({ msg: "not authorized to update this film" });
    }

    Object.assign(film, req.body);
    await film.save();
    await film.populate('director');

    res.json(film);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

router.delete('/:id', isAuth, async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) {
      return res.status(404).json({ msg: "film not found" });
    }

    if (film.director.toString() !== req.director._id.toString()) {
      return res.status(403).json({ msg: "not authorized to delete this film" });
    }

    const director = await Director.findById(film.director);
    if (director) {
      director.films = director.films.filter(filmId => filmId.toString() !== req.params.id);
      await director.save();
    }

    await Film.findByIdAndDelete(req.params.id);
    res.json({ msg: "film deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

module.exports = router;
