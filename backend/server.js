const express = require('express');
const bodyParser = require('body-parser');
const cors = require ('cors');
const dotenv = require('dotenv')
const axios = require('axios')
const OpenAI = require('openai')

dotenv.config()
const app = express();
app.use(cors())
const PORT = 3000;

app.use(bodyParser.json({ limit: '50mb' }));

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//   });

//   openai.create

app.post('/api/analyze', async (req, res) => {
    const { imageUrl } = req.body;
    console.log(imageUrl)

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-4o",
                messages: [
                    {
                        "role": "system",
                        "content": [
                            {
                                "type": "text",
                                "text": "You are to take in an image provided by the user. This image will be a google maps street view image, showing some street that the user has an interest in. You will analyze this image of the street and make suggestions if the street lacks people friendly / environmentally friendly / sustainable characteristics. If the street does seem very sustainable, then there is no need for making suggestions. Keep the suggestions to a maximum of 3. Do not make mention of crosswalks in your response, as they are far too easy of a suggestion. When listing the suggestions, please add a prefix of STARTLIST at the beginning of the whole list and a suffix of ENDLIST at the end of the whole list."
                            },
                        ]
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                image_url: {
                                    url: imageUrl,
                                }
                            }
                        ]
                    }
                ],
                temperature: 1,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error analyzing image');
    }
})

app.post('/api/writeLetter', async (req, res) => {
    const { imageUrl, text } = req.body;
    console.log(imageUrl);
    console.log(text);

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-4o",
                messages: [
                    {
                        "role": "system",
                        "content": [
                            {
                                "type": "text",
                                "text": "You are to take in an image provided by the user. This image will be a google maps street view image, showing some street that the user has an interest in. The user will also provide some text briefly explaining the image, as well as some suggestions on how the street in that image could be improved to be more people friendly / environmentally friendly / sustainable. Your job is to write out a letter to a city council or similar governing body, requesting them to take these suggestions in order to improve the local community.  Keep the suggestions to a MAXIMUM of 3. Do not make mention of crosswalks in your response, as they are far too easy of a suggestion. Try to mention that as a person without an automobile, you find it challenging to walk or cycle through these parts. Since the name of the city or the name of the representatives won'\''t be available to you, you will need to fill in those parts with a blanket name surrounded by angle brackets (e.g. <representative name>). The format should be:\nDear <representative name>,\n\n<body text>\n<suggestion 1>\n<suggestion 2> // optional\n<suggestion 3> // optional\n<closing statement>\n\nSincerely,\n<Your Name>"

                            },
                        ]
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": text
                            },
                            {
                                "type": "image_url",
                                image_url: {
                                    url: imageUrl,
                                }
                            }
                        ]
                    }
                ],
                temperature: 0.43,
                max_tokens: 435,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error writing draft');
    }
})


app.listen(PORT, () => console.log(`App listening on port ${PORT}`));

