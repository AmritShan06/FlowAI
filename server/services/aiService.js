import axios from 'axios';

const buildPrompt = (flowchartJson) => {
  return `
You are an expert workflow designer.

Analyze this flowchart JSON and suggest concrete improvements.

- Identify missing steps or validations.
- Suggest clearer node labels.
- Propose better ordering / branching when appropriate.
- Highlight unreachable nodes or missing Start/End nodes.

Return STRICT JSON only in this exact shape:
{
  "suggestions": string[],
  "improvedNodes": Array<{ "id": string, "data": { "label": string } }>,
  "newConnections": Array<{ "source": string, "target": string }>
}

Rules:
- Use ONLY existing node ids found in the provided flowchart JSON for improvedNodes.
- Do not add edges that reference non-existent ids.
- Return JSON only (no markdown, no backticks, no extra commentary).

Here is the flowchart JSON:
${JSON.stringify(flowchartJson)}
`;
};

const extractJson = (text) => {
  if (!text || typeof text !== 'string') return null;

  const trimmed = text.trim();
  // Common Gemini responses may include code fences
  const withoutFences = trimmed.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();

  // If it already looks like JSON, try parsing directly
  if (withoutFences.startsWith('{') || withoutFences.startsWith('[')) {
    try {
      return JSON.parse(withoutFences);
    } catch (e) {
      // fall through to brace extraction
    }
  }

  // Try to find the first/last JSON object in the text
  const firstBrace = withoutFences.indexOf('{');
  const lastBrace = withoutFences.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const maybeJson = withoutFences.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(maybeJson);
    } catch (e) {
      return null;
    }
  }

  return null;
};

const heuristicSuggest = (flowchartJson) => {
  const nodes = flowchartJson?.nodes || [];
  const edges = flowchartJson?.edges || [];

  const suggestions = [];
  const improvedNodes = [];
  const newConnections = [];

  const hasStart = nodes.some((n) => n.data?.nodeType === 'start');
  const hasEnd = nodes.some((n) => n.data?.nodeType === 'end');

  if (!hasStart) {
    suggestions.push('Add a dedicated "Start" node as the entry point.');
  }
  if (!hasEnd) {
    suggestions.push('Add an explicit "End" node to clearly terminate the flow.');
  }

  nodes.forEach((n) => {
    const label = n.data?.label || '';
    if (label.toLowerCase().includes('process')) {
      improvedNodes.push({
        id: n.id,
        data: {
          label: `${label} • be more specific about what this step does`
        }
      });
    }
  });

  if (nodes.length >= 2 && edges.length === 0) {
    for (let i = 0; i < nodes.length - 1; i++) {
      newConnections.push({ source: nodes[i].id, target: nodes[i + 1].id });
    }
    suggestions.push('Connect the main steps so there is a clear execution path.');
  }

  if (suggestions.length === 0 && improvedNodes.length === 0 && newConnections.length === 0) {
    suggestions.push('Consider adding validation and error-handling steps to your flow.');
  }

  return { suggestions, improvedNodes, newConnections };
};

export const analyzeFlowchartWithAI = async (flowchartJson) => {
  const apiUrl = process.env.AI_API_URL; // Gemini: https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent
  const apiKey = process.env.AI_API_KEY; // Gemini API key from Google AI Studio

  if (!apiUrl || !apiKey) {
    return heuristicSuggest(flowchartJson);
  }

  const prompt = buildPrompt(flowchartJson);

  // Gemini generateContent expects:
  // POST <apiUrl>?key=<apiKey>
  // body: { contents: [{ role:'user', parts:[{ text: prompt }] }], generationConfig: { responseMimeType:'application/json', ... } }
  const url = apiUrl.includes('key=')
    ? apiUrl
    : `${apiUrl}?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await axios.post(
      url,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const text =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ||
      null;

    const parsed = extractJson(text);
    if (!parsed) return heuristicSuggest(flowchartJson);

    return {
      suggestions: parsed.suggestions || [],
      improvedNodes: parsed.improvedNodes || [],
      newConnections: parsed.newConnections || []
    };
  } catch (e) {
    return heuristicSuggest(flowchartJson);
  }
};
