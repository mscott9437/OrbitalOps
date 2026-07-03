const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/chat', async (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
        const ollamaResponse = await fetch(
            'http://localhost:11434/api/generate',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gemma4:e4b',
                    prompt: prompt,
                    stream: true
                })
            }
        );

        const reader = ollamaResponse.body.getReader();
        const decoder = new TextDecoder();

        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.trim()) continue;

                try {
                    const json = JSON.parse(line);

                    if (json.response) {
                        res.write(
                            `data: ${JSON.stringify({
                                text: json.response
                            })}\n\n`
                        );
                    }

                    if (json.done) {
                        res.write(
                            `event: done\ndata: done\n\n`
                        );
                    }
                } catch (err) {
                    console.error('JSON parse error:', err);
                }
            }
        }
    } catch (err) {
        res.write(
            `event: error\ndata: ${err.message}\n\n`
        );
    }

    res.end();
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});