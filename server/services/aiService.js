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

Here is the flowchart JSON:
${JSON.stringify(flowchartJson)}
`;
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
  const apiUrl = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;

  if (!apiUrl || !apiKey) {
    return heuristicSuggest(flowchartJson);
  }

  const prompt = buildPrompt(flowchartJson);

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
