import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { toPng } from 'html-to-image';

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
  return map[type] || type || 'Node';
};

const NodeShell = ({ data, className, shape }) => {
  return (
    <div className={`rf-custom-node ${className}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="rf-handle"
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="rf-handle"
        style={{ top: '50%' }}
      />
      {shape}
      <div className="rf-node-label">{data?.label || getDefaultLabel(data?.nodeType)}</div>
    </div>
  );
};

const StartNode = (props) =>
  NodeShell({
    ...props,
    className: 'rf-node-start',
    shape: <div className="rf-shape rf-shape--start" />
  });

const EndNode = (props) =>
  NodeShell({
    ...props,
    className: 'rf-node-end',
    shape: <div className="rf-shape rf-shape--end" />
  });

const ProcessNode = (props) =>
  NodeShell({
    ...props,
    className: 'rf-node-process',
    shape: <div className="rf-shape rf-shape--process" />
  });

const DecisionNode = (props) =>
  NodeShell({
    ...props,
    className: 'rf-node-decision',
    shape: <div className="rf-shape rf-shape--decision" />
  });

const IONode = (props) =>
  NodeShell({
    ...props,
    className: 'rf-node-io',
    shape: <div className="rf-shape rf-shape--io" />
  });

const SubprocessNode = (props) =>
  NodeShell({
    ...props,
    className: 'rf-node-subprocess',
    shape: <div className="rf-shape rf-shape--subprocess" />
  });

const DatabaseNode = (props) =>
  NodeShell({
    ...props,
    className: 'rf-node-database',
    shape: <div className="rf-shape rf-shape--database" />
  });

const ManualNode = (props) =>
  NodeShell({
    ...props,
    className: 'rf-node-manual',
    shape: <div className="rf-shape rf-shape--manual" />
  });

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 220;
const nodeHeight = 95;

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

const nodeTypes = {
  default: ProcessNode,
  start: StartNode,
  process: ProcessNode,
  decision: DecisionNode,
  io: IONode,
  subprocess: SubprocessNode,
  database: DatabaseNode,
  manual: ManualNode,
  end: EndNode
};

const normalizeNodes = (incomingNodes) => {
  return (incomingNodes || []).map((n) => {
    const inferredType = n?.data?.nodeType;
    const hasCustom = inferredType && inferredType !== 'default' && nodeTypes[inferredType];
    const finalType = hasCustom ? inferredType : n?.type;

    return {
      ...n,
      type: nodeTypes[finalType] ? finalType : 'default',
      data: {
        ...n.data,
        label: n?.data?.label || getDefaultLabel(finalType),
        nodeType: inferredType || n?.data?.nodeType
      }
    };
  });
};

const FlowEditor = React.forwardRef(
  ({ initialNodes = [], initialEdges = [], onFlowChange }, wrapperRef) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(
      normalizeNodes(initialNodes)
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const editorWrapperRef = useRef(null);

    React.useImperativeHandle(wrapperRef, () => ({
      getFlow: () => ({ nodes, edges }),
      setFlow: (newNodes, newEdges) => {
        setNodes(normalizeNodes(newNodes));
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
        setEdges((eds) =>
          addEdge(
            {
              ...params,
              animated: false,
              style: { stroke: 'rgba(56, 189, 248, 0.95)', strokeWidth: 2 },
              markerEnd: { type: 'arrowclosed', color: 'rgba(56, 189, 248, 0.95)' }
            },
            eds
          )
        );
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
          type: nodeTypes[type] ? type : 'default',
          position,
          data: { label: getDefaultLabel(type), nodeType: type }
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
          nodeTypes={nodeTypes}
          deleteKeyCode={46}
          nodesDraggable
          nodesConnectable
          zoomOnScroll
          panOnScroll
          snapToGrid
          snapGrid={[10, 10]}
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap
            nodeStrokeColor="rgba(56, 189, 248, 0.65)"
            nodeColor="rgba(15, 23, 42, 0.45)"
            maskColor="rgba(15, 23, 42, 0.45)"
          />
          <Controls />
          <Background gap={18} size={1} color="rgba(56, 189, 248, 0.25)" variant="dots" />
        </ReactFlow>
      </div>
    );
  }
);

export default FlowEditor;
