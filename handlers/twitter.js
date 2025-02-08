import connection from '../utils/db.js';
import { scanTimeline } from '../utils/twitter.js';

export const getTweetHandler = async (req, res) => {
    const session = req.user;
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
                `SELECT users.*, ai_models.* 
                    FROM users 
                    LEFT JOIN ai_models ON users.ai_model = ai_models.id 
                    WHERE users.email = ? 
                    LIMIT 1`,
                [session.email],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });

        const tweet = await scanTimeline(user[0], keywordsArray);

        req.session.successMessage = 'Tweet generated successfully';
        return res.render('tweet', { tweet, keywords });
    } catch (error) {
        console.error('Error getting tweet:', error);
        req.session.errorMessage = 'Error getting tweet';
        res.redirect('/');
    }
};

export const postTweetHandler = async (req, res) => {
    const session = req.user;
    const { tweet } = req.body;
    if (!tweet) {
        return res.redirect('/');
    }

    try {
        // Query the database
        // get the first user
        const user = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT users.*, ai_models.* 
                    FROM users 
                    LEFT JOIN ai_models ON users.ai_model = ai_models.id 
                    WHERE users.email = ? 
                    LIMIT 1`,
                [session.email],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });

        const response = await postTweet(user[0], tweet);

        req.session.successMessage = 'Tweet posted successfully';
        return res.redirect('/');
    } catch (error) {
        console.error('Error posting tweet:', error);
        req.session.errorMessage = 'Error posting tweet';
        res.redirect('/');
    }
};
