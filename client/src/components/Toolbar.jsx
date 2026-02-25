import React from 'react';

const Toolbar = ({
  onAddNode,
  onAutoLayout,
  onAISuggest,
  onSave,
  onLoad,
  onExportJson,
  onExportPng
}) => {
  return (
    <div className="toolbar">
      <button className="btn primary" onClick={() => onAddNode('process')}>
        + Process step
      </button>
      <button className="btn" onClick={onAutoLayout}>
        Auto‑arrange
      </button>
      <button className="btn" onClick={onAISuggest}>
        ✨ AI suggest
      </button>
      <button className="btn" onClick={onSave}>
        💾 Save
      </button>
      <button className="btn" onClick={onLoad}>
        📂 Load
      </button>
      <button className="btn" onClick={onExportJson}>
        JSON export
      </button>
      <button className="btn" onClick={onExportPng}>
        PNG export
      </button>
    </div>
  );
};

export default Toolbar;
