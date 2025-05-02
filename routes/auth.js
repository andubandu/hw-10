const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Director = require('../mdl/directorSchema.js');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, birthYear, nationality, password } = req.body;

    if (!name || !birthYear || !nationality || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingDirector = await Director.findOne({ name });
    if (existingDirector) {
      return res.status(400).json({ msg: "Director with this name already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const director = new Director({
      name,
      birthYear,
      nationality,
      password: hashedPassword
    });

    const savedDirector = await director.save();

    const token = jwt.sign({ id: savedDirector._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      msg: "Director registered successfully",
      token,
      director: {
        _id: savedDirector._id,
        name: savedDirector.name,
        birthYear: savedDirector.birthYear,
        nationality: savedDirector.nationality
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
});


router.post('/login', async (req, res) => {
    try {
      const { name, password } = req.body;
  
      const director = await Director.findOne({ name });
      if (!director) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }
  
      const isMatch = await bcrypt.compare(password, director.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }
  
      const token = jwt.sign({ id: director._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
      res.json({
        msg: "Login successful",
        token,
        director: {
          _id: director._id,
          name: director.name,
          birthYear: director.birthYear,
          nationality: director.nationality
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  });
  

module.exports = router;
