const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const fs = require('fs');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Load historical data
const historicalData = JSON.parse(fs.readFileSync('historical_data.json', 'utf8'));

app.post('/estimate', async (req, res) => {
    const { projectDetails, complexity, teamSize } = req.body;


    // Create a detailed prompt with historical data
    let prompt = `Estimate the development time for a project with the following details: ${projectDetails}\nComplexity: ${complexity}\nTeam Size: ${teamSize}\n\nBased on historical data from similar projects:\n`;

    historicalData.forEach(project => {
        prompt += `\nProject: ${project.projectDetails}\nComplexity: ${project.complexity}\nTeam Size: ${project.teamSize}\nEstimated Time: ${project.estimatedTime}\nActual Time: ${project.actualTime}\n`;
    });

    prompt += "\nConsidering the above data, provide an estimate for the current project.";

    try {
        const response = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: prompt,
            max_tokens: 150,
        });
        res.json({ estimate: response.choices[0].text.trim() });
    } catch (error) {
        res.status(500).send(error.toString());
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
