import axios from 'axios';

export const analyzeFlowchartWithAI = async (flowchartJson) => {
  const apiUrl = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;

  const prompt =
    'Analyze this flowchart JSON and suggest improvements. Return structured JSON only.';

  if (!apiUrl || !apiKey) {
    return {
      suggestions: ['No AI API configured. This is a mock suggestion.'],
      improvedNodes: [],
      newConnections: []
    };
  }

  const response = await axios.post(
    apiUrl,
    {
      prompt,
      flowchart: flowchartJson
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  return response.data;
};
