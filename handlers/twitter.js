import connection from '../utils/db.js';
import { scanTimeline } from '../utils/twitter.js';

export const getTweetHandler = async (req, res) => {
    try {
        const keywords = req.body.keywords;
        if (!keywords || keywords.length === 0) {
            return res.redirect('/');
        }

        const keywordsArray = keywords
            .split(',')
            .map((keyword) => keyword.trim());

        // Query the database
        // get the first user
        const user = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT users.*, ai_models.* FROM users LEFT JOIN ai_models ON users.ai_model = ai_models.id LIMIT 1',
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });

        const tweet = await scanTimeline(user[0], keywordsArray);

        return res.render('tweet', { tweet, keywords });
    } catch (error) {
        console.error('Error getting tweet:', error);
        res.redirect('/');
    }
};

export const postTweetHandler = async (req, res) => {
    const { tweet } = req.body;
    if (!tweet) {
        return res.redirect('/');
    }

    try {
        // Query the database
        // get the first user
        const user = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT users.*, ai_models.* FROM users LEFT JOIN ai_models ON users.ai_model = ai_models.id LIMIT 1',
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });

        const response = await postTweet(user[0], tweet);

        return res.redirect('/');
    } catch (error) {
        console.error('Error posting tweet:', error);
        res.redirect('/');
    }
};
