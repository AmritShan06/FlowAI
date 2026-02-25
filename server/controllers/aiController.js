import { analyzeFlowchartWithAI } from '../services/aiService.js';

export const suggestImprovements = async (req, res, next) => {
  try {
    const { flowchart } = req.body || {};

    if (!flowchart) {
      res.status(400);
      return res.json({ message: 'Flowchart is required' });
    }

    const result = await analyzeFlowchartWithAI(flowchart);

    const response = {
      suggestions: result.suggestions || [],
      improvedNodes: result.improvedNodes || [],
      newConnections: result.newConnections || []
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
};
