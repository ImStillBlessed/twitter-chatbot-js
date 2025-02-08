import connection from '../utils/db.js';
import { encrypt } from '../utils/utils.js';

export const StoreKeys = async (req, res) => {
    const session = req.user;
    try {
        const {
            twitter_api_key,
            twitter_api_secret,
            twitter_access_token,
            twitter_access_secret,
            twitter_bearer_token,
            groq_api_key,
        } = req.body;

        // encrypt the keys
        const encryptedKeys = {
            twitter_api_key: encrypt(twitter_api_key),
            twitter_api_secret: encrypt(twitter_api_secret),
            twitter_access_token: encrypt(twitter_access_token),
            twitter_access_secret: encrypt(twitter_access_secret),
            twitter_bearer_token: encrypt(twitter_bearer_token),
            groq_api_key: encrypt(groq_api_key),
        };

        const api_query = `
          UPDATE users
          SET
              twitter_api_key = ?,
              twitter_api_secret = ?,
              twitter_access_token = ?,
              twitter_access_secret = ?,
              twitter_bearer_token = ?,
              groq_api_key = ?
          WHERE email = ?`;

        const result = await new Promise((resolve, reject) => {
            connection.query(
                api_query,
                [
                    encryptedKeys.twitter_api_key,
                    encryptedKeys.twitter_api_secret,
                    encryptedKeys.twitter_access_token,
                    encryptedKeys.twitter_access_secret,
                    encryptedKeys.twitter_bearer_token,
                    encryptedKeys.groq_api_key,
                    session.email,
                ],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });

        return res.redirect('/');
    } catch (error) {
        console.error('Error storing API keys:', error);
        return res.redirect('/setup');
    }
};

export const Home = async (req, res) => {
    const session = req.user;
    try {
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
                    if (!results || results.length === 0) {
                        return reject(new Error('User not found'));
                    }
                    resolve(results[0]);
                }
            );
        });

        if (!user) {
            return res.redirect('/login');
        }

        const models = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM ai_models',
                [],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });

        const { successMessage, errorMessage } = req.session;
        req.session.successMessage = null;
        req.session.errorMessage = null;

        return res.render('index', {
            user,
            models,
            successMessage,
            errorMessage,
        });
    } catch (error) {
        console.error('Error getting user:', error);
        req.session.errorMessage = 'Error getting user';
        return res.redirect('/setup');
    }
};

export const getKeys = async (req, res) => {
    const session = req.user;
    try {
        const user = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM users WHERE email = ?',
                [session.email],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results[0]);
                }
            );
        });

        const { successMessage, errorMessage } = req.session;
        req.session.successMessage = null;
        req.session.errorMessage = null;

        return res.render('edit_credentials', {
            user: user,
            successMessage,
            errorMessage,
        });
    } catch (error) {
        console.error('Error getting user:', error);
        req.session.errorMessage = 'Error getting user';
        return res.redirect('/setup');
    }
};

export const editKey = async (req, res) => {
    const session = req.user;
    const { name, value } = req.body;
    try {
        const encryptedValue = encrypt(value);
        const query = `
            UPDATE users
            SET ${name} = ?
            WHERE email = ?`;

        const result = await new Promise((resolve, reject) => {
            connection.query(
                query,
                [encryptedValue, session.email],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });
        req.session.successMessage = 'Key updated successfully';
        res.redirect('/api/edit_credentials');
    } catch (error) {
        console.error('Error editing key:', error);
        req.session.errorMessage = 'Error editing key';
        return res.redirect('/api/edit_credentials');
    }
};
