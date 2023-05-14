import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';


import fs from 'fs';
import https from 'https';

const port = 5001;


dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

console.log(process.env.OPENAI_API_KEY);

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req,res) => {
    res.status(200).send({
        message: "Hello from Codex",
    })
});

app.post('/', async (req,res) => {
    try {
        const prompt = req.body.prompt;

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });
        res.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ error })

    }
});


const privateKey = fs.readFileSync('/etc/letsencrypt/live/backend.mrlucasalmeida.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/backend.mrlucasalmeida.com/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
  console.log(`Backend server listening at https://localhost:${port}`);
});