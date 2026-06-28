const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const message = body.message || '';

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: 'Please enter a message.' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: 'The AI service is not configured yet. Please try again later.' })
      };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: text })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: 'The chat service is unavailable right now.' })
    };
  }
};
