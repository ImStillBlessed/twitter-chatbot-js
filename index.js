import express from 'express';
import { editKey, getKeys, Home } from './handlers/apikeys.js';
import dotenv from 'dotenv';
import { getTweetHandler, postTweetHandler } from './handlers/twitter.js';
import bodyParser from 'body-parser';
import { generate_from_keywords } from './handlers/ai.js';
import { saveSetup, setup } from './handlers/setup.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
// test if its working

app.get('/', Home); // gets the user and ai models from the database, the user object constains the encrypted api keys and he active ai model id should be displayed on the home page
app.get('/setup', setup);
app.post('/setup/save', saveSetup);

app.get('/api/setup', (req, res) => {
    res.render('save_credentials');
});

// edit one apikey at a time
app.get('/api/edit_credentials', getKeys);
app.post('/api/edit_credentials', editKey);

app.post('/api/get_tweet', getTweetHandler); // req.body.keywords = string[]
app.post('/api/post_tweet', postTweetHandler); // req.body.tweet = string

app.post('/api/ai-response', generate_from_keywords);

// Route to store API keys
// app.get('/api/users', GetUsers);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
