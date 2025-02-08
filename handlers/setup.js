import connection from '../utils/db.js';

export const setup = async (req, res) => {
    const session = req.user;
    try {
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

        // check if user already exists then update
        const user = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM users WHERE email = ? limit 1',
                [session.email],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });

        if (user.length === 0) {
            return res.render('setup', { models, user: null });
        }

        const { successMessage, errorMessage } = req.session;
        req.session.successMessage = null;
        req.session.errorMessage = null;

        return res.render('setup', {
            models,
            user: user[0],
            successMessage,
            errorMessage,
        });
    } catch (error) {
        console.error('Error getting user:', error);
        return res.status(500).json({ message: 'Error getting user' });
    }
};

export const saveSetup = async (req, res) => {
    const session = req.user;
    const { model, name, prompt } = req.body;
    try {
        await new Promise((resolve, reject) => {
            connection.query(
                'UPDATE users SET name = ?, ai_model = ?, default_prompt = ? WHERE email = ?',
                [name, model, prompt, session.email],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });
        req.session.successMessage = 'Setup saved successfully';
        return res.redirect('/api/edit_credentials');
    } catch (error) {
        console.error('Error setting model:', error);
        req.session.errorMessage = 'Error setting model';
        return res.redirect('/setup');
    }
};
