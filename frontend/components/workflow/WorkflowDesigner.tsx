'use client';
import React, { useState, useRef } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  Plus, 
  Square, 
  Circle, 
  Triangle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  Save,
  Download,
  Upload,
  Trash2,
  Copy,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Grid,
  Layers,
  Edit3,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer
} from 'lucide-react';

interface WorkflowDesignerProps {
  filters: any;
}

interface WorkflowNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'end' | 'connector';
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  description: string;
  properties: any;
  connections: string[];
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'default' | 'success' | 'error' | 'conditional';
  label?: string;
}

const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({ filters }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'start-1',
      type: 'start',
      x: 100,
      y: 100,
      width: 120,
      height: 60,
      title: 'Start Process',
      description: 'Begin production workflow',
      properties: {},
      connections: ['process-1']
    },
    {
      id: 'process-1',
      type: 'process',
      x: 280,
      y: 100,
      width: 140,
      height: 80,
      title: 'Material Prep',
      description: 'Prepare raw materials',
      properties: { duration: 30, resources: ['Operator A'] },
      connections: ['decision-1']
    },
    {
      id: 'decision-1',
      type: 'decision',
      x: 480,
      y: 90,
      width: 100,
      height: 100,
      title: 'Quality Check',
      description: 'Inspect material quality',
      properties: { criteria: 'Quality >= 95%' },
      connections: ['process-2', 'process-3']
    },
    {
      id: 'process-2',
      type: 'process',
      x: 640,
      y: 50,
      width: 140,
      height: 80,
      title: 'Production',
      description: 'Main production process',
      properties: { duration: 120, resources: ['Line A', 'Operator B'] },
      connections: ['end-1']
    },
    {
      id: 'process-3',
      type: 'process',
      x: 640,
      y: 160,
      width: 140,
      height: 80,
      title: 'Rework',
      description: 'Material rework process',
      properties: { duration: 45, resources: ['QC Team'] },
      connections: ['decision-1']
    },
    {
      id: 'end-1',
      type: 'end',
      x: 840,
      y: 100,
      width: 120,
      height: 60,
      title: 'End Process',
      description: 'Process completed',
      properties: {},
      connections: []
    }
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { id: 'conn-1', from: 'start-1', to: 'process-1', type: 'default' },
    { id: 'conn-2', from: 'process-1', to: 'decision-1', type: 'default' },
    { id: 'conn-3', from: 'decision-1', to: 'process-2', type: 'success', label: 'Pass' },
    { id: 'conn-4', from: 'decision-1', to: 'process-3', type: 'error', label: 'Fail' },
    { id: 'conn-5', from: 'process-2', to: 'end-1', type: 'default' },
    { id: 'conn-6', from: 'process-3', to: 'decision-1', type: 'conditional', label: 'Retry' }
  ]);

  const [zoom, setZoom] = useState<number>(100);
  const [isGridVisible, setIsGridVisible] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'move', icon: Move, label: 'Move' },
    { id: 'start', icon: Circle, label: 'Start Node' },
    { id: 'process', icon: Square, label: 'Process Node' },
    { id: 'decision', icon: Triangle, label: 'Decision Node' },
    { id: 'end', icon: Circle, label: 'End Node' },
    { id: 'connector', icon: ArrowRight, label: 'Connector' }
  ];

  const nodeTypes = {
    start: { color: 'bg-green-100 border-green-400 text-green-800', shape: 'rounded-full' },
    process: { color: 'bg-blue-100 border-blue-400 text-blue-800', shape: 'rounded-lg' },
    decision: { color: 'bg-yellow-100 border-yellow-400 text-yellow-800', shape: 'rotate-45' },
    end: { color: 'bg-red-100 border-red-400 text-red-800', shape: 'rounded-full' },
    connector: { color: 'bg-gray-100 border-gray-400 text-gray-800', shape: 'rounded' }
  };

  const connectionTypes = {
    default: 'stroke-gray-400',
    success: 'stroke-green-500',
    error: 'stroke-red-500',
    conditional: 'stroke-yellow-500'
  };

  const workflowTemplates = [
    {
      id: 'manufacturing',
      name: 'Manufacturing Process',
      description: 'Standard manufacturing workflow',
      nodes: 8,
      category: 'Production'
    },
    {
      id: 'quality',
      name: 'Quality Control',
      description: 'Quality inspection workflow',
      nodes: 6,
      category: 'Quality'
    },
    {
      id: 'maintenance',
      name: 'Maintenance Schedule',
      description: 'Preventive maintenance workflow',
      nodes: 5,
      category: 'Maintenance'
    },
    {
      id: 'logistics',
      name: 'Logistics Process',
      description: 'Material handling workflow',
      nodes: 7,
      category: 'Logistics'
    }
  ];

  const getNodeStyle = (node: WorkflowNode) => {
    const baseStyle = nodeTypes[node.type];
    const isSelected = selectedNode === node.id;
    
    return {
      left: `${node.x}px`,
      top: `${node.y}px`,
      width: `${node.width}px`,
      height: `${node.height}px`,
      transform: node.type === 'decision' ? 'rotate(45deg)' : 'none',
      borderWidth: isSelected ? '3px' : '2px',
      borderColor: isSelected ? '#3b82f6' : undefined
    };
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedNode(null);
    }
  };

  const addNode = (type: string, x: number = 200, y: number = 200) => {
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      x,
      y,
      width: type === 'decision' ? 100 : 140,
      height: type === 'decision' ? 100 : 80,
      title: `New ${type}`,
      description: `${type} description`,
      properties: {},
      connections: []
    };

    setNodes([...nodes, newNode]);
    setSelectedNode(newNode.id);
  };

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes(nodes.filter(n => n.id !== selectedNode));
      setConnections(connections.filter(c => c.from !== selectedNode && c.to !== selectedNode));
      setSelectedNode(null);
    }
  };

  const duplicateSelectedNode = () => {
    if (selectedNode) {
      const node = nodes.find(n => n.id === selectedNode);
      if (node) {
        const newNode = {
          ...node,
          id: `${node.type}-${Date.now()}`,
          x: node.x + 50,
          y: node.y + 50,
          connections: []
        };
        setNodes([...nodes, newNode]);
        setSelectedNode(newNode.id);
      }
    }
  };

  const simulateWorkflow = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 5000);
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Workflow Designer</h3>
            
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`p-2 rounded transition-colors ${
                    selectedTool === tool.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title={tool.label}
                >
                  <tool.icon size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-sm text-gray-600 min-w-[50px] text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            <button
              onClick={() => setIsGridVisible(!isGridVisible)}
              className={`p-2 rounded transition-colors ${
                isGridVisible ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid size={16} />
            </button>

            <div className="flex items-center gap-2 border-l pl-2">
              <Button variant="secondary" size="sm">
                <Upload className="mr-2" size={16} />
                Import
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="mr-2" size={16} />
                Export
              </Button>
              <Button variant="primary" size="sm">
                <Save className="mr-2" size={16} />
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              onClick={simulateWorkflow}
              variant={isSimulating ? "secondary" : "primary"}
              size="sm"
              disabled={isSimulating}
            >
              {isSimulating ? (
                <>
                  <Pause className="mr-2" size={16} />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2" size={16} />
                  Simulate
                </>
              )}
            </Button>

            {selectedNode && (
              <>
                <Button onClick={duplicateSelectedNode} variant="secondary" size="sm">
                  <Copy className="mr-2" size={16} />
                  Duplicate
                </Button>
                <Button onClick={deleteSelectedNode} variant="secondary" size="sm">
                  <Trash2 className="mr-2" size={16} />
                  Delete
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Badge variant="info" size="sm">{nodes.length} nodes</Badge>
            <Badge variant="success" size="sm">{connections.length} connections</Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card variant="elevated" padding="none" className="h-[600px] overflow-hidden">
            <div 
              ref={canvasRef}
              className="relative w-full h-full bg-gray-50 overflow-auto"
              onClick={handleCanvasClick}
              style={{
                backgroundImage: isGridVisible 
                  ? 'radial-gradient(circle, #ccc 1px, transparent 1px)'
                  : 'none',
                backgroundSize: isGridVisible ? '20px 20px' : 'none',
                transform: `scale(${zoom / 100})`
              }}
            >
              {/* Render Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map(connection => {
                  const fromNode = nodes.find(n => n.id === connection.from);
                  const toNode = nodes.find(n => n.id === connection.to);
                  
                  if (!fromNode || !toNode) return null;
                  
                  const startX = fromNode.x + fromNode.width;
                  const startY = fromNode.y + fromNode.height / 2;
                  const endX = toNode.x;
                  const endY = toNode.y + toNode.height / 2;
                  
                  return (
                    <g key={connection.id}>
                      <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        className={`${connectionTypes[connection.type]} stroke-2`}
                        markerEnd="url(#arrowhead)"
                      />
                      {connection.label && (
                        <text
                          x={(startX + endX) / 2}
                          y={(startY + endY) / 2 - 5}
                          className="text-xs fill-gray-600"
                          textAnchor="middle"
                        >
                          {connection.label}
                        </text>
                      )}
                    </g>
                  );
                })}
                
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      className="fill-gray-400"
                    />
                  </marker>
                </defs>
              </svg>

              {/* Render Nodes */}
              {nodes.map(node => (
                <div
                  key={node.id}
                  className={`absolute border-2 cursor-pointer transition-all ${nodeTypes[node.type].color} ${
                    isSimulating && node.type === 'start' ? 'animate-pulse' : ''
                  }`}
                  style={getNodeStyle(node)}
                  onClick={() => handleNodeClick(node.id)}
                >
                  <div className={`w-full h-full flex items-center justify-center p-2 ${
                    node.type === 'decision' ? 'transform -rotate-45' : ''
                  }`}>
                    <div className="text-center">
                      <div className="text-xs font-semibold">{node.title}</div>
                      {node.type !== 'decision' && (
                        <div className="text-xs opacity-75 mt-1">{node.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Node Library */}
          <Card variant="elevated" padding="lg">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Node Library</h4>
            
            <div className="space-y-2">
              {tools.slice(2).map(tool => (
                <button
                  key={tool.id}
                  onClick={() => addNode(tool.id)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <tool.icon size={16} className="text-gray-600" />
                    <span className="text-sm font-medium">{tool.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Templates */}
          <Card variant="elevated" padding="lg">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Templates</h4>
            
            <div className="space-y-2">
              {workflowTemplates.map(template => (
                <div key={template.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="text-sm font-medium text-gray-900">{template.name}</h5>
                    <Badge variant="default" size="sm">{template.nodes}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="info" size="sm">{template.category}</Badge>
                    <Button variant="secondary" size="sm">
                      Load
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Properties Panel */}
          {selectedNodeData && (
            <Card variant="elevated" padding="lg">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Properties</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={selectedNodeData.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    onChange={(e) => {
                      const updatedNodes = nodes.map(n => 
                        n.id === selectedNode ? { ...n, title: e.target.value } : n
                      );
                      setNodes(updatedNodes);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={selectedNodeData.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    onChange={(e) => {
                      const updatedNodes = nodes.map(n => 
                        n.id === selectedNode ? { ...n, description: e.target.value } : n
                      );
                      setNodes(updatedNodes);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <Badge variant={
                    selectedNodeData.type === 'start' || selectedNodeData.type === 'end' ? 'success' :
                    selectedNodeData.type === 'decision' ? 'warning' : 'info'
                  }>
                    {selectedNodeData.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">X Position</label>
                    <input
                      type="number"
                      value={selectedNodeData.x}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Y Position</label>
                    <input
                      type="number"
                      value={selectedNodeData.y}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                {selectedNodeData.type === 'process' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                      <input
                        type="number"
                        value={selectedNodeData.properties.duration || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Resources</label>
                      <input
                        type="text"
                        value={selectedNodeData.properties.resources?.join(', ') || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Comma-separated resources"
                      />
                    </div>
                  </>
                )}

                {selectedNodeData.type === 'decision' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Criteria</label>
                    <input
                      type="text"
                      value={selectedNodeData.properties.criteria || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Decision criteria"
                    />
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowDesigner;
