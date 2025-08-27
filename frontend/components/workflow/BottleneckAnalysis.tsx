'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { AlertTriangle, Clock, TrendingDown, RefreshCw } from 'lucide-react';
import { workflowService, type BottleneckAnalysis as BottleneckData } from '@/services/workflowService';

export default function BottleneckAnalysis() {
  const [bottleneckData, setBottleneckData] = useState<BottleneckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBottleneckData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowService.getBottleneckAnalysis();
      setBottleneckData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bottleneck analysis');
      console.error('Failed to load bottleneck analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBottleneckData();
  }, []);

  const handleRefresh = () => {
    loadBottleneckData();
  };

  const getSeverityColor = (impact: number): 'default' | 'success' | 'warning' | 'danger' => {
    if (impact >= 80) return 'danger';
    if (impact >= 60) return 'warning';
    if (impact >= 40) return 'default';
    return 'success';
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Bottleneck Analysis
            </h2>
            <p className="text-gray-600 text-sm">
              Identifying critical workflow bottlenecks
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Bottleneck Analysis
            </h2>
            <p className="text-gray-600 text-sm">
              Identifying critical workflow bottlenecks
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!bottleneckData) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Bottleneck Analysis
            </h2>
            <p className="text-gray-600 text-sm">
              Identifying critical workflow bottlenecks
            </p>
          </div>
        </div>
        <p className="text-gray-500 text-center py-8">
          No bottleneck data available
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Bottleneck Analysis
            </h2>
            <p className="text-gray-600 text-sm">
              Identifying critical workflow bottlenecks
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Critical Bottlenecks */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Critical Bottlenecks ({bottleneckData.critical_bottlenecks.length})
          </h3>
          {bottleneckData.critical_bottlenecks.length === 0 ? (
            <p className="text-gray-500">No critical bottlenecks detected</p>
          ) : (
            <div className="space-y-3">
              {bottleneckData.critical_bottlenecks.map((bottleneck, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{bottleneck.stage}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {bottleneck.suggested_actions.join(', ')}
                      </p>
                    </div>
                    <Badge variant={getSeverityColor(bottleneck.impact_score)}>
                      Impact: {bottleneck.impact_score}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {bottleneck.avg_delay}h avg delay
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4" />
                      {bottleneck.affected_batches} batches affected
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Efficiency Metrics */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Efficiency Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {bottleneckData.efficiency_metrics.overall_efficiency}%
              </div>
              <div className="text-sm text-gray-600">Overall Efficiency</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {bottleneckData.efficiency_metrics.throughput_rate}
              </div>
              <div className="text-sm text-gray-600">Throughput Rate</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {bottleneckData.efficiency_metrics.capacity_utilization}%
              </div>
              <div className="text-sm text-gray-600">Capacity Utilization</div>
            </div>
          </div>
        </div>

        {/* Stage Efficiency Breakdown */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Stage Efficiency</h3>
          <div className="space-y-2">
            {Object.entries(bottleneckData.efficiency_metrics.stage_efficiency).map(([stage, efficiency]) => (
              <div key={stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{stage}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${efficiency}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{efficiency}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}