// api/chat.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, pageType } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // System prompts based on page type
    let systemPrompt = '';

    if (pageType === 'career') {
      systemPrompt = `You are the Vertechions AI Career Guide. Help beginners choose and navigate tech career paths.

Vertechions offers 12+ FREE career roadmaps covering IT Support, Web Development, Cloud Engineering, DevOps, SRE, and more.

Your role:
- Help users choose the right career path
- Answer questions about roadmaps and technologies
- Provide realistic expectations about learning timelines
- Be encouraging but honest
- Keep responses concise and actionable`;
    } else {
      systemPrompt = `You are the Vertechions AI Assistant. Help visitors understand Vertechions' business services.

Vertechions Services:
- Website Development (custom, responsive, e-commerce)
- Custom Web Applications (ordering systems, dashboards, portals)
- IT Infrastructure (VoIP, PBX, SBC, network setup)

Based in Kuala Lumpur, Malaysia. 6+ years professional experience.

Your role:
- Answer questions about services
- Explain what we can build
- Be professional and helpful
- Keep responses focused on business value`;
    }

    // Call Google Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found');
      return res.status(500).json({ 
        error: 'API key not configured',
        response: 'Sorry, the service is not properly configured. Please contact support.'
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      return res.status(500).json({ 
        error: 'AI service error',
        response: 'Sorry, I encountered an error connecting to the AI service. Please try again!'
      });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected API response:', data);
      return res.status(500).json({ 
        error: 'Unexpected response format',
        response: 'Sorry, I received an unexpected response. Please try again!'
      });
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ 
      response: aiResponse 
    });

  } catch (error) {
    console.error('Error:', error.message, error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      response: 'Sorry, something went wrong. Please try again!'
    });
  }
}