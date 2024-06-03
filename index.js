const express = require('express');
const app = express();
const path = require('path');
const authRoute = require("./routes/auth");
const homeroute=require("./routes/home");
const passport = require('passport');
const localstrategy = require('passport-local');
const session = require('express-session')
const MongoStore = require('connect-mongo')
const ejsMate = require('ejs-mate');
const axios = require('axios'); 
const { isLoggedIn } = require('./middleware');

const Movie = require('./models/movie');
const Playlist = require('./models/playlist');

app.engine('ejs', ejsMate);
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://agarwalkhushi010101:jPw4W1b9LMbU6Il7@test.pfkjps6.mongodb.net/?retryWrites=true&w=majority&appName=test')
    .then(() => {
        console.log("DB Connected");
    })
    .catch((err) => {
        console.log(err);
    });
let dbURL = 'mongodb+srv://agarwalkhushi010101:jPw4W1b9LMbU6Il7@test.pfkjps6.mongodb.net/?retryWrites=true&w=majority&appName=test';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())

const User = require('./models/user');
let secret = 'weneedabettersecretkey';

let store = MongoStore.create({
    secret: secret,
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60
})
const sessionConfig = {
    store: store,
    name: 'ojoio',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 1,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new localstrategy(User.authenticate()));

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

app.use(authRoute)
app.use(homeroute);



const OMDB_API_KEY = '61a97da2'; 

app.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q; 
        const apiUrl = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(searchQuery)}`;
        const response = await axios.get(apiUrl); 
        const searchData = response.data; 
        res.render('search-results', { searchData });
    } catch (error) {
        console.error('Error fetching data from OMDB API:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
})
