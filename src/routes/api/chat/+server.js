import { error } from '@sveltejs/kit';
import { Configuration, OpenAIApi } from "openai";
import {streamText} from 'direcbase-ai' ;
import { OPENAI_API_KEY } from '$env/static/private';

const config = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
const openai = new OpenAIApi(config);

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    const {prompt} = await request.json();

    // Send request to OPENAI and receive response from GPT model
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {role: "system", content: "You are a helpful assistant."},
            {role: "user", content: prompt}
        ],
        max_tokens: 100,
        temperature: 0,
        stream: true
    },
    { responseType: "stream" });

    // Send chunks of text response to client
    return streamText(completion);
}