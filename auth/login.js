// login.js
import connection from '../utils/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { decrypt } from '../utils/utils.js';

dotenv.config();
const secretKey = process.env.SECRET_KEY;

const Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT password FROM users WHERE email = ?',
                [email],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });
        if (user) {
            const passwordMatch = decrypt(user[0].password) === password;
            if (passwordMatch) {
                const token = jwt.sign({ email, id: user[0].id }, secretKey, {
                    expiresIn: '2h',
                });
                res.cookie('token', token, { httpOnly: true });
                return res.redirect('/');
            } else {
                req.session.errorMessage = 'Invalid email or password';
                return res.redirect('/login');
            }
        }

        // If no user found in any table
        req.session.errorMessage = 'Invalid email or password';
        return res.redirect('/login');
    } catch (error) {
        console.error(error);
        req.session.errorMessage = 'Internal Server error';
        return res.redirect('/login');
    }
};

export { Login };
