import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { toPng } from 'html-to-image';

const nodeTypesConfig = {
  start: { label: 'Start', style: { background: '#4caf50', color: '#fff' } },
  process: { label: 'Process', style: { background: '#2196f3', color: '#fff' } },
  decision: { label: 'Decision', style: { background: '#ff9800', color: '#fff' } },
  io: { label: 'Input/Output', style: { background: '#9c27b0', color: '#fff' } },
  end: { label: 'End', style: { background: '#f44336', color: '#fff' } }
};

const defaultNodeStyle = {
  padding: 10,
  borderRadius: 4,
  border: '1px solid #999'
};

const getNodeLabel = (data, type) => {
  if (data?.label) return data.label;
  return nodeTypesConfig[type]?.label || 'Node';
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 160;
const nodeHeight = 60;

const layoutNodesAndEdges = (nodes, edges, direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2
      },
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom'
    };
  });

  return newNodes;
};

const FlowEditor = React.forwardRef(
  ({ initialNodes = [], initialEdges = [], onFlowChange }, wrapperRef) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const editorWrapperRef = useRef(null);

    React.useImperativeHandle(wrapperRef, () => ({
      getFlow: () => ({ nodes, edges }),
      setFlow: (newNodes, newEdges) => {
        setNodes(newNodes);
        setEdges(newEdges);
      },
      autoLayout: () => {
        const laidOutNodes = layoutNodesAndEdges(nodes, edges, 'LR');
        setNodes(laidOutNodes);
      },
      exportPng: async () => {
        if (!editorWrapperRef.current) return;
        const dataUrl = await toPng(editorWrapperRef.current);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'flowchart.png';
        a.click();
      }
    }));

    const onConnect = useCallback(
      (params) => {
        setEdges((eds) => addEdge({ ...params, animated: false }, eds));
      },
      [setEdges]
    );

    const onNodeDoubleClick = useCallback(
      (_, node) => {
        const label = window.prompt('Edit node text', node.data?.label || '');
        if (label !== null) {
          setNodes((nds) =>
            nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label } } : n))
          );
        }
      },
      [setNodes]
    );

    const onNodesChangeWrapper = (changes) => {
      onNodesChange(changes);
      onFlowChange && onFlowChange({ nodes, edges });
    };

    const onEdgesChangeWrapper = (changes) => {
      onEdgesChange(changes);
      onFlowChange && onFlowChange({ nodes, edges });
    };

    const onDrop = (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const position = { x: event.clientX, y: event.clientY };
      const id = `${type}-${+new Date()}`;
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: 'default',
          position,
          data: { label: getNodeLabel({}, type), nodeType: type },
          style: { ...defaultNodeStyle, ...(nodeTypesConfig[type]?.style || {}) }
        }
      ]);
    };

    const onDragOver = (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    };

    return (
      <div className="flow-editor-wrapper" ref={editorWrapperRef}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeWrapper}
          onEdgesChange={onEdgesChangeWrapper}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    );
  }
);

export default FlowEditor;
