const express = require("express");
const Director = require("../mdl/directorSchema.js");
const Film = require("../mdl/filmSchema.js");
const isAuth = require("../mw/isAuth.js");

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const directors = await Director.find().populate('films');
    res.json(directors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const director = await Director.findById(req.params.id).populate('films');
    if (!director) {
      return res.status(404).json({ msg: "director not found" });
    }
    res.json(director);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});


router.put('/:id', isAuth, async (req, res) => {
  try {
    if (req.director._id.toString() !== req.params.id) {
      return res.status(403).json({ msg: "not authorized to update this director" });
    }

    const director = await Director.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('films');
    if (!director) {
      return res.status(404).json({ msg: "director not found" });
    }

    res.json(director);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

router.delete('/:id', isAuth, async (req, res) => {
  try {
    if (req.director._id.toString() !== req.params.id) {
      return res.status(403).json({ msg: "not authorized to delete this director" });
    }

    const director = await Director.findById(req.params.id);
    if (!director) {
      return res.status(404).json({ msg: "director not found" });
    }

    await Film.deleteMany({ director: director._id });
    await Director.findByIdAndDelete(req.params.id);

    res.json({ msg: "director and associated films deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

module.exports = router;
