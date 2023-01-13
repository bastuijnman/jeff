const { App, directMention } = require('@slack/bolt');
const { Configuration, OpenAIApi } = require('openai');
const { GiphyFetch } = require('@giphy/js-fetch-api');

// Slack app
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
});

// OpenAPI
const configuration = new Configuration({
    apiKey: process.env.OPENAPI_TOKEN,
});
const openai = new OpenAIApi(configuration);

// Giphy
const gf = new GiphyFetch(process.env.GIPHY_TOKEN)

// Respond to queries
app.message(directMention(), /tell me (.*)/, async ({ say, context }) => {
    const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `${context.matches[1]} in the style of Jeff Goldblum`,
        max_tokens: 64
    });
    await say(completion.data.choices[0].text);
});

// Respond to visuals
app.message(directMention(), /show me (.*)/i, async ({say, context}) => {
    const { data: gifs } = await gf.search(`jeff goldblum ${context.matches[1]}`);
    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    say({
        blocks: [
            {
                type: 'image',
                image_url: gif.images.original.url,
                alt_text: context.matches[1]
            }
        ]
    })
});

// Start slack app
(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Jeff is... uhm... running');
})();