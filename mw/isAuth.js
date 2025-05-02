// mw/isAuth.js
const jwt = require('jsonwebtoken');
const Director = require('../mdl/directorSchema.js');

async function isAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // expecting "bearer <token>"

  if (!token) {
    return res.status(401).json({ msg: "authorization token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const director = await Director.findById(decoded.id);

    if (!director) {
      return res.status(401).json({ msg: "invalid token" });
    }

    req.director = director; 
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ msg: "invalid token" });
  }
}

module.exports = isAuth;
