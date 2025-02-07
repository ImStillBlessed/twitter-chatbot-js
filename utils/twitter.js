import connection from './db.js';
import { generateDefaultResponse } from './groqsdk.js';
import { decrypt } from './utils.js';
import { TwitterApi } from 'twitter-api-v2';

export const getTwitterClient = async (user) => {
    try {
        const twitterBearerToken = decrypt(user.twitter_bearer_token);
        const twitterAccessSecret = decrypt(user.twitter_access_secret);
        const twitterApiKey = decrypt(user.twitter_api_key);
        const twitterAccessToken = decrypt(user.twitter_access_token);
        const twitterApiSecret = decrypt(user.twitter_api_secret);

        // Create Twitter Client
        const client = new TwitterApi({
            appKey: twitterApiKey,
            appSecret: twitterApiSecret,
            accessToken: twitterAccessToken,
            accessSecret: twitterAccessSecret,
            bearerToken: twitterBearerToken,
        });

        const twitterUser = await client.currentUserV2();

        return { client, userT: twitterUser.data };
    } catch (error) {
        console.error('Error fetching Twitter API key:', error);
        return null;
    }
};

export const scanTimeline = async (user, keywords) => {
    const { client, userT } = await getTwitterClient(user);
    console.log('got client: ', userT.id);

    try {
        const homeTimeline = await client.v2.homeTimeline({
            max_results: 5,
            expansions: [
                'attachments.media_keys',
                'attachments.poll_ids',
                'referenced_tweets.id',
            ],
            'media.fields': ['url'],
        });

        // Check rate limits (this is crucial!)
        const rateLimit = homeTimeline.rateLimit;
        console.log('Rate Limit:', rateLimit);

        if (rateLimit) {
            if (rateLimit.remaining === 0) {
                const resetTime = rateLimit.reset * 1000;
                const timeUntilReset = resetTime - Date.now();

                if (timeUntilReset > 0) {
                    console.warn(
                        `Rate limit hit. Waiting ${
                            timeUntilReset / 1000
                        } seconds.`
                    );

                    throw {
                        message: `Rate limit hit. Wait ${
                            timeUntilReset / 1000
                        } `,
                    };
                    // await new Promise((resolve) =>
                    //     setTimeout(resolve, timeUntilReset + 1000)
                    // ); // Wait +1s buffer
                    // Retry the request after the reset time
                    // return scanTimeline(user, keywords); // Recursive call to retry
                } else {
                    console.warn(
                        'Rate limit reset time has passed but remaining is still 0. Retrying'
                    );
                    return scanTimeline(user);
                }
            }
        }

        console.log('Home Timeline:', homeTimeline);
        console.log('data: ', homeTimeline.data);

        if (homeTimeline.data) {
            for (const tweet of homeTimeline.data) {
                let matchFound = false; // Flag to track if a keyword match is found

                if (keywords) {
                    for (const keyword of keywords) {
                        if (
                            tweet.text
                                .toLowerCase()
                                .includes(keyword.toLowerCase())
                        ) {
                            console.log(`Match found: ${tweet.text}`);
                            matchFound = true;
                            const aiResponse = await generateAIResponse(
                                user,
                                tweet.text
                            ); // Use customPrompt
                            console.log(`AI Response: ${aiResponse}`);
                            // post to twitter
                            // await postToTwitter(
                            //     client,
                            //     aiResponse,
                            //     tweet.id_str
                            // ); // Post to Twitter (pass the client)
                            return aiResponse; // Return the AI response (as in your Python code)
                        }
                    }
                }

                if (!matchFound) {
                    // Only if no match was found for *any* keyword
                    const defaultResponse = generateDefaultResponse();
                    console.log(`Default Response: ${defaultResponse}`);
                    // await postToTwitter(client, defaultResponse, tweet.id_str); // Post default response
                    return defaultResponse; // Return the default response
                }
            }
        } else {
            console.log('No tweets found.');
            const defaultResponse = generateDefaultResponse();
            console.log(`Default Response: ${defaultResponse}`);
            await postToTwitter(client, defaultResponse, tweet.id_str); // Post default response
            return defaultResponse; // Return the default response
        }

        // return homeTimeline;
    } catch (error) {
        console.error('Error scanning timeline:', error);

        // Check for 429 error and handle it (retry with delay)
        if (error.code === 429) {
            console.warn('Rate limit hit. Retrying after delay.');
            const retryAfter = error.headers['retry-after'] || 60; // Get retry-after header or default to 60s
            await new Promise((resolve) =>
                setTimeout(resolve, retryAfter * 1000)
            );
            return scanTimeline(user); // Recursive call to retry
        }

        throw error; // Re-throw other errors
    }
};

export const postTweet = async (user, tweet) => {
    try {
        const { client, userT } = await getTwitterClient(user);
        console.log('got client: ', userT.id);

        const tweet = await client.v2.tweet(tweet);

        return tweet;

        // Post a tweet
    } catch (error) {
        console.error('Error posting tweet:', error);
        return 'Error posting tweet';
    }
};
