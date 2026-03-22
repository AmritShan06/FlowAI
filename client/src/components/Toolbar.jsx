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
        + Process
      </button>
      <button className="btn" onClick={() => onAddNode('start')}>
        + Start
      </button>
      <button className="btn" onClick={() => onAddNode('decision')}>
        + Decision
      </button>
      <button className="btn" onClick={() => onAddNode('io')}>
        + Input/Output
      </button>
      <button className="btn" onClick={() => onAddNode('subprocess')}>
        + Subprocess
      </button>
      <button className="btn" onClick={() => onAddNode('database')}>
        + Database
      </button>
      <button className="btn" onClick={() => onAddNode('manual')}>
        + Manual
      </button>
      <button className="btn" onClick={() => onAddNode('end')}>
        + End
      </button>
      <button className="btn" onClick={onAutoLayout}>
        Auto‑arrange
      </button>
      <button className="btn ai" onClick={onAISuggest}>
        ✨ AI suggest
      </button>
      <button className="btn" onClick={onSave}>
        Save
      </button>
      <button className="btn" onClick={onLoad}>
        Load
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
