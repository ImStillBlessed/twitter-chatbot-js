import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const secretKey = process.env.SECRET_KEY;

const authenticateJWT = () => {
    // Correct: Returns the middleware function
    return (req, res, next) => {
        const token = req.cookies.token; // Or from Authorization header: req.headers.authorization?.split(' ')[1];

        if (token) {
            jwt.verify(token, secretKey, (err, decoded) => {
                if (err) {
                    console.error('JWT verification error:', err);

                    // More robust error handling:
                    if (err.name === 'TokenExpiredError') {
                        // Check for token expiration
                        return res.render('login.ejs', {
                            errorMessage: 'Session Expired!',
                        });
                    } else if (err.name === 'JsonWebTokenError') {
                        // Check for invalid token
                        return res.render('login.ejs', {
                            errorMessage: 'Invalid Token!',
                        });
                    } else {
                        return res.render('login.ejs', {
                            errorMessage: 'Authentication Failed!',
                        });
                    }
                }

                req.user = decoded; // Attach decoded user info to req.user
                next(); // Proceed to the next middleware/route handler
            });
        } else {
            return res.render('login.ejs', {}); // Redirect or render login
        }
    };
};

export { authenticateJWT };
