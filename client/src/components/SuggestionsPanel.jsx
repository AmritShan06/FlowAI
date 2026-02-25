import React from 'react';

const SuggestionsPanel = ({ suggestionsData }) => {
  if (!suggestionsData) {
    return (
      <div className="suggestions-panel">
        <h3>AI Suggestions</h3>
        <p>No suggestions yet. Click "AI Suggest".</p>
      </div>
    );
  }

  const { suggestions = [], improvedNodes = [], newConnections = [] } = suggestionsData;

  return (
    <div className="suggestions-panel">
      <h3>AI Suggestions</h3>
      <div>
        <h4>General Suggestions</h4>
        {suggestions.length === 0 ? (
          <p>None</p>
        ) : (
          <ul>
            {suggestions.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h4>Improved Nodes</h4>
        <pre>{JSON.stringify(improvedNodes, null, 2)}</pre>
      </div>
      <div>
        <h4>New Connections</h4>
        <pre>{JSON.stringify(newConnections, null, 2)}</pre>
      </div>
    </div>
  );
};

export default SuggestionsPanel;
