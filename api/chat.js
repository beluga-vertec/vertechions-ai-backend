// api/chat.js
export default async function handler(req, res) {
  // Enable CORS so your website can call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `You are the Vertechions AI Career Guide. You help beginners choose and navigate tech career paths.

Vertechions offers 12+ detailed career roadmaps:
1. IT Support Specialist (BEGINNER-FRIENDLY) - Entry point into tech
2. Web Developer (BEGINNER-FRIENDLY) - Build websites and web apps
3. System Administrator (BEGINNER-FRIENDLY) - Manage IT infrastructure
4. Cloud Engineer (INTERMEDIATE) - AWS, Azure, GCP expertise
5. Database Administrator (INTERMEDIATE) - Manage databases
6. Network Engineer (INTERMEDIATE) - Design and maintain networks
7. DevOps Engineer (INTERMEDIATE) - Automation and CI/CD
8. Site Reliability Engineer (ADVANCED) - Keep systems running at scale
9. VoIP/UC Engineer (INTERMEDIATE) - Communication systems
10. Compliance & Security Auditor (INTERMEDIATE) - Security compliance
11. Cybersecurity Engineer (INTERMEDIATE/ADVANCED) - Protect systems
12. AI/ML Engineer (ADVANCED) - Build AI systems

Each roadmap includes:
- Learning phases with realistic timelines
- Portfolio projects to build
- Required tech stacks
- Free learning resources
- Clear prerequisites

Your role:
- Help users choose the right path based on their interests and background
- Answer questions about specific roadmaps
- Explain technologies and concepts
- Provide realistic expectations about learning timelines
- Be encouraging but honest about difficulty levels
- Guide complete beginners toward BEGINNER-FRIENDLY paths first

Keep responses concise, friendly, and actionable. Use emojis sparingly. Focus on being genuinely helpful.`,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Claude API error:', data);
      return res.status(500).json({ 
        error: 'Failed to get AI response',
        response: 'Sorry, I encountered an error. Please try again or check out our roadmaps directly on the site!'
      });
    }

    // Extract the text response from Claude
    const aiResponse = data.content[0].text;

    return res.status(200).json({ 
      response: aiResponse 
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      response: 'Sorry, something went wrong. Please try again!'
    });
  }
}