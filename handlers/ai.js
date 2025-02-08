import connection from '../utils/db.js';
import { generateDefaultResponse } from '../utils/groqsdk.js';

export const generate_from_keywords = async (req, res) => {
    const session = req.user;
    const keywords = req.body.keywords;
    console.log('keywords: ', keywords);
    if (!keywords || keywords.length === 0) {
        return res.redirect('/');
    }
    const keywordsArray = keywords.split(',').map((keyword) => keyword.trim());

    console.log('array: ', keywordsArray);

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

        const defaultResponse = await generateDefaultResponse(
            user[0],
            keywordsArray
        );

        const { successMessage, errorMessage } = req.session;
        req.session.successMessage = 'Tweet generated successfully';
        req.session.errorMessage = null;
        res.render('tweet', {
            tweet: defaultResponse,
            keywords: keywords,
            successMessage,
            errorMessage,
        });
    } catch (error) {
        console.error('Error testing AI:', error);
        req.session.errorMessage = 'Error testing AI';
        return res.redirect('/');
    }
};
