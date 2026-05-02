const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(__dirname));

const API_KEY = process.env.GEMINI_API_KEY;

// 🔥 FALLBACK FUNCTION (VERY IMPORTANT)
function getFallbackResponse(query) {
    query = query.toLowerCase();

    if (query.includes("how to vote")) {
        return "To vote in India: 1) Register as a voter, 2) Check your name in voter list, 3) Visit polling booth, 4) Show valid ID, 5) Cast your vote.";
    }

    if (query.includes("voting age")) {
        return "The legal voting age in India is 18 years.";
    }

    if (query.includes("election")) {
        return "Elections in India are conducted by the Election Commission of India in a structured process.";
    }

    if (query.includes("voter id")) {
        return "You can apply for a Voter ID online via the NVSP portal or visit your nearest election office.";
    }

    return "⚠️ AI is busy right now, but I can still help! Try asking about voting process, eligibility, or elections.";
}

// 🔥 Helper: Call Gemini API
async function callGemini(userMessage) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: userMessage }]
                    }
                ]
            })
        }
    );

    return await response.json();
}

// 🔥 CHAT ROUTE
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        let data = await callGemini(userMessage);

        console.log("🔥 GEMINI RESPONSE:", JSON.stringify(data, null, 2));

        let reply;

        // ✅ SUCCESS
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            reply = data.candidates[0].content.parts[0].text;
        }

        // 🔁 RETRY ON QUOTA
        else if (data?.error?.code === 429) {
            console.log("⚠️ Quota hit — using fallback");
            reply = getFallbackResponse(userMessage);
        }

        // 🚨 OTHER ERRORS
        else if (data?.error) {
            console.log("❌ Gemini Error:", data.error);
            reply = getFallbackResponse(userMessage);
        }

        // ❓ UNKNOWN CASE
        else {
            reply = getFallbackResponse(userMessage);
        }

        res.json({ reply });

    } catch (error) {
        console.error("❌ SERVER ERROR:", error);
        res.status(500).json({
            reply: "⚠️ Server error. Please try again later."
        });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
});