import Groq from 'groq-sdk';
import { decrypt } from './utils.js';

export const generateAIResponse = async (user, tweet_text) => {
    const groqApiKey = decrypt(user.groq_api_key);

    const groq = new Groq({ apiKey: groqApiKey });

    try {
        const response = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: user.default_prompt },
                { role: 'user', content: tweet_text },
            ],
            model: user.model_name,
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
            stop: null,
            stream: false,
        });

        const ai_response = response.choices[0].message.content;
        console.log(`Generated AI Response: ${ai_response}`);
        return ai_response;
    } catch (error) {
        console.error('Error generating AI response:', error);
        return "I'm unable to generate a response at the moment.";
    }
};

export const generateDefaultResponse = async (user, keywords) => {
    const keywords_str = keywords.join(', ');

    const default_prompt = `generate an engaging tweet from these keywords: ${keywords_str}`;
    const response = await generateAIResponse(user, default_prompt);
    return response;
};
