import connection from '../utils/db.js';
import {
    generateAIResponse,
    generateDefaultResponse,
} from '../utils/groqsdk.js';
import { scanTimeline } from '../utils/twitter.js';

export const getTweet = async (req, res) => {
    // const keywords = req.body.keywords;
    // if (!keywords || keywords.length === 0) {
    //     keywords.push('groq', 'sanity', 'react', 'javascript');
    //     // return res.status(400).send('Missing keywords');
    // }

    const session = req.user;

    const keywords = ['groq', 'sanity', 'react', 'javascript', 'is', 'the'];
    // Query the database
    const userID = 1;
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

    const tweet = await scanTimeline(user[0], keywords);

    res.json({ message: tweet });
};

export const TestAi = async (req, res) => {
    const keywords = req.body.keywords;
    const keywordsArray = keywords.split(',').map((keyword) => keyword.trim());

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
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });

        // const response = await generateAIResponse(user[0], keywords);

        const defaultResponse = await generateDefaultResponse(
            user[0],
            keywordsArray
        );

        res.render('tweet', {
            tweet: defaultResponse,
            keywords: keywords,
        });
    } catch (error) {
        console.error('Error testing AI:', error);
        return res.status(500).json({ message: 'Error testing AI' });
    }
};
