import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "You are to take in an image provided by the user. This image will be a google maps street view image, showing some street that the user has an interest in. You will analyze this image of the street and make suggestions if the street lacks people friendly / environmentally friendly / sustainable characteristics. If the street does seem very sustainable, then there is no need for making suggestions. Keep the suggestions to a maximum of 3. Do not make mention of crosswalks in your response, as they are far too easy of a suggestion."
        },
        {
            type: "image_url",
            image_url: {
                "url": "",
            }
        }
      ]
    },
  ],
  temperature: 1,
  max_tokens: 256,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
});

