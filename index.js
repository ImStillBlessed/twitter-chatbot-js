import express from 'express';
import { editKey, getKeys, Home } from './handlers/apikeys.js';
import dotenv from 'dotenv';
import { getTweetHandler, postTweetHandler } from './handlers/twitter.js';
import _ from 'lodash';
import bodyParser from 'body-parser';
import { generate_from_keywords } from './handlers/ai.js';
import { saveSetup, setup } from './handlers/setup.js';
import { Login } from './auth/login.js';
import cookieParser from 'cookie-parser';
import { authenticateJWT } from './auth/auth.js';
import session from 'express-session';
import { signup } from './auth/signup.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const secretKey = process.env.SECRET_KEY;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use(
    session({
        secret: secretKey,
        resave: false,
        saveUninitialized: true,
    })
);

// set view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
// test if its working

app.get('/', authenticateJWT(), Home); // gets the user and ai models from the database, the user object constains the encrypted api keys and he active ai model id should be displayed on the home page

app.get('/signup', (req, res) => {
    const { successMessage, errorMessage } = req.session;
    req.session.successMessage = null;
    req.session.errorMessage = null;
    res.render('signup.ejs', { successMessage, errorMessage });
}); // signup page

app.get('/login', (req, res) => {
    const { successMessage, errorMessage } = req.session;
    req.session.successMessage = null;
    req.session.errorMessage = null;
    res.render('login.ejs', { successMessage, errorMessage });
});

app.get('/setup', authenticateJWT(), setup);

app.get('/api/setup', authenticateJWT(), (req, res) => {
    const { successMessage, errorMessage } = req.session;
    req.session.successMessage = null;
    req.session.errorMessage = null;
    res.render('save_credentials', { successMessage, errorMessage });
});
app.get('/api/edit_credentials', authenticateJWT(), getKeys);

// edit one apikey at a time
app.post('/api/edit_credentials', authenticateJWT(), editKey);

app.post('/api/get_tweet', authenticateJWT(), getTweetHandler); // req.body.keywords = string[]
app.post('/api/post_tweet', authenticateJWT(), postTweetHandler); // req.body.tweet = string
app.post('/api/ai-response', authenticateJWT(), generate_from_keywords);
app.post('/setup/save', authenticateJWT(), saveSetup);

app.post('/login', Login);
app.post('/signup', signup); // signup page

// login page
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});
// Route to store API keys
// app.get('/api/users', GetUsers);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
