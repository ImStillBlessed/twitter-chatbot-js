import connection from '../utils/db.js';

export const setup = async (req, res) => {
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
                'SELECT * FROM users WHERE id = ? limit 1',
                [1],
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

        return res.render('setup', { models, user: user[0] });
    } catch (error) {
        console.error('Error getting user:', error);
        return res.status(500).json({ message: 'Error getting user' });
    }
};

export const saveSetup = async (req, res) => {
    const { model, name, email, prompt } = req.body;
    try {
        // check if user already exists then update
        const user = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM users WHERE id = ?',
                [1],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });

        if (user.length === 0) {
            await new Promise((resolve, reject) => {
                connection.query(
                    'INSERT INTO users (id, name, email, ai_model, default_prompt) VALUES (?, ?, ?, ?, ?)',
                    [1, name, email, model, prompt],
                    (error, results) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(results);
                    }
                );
            });
        } else {
            await new Promise((resolve, reject) => {
                connection.query(
                    'UPDATE users SET name = ?, email = ?, ai_model = ?, default_prompt = ? WHERE id = ?',
                    [name, email, model, prompt, 1],
                    (error, results) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(results);
                    }
                );
            });
        }
        return res.redirect('/api/setup');
    } catch (error) {
        console.error('Error setting model:', error);
        return res.redirect('/setup');
    }
};
