// encryptor function to encrypt strings

import crypto from 'crypto';

const SECRET_KEY = process.env.CRYPTO_SECRET; // Must be 32 bytes for AES-256
const IV_LENGTH = 16;

// Encrypt function
export const encrypt = (text) => {
    // Input validation
    if (!text) {
        throw {
            message: 'Encryption input cannot be null or undefined',
            status: 400,
        };
    }

    // Convert to string if not already
    const textToEncrypt = String(text);

    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(SECRET_KEY),
        iv
    );

    let encrypted = cipher.update(textToEncrypt, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt function
export const decrypt = (text) => {
    if (!text) {
        throw {
            message: 'Decryption input cannot be null or undefined',
            status: 400,
        };
    }

    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(SECRET_KEY),
        iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};
