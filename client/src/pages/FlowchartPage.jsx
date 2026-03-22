import React, { useEffect, useRef, useState } from 'react';
import FlowEditor from '../components/FlowEditor';
import Toolbar from '../components/Toolbar';
import SuggestionsPanel from '../components/SuggestionsPanel';
import { saveFlowchart, loadFlowchart, aiSuggest } from '../services/api';

const FlowchartPage = ({ initialId = null, initialTitle = 'Untitled Flowchart', initialFlowchart = null, onSaved }) => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState(initialTitle);
  const [currentId, setCurrentId] = useState(initialId);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const getDefaultLabel = (type) => {
    const map = {
      start: 'Start',
      process: 'Process',
      decision: 'Decision',
      io: 'Input/Output',
      subprocess: 'Subprocess',
      database: 'Database',
      manual: 'Manual',
      end: 'End'
    };
    return map[type] || type;
  };

  useEffect(() => {
    setTitle(initialTitle);
    setCurrentId(initialId);
  }, [initialTitle, initialId]);

  useEffect(() => {
    if (editorRef.current && initialFlowchart && initialFlowchart.nodes && initialFlowchart.edges) {
      // Normalize older flows that used `type: "default"` and relied on `data.nodeType`.
      const normalizedNodes = (initialFlowchart.nodes || []).map((n) => {
        const inferredType = n?.data?.nodeType;
        const hasCustomType = inferredType && inferredType !== 'default';
        const finalType = hasCustomType ? inferredType : n.type;
        return {
          ...n,
          type: finalType,
          data: {
            ...n.data,
            label: n.data?.label || getDefaultLabel(finalType)
          }
        };
      });

      editorRef.current.setFlow(normalizedNodes, initialFlowchart.edges);
    }
  }, [initialFlowchart]);

  const handleAddNode = (type) => {
    if (!editorRef.current) return;
    const { nodes, edges } = editorRef.current.getFlow();
    const id = `${type}-${+new Date()}`;
    const newNode = {
      id,
      type,
      position: { x: 250, y: 50 + nodes.length * 80 },
      data: { label: getDefaultLabel(type), nodeType: type }
    };
    editorRef.current.setFlow([...nodes, newNode], edges);
  };

  const handleAutoLayout = () => {
    editorRef.current?.autoLayout();
  };

  const handleAISuggest = async () => {
    if (!editorRef.current) return;
    const flow = editorRef.current.getFlow();
    setLoadingAI(true);
    try {
      const { data } = await aiSuggest(flow);
      setSuggestions(data);
    } catch (err) {
      console.error(err);
      alert('AI suggestion failed');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    const flow = editorRef.current.getFlow();
    try {
      const { data } = await saveFlowchart({
        id: currentId,
        title,
        flowchart: flow
      });
      setCurrentId(data.id);
      alert(`Flowchart saved (id: ${data.id})`);
      if (onSaved) onSaved(data);
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  const handleLoad = async () => {
    const id = window.prompt('Enter flowchart ID to load', currentId || '');
    if (!id) return;
    try {
      const { data } = await loadFlowchart(id);
      setCurrentId(data.id);
      setTitle(data.title);
      const { nodes, edges } = data.flowchart || { nodes: [], edges: [] };
      editorRef.current.setFlow(nodes || [], edges || []);
    } catch (err) {
      console.error(err);
      alert('Load failed');
    }
  };

  const handleExportJson = () => {
    if (!editorRef.current) return;
    const flow = editorRef.current.getFlow();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(flow));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'flowchart.json';
    a.click();
  };

  const handleExportPng = async () => {
    await editorRef.current?.exportPng();
  };

  return (
    <div className="page flowchart-page">
      <div className="flowchart-main">
        <div className="flow-header">
          <input
            className="title-input"
            placeholder="Give your flowchart a descriptive title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {currentId && <span className="flow-id">Saved • ID: {currentId}</span>}
        </div>
        <Toolbar
          onAddNode={handleAddNode}
          onAutoLayout={handleAutoLayout}
          onAISuggest={handleAISuggest}
          onSave={handleSave}
          onLoad={handleLoad}
          onExportJson={handleExportJson}
          onExportPng={handleExportPng}
        />
        {loadingAI && <div className="info-banner">Requesting AI suggestions...</div>}
        <div className="flow-layout">
          <div className="flow-canvas">
            <FlowEditor ref={editorRef} />
          </div>
          <SuggestionsPanel suggestionsData={suggestions} />
        </div>
      </div>
    </div>
  );
};

export default FlowchartPage;
