require('dotenv').config();
 const express = require('express');
 const mongoose = require('mongoose');
 const app = express();
 const filmsRoute = require('./routes/films.js');
 const directorsRoute = require('./routes/directors.js');
 const authRoute = require('./routes/auth.js')
 const cors = require('cors');
 const path = require('path');

 
 app.use(express.json());
 app.use(cors());
 app.use(express.static('public'));
 
 mongoose.connect(process.env.URL);
 const db = mongoose.connection;
 db.on('error', (error) => console.error(error));
 db.once('open', () => console.log('connected to mongodb'));
 
 app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));
 });
 app.use('/auth', authRoute);
 app.use('/films', filmsRoute);
 app.use('/directors', directorsRoute);
 
 app.listen(3000, () => {
   console.log('running on http://localhost:3000');
 });