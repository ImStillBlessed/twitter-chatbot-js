import connection from '../utils/db.js';
import { generateDefaultResponse } from '../utils/groqsdk.js';

export const generate_from_keywords = async (req, res) => {
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
                'SELECT users.*, ai_models.* FROM users LEFT JOIN ai_models ON users.ai_model = ai_models.id LIMIT 1',
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

        res.render('tweet', {
            tweet: defaultResponse,
            keywords: keywords,
        });
    } catch (error) {
        console.error('Error testing AI:', error);
        return res.redirect('/');
    }
};
