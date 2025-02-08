import connection from '../utils/db.js';
import { encrypt } from '../utils/utils.js';

export const signup = async (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    try {
        const user = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM users WHERE email = ?',
                [email],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });

        if (user.length > 0) {
            req.session.errorMessage = 'User already exists';
            return res.redirect('/signup');
        }

        if (password !== confirm_password) {
            req.session.errorMessage = 'Passwords do not match';
            return res.redirect('/signup');
        }

        const encryptedPassword = encrypt(password);

        await new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
                [email, encryptedPassword, name],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });

        req.session.successMessage = 'User created successfully';
        return res.redirect('/login');
    } catch (error) {
        console.error('Error signing up:', error);
        req.session.errorMessage = 'Internal Server error';
        return res.redirect('/signup');
    }
};
