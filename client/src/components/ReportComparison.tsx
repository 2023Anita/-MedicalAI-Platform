import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, Activity, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComparisonData {
  patientName: string;
  reports: Array<{
    id: number;
    date: string;
    patientAge: string;
    analysis: any;
  }>;
  comparisonAnalysis: {
    trends: Array<{
      indicator: string;
      trend: 'improving' | 'stable' | 'declining';
      change: string;
      significance: string;
    }>;
    riskFactorComparison: Array<{
      factor: string;
      timeline: Array<{ date: string; level: number; status: string }>;
    }>;
    keyFindings: string[];
    recommendations: string[];
    chartData: {
      labTrends: Array<{ date: string; [key: string]: any }>;
      riskRadar: Array<{ factor: string; current: number; previous: number }>;
      overallScore: Array<{ date: string; score: number; category: string }>;
    };
  };
}

interface ReportComparisonProps {
  selectedReportIds: number[];
  onClose: () => void;
}

export default function ReportComparison({ selectedReportIds, onClose }: ReportComparisonProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedReportIds.length >= 2) {
      generateComparison();
    }
  }, [selectedReportIds]);

  const generateComparison = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reports/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reportIds: selectedReportIds }),
      });

      if (!response.ok) {
        throw new Error('对比分析失败');
      }

      const data = await response.json();
      setComparisonData(data.comparison);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成对比分析时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI智能对比分析中</h3>
            <p className="text-gray-600">正在生成可视化图表和趋势分析...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">分析失败</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!comparisonData) {
    return null;
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'declining':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">智能对比分析报告</h2>
                <p className="text-sm text-gray-600">
                  患者: {comparisonData.patientName} | 对比 {comparisonData.reports.length} 份报告
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Key Findings Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <span>核心发现总结</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisonData.comparisonAnalysis.keyFindings.map((finding, index) => (
                  <div key={index} className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <p className="text-gray-800">{finding}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trends Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span>趋势分析</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisonData.comparisonAnalysis.trends.map((trend, index) => (
                  <div key={index} className={`rounded-lg p-4 ${getTrendColor(trend.trend)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{trend.indicator}</span>
                      {getTrendIcon(trend.trend)}
                    </div>
                    <p className="text-sm mb-1">{trend.change}</p>
                    <p className="text-xs opacity-75">{trend.significance}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lab Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>实验室指标趋势图</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData.comparisonAnalysis.chartData.labTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(comparisonData.comparisonAnalysis.chartData.labTrends[0] || {})
                      .filter(key => key !== 'date')
                      .map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'][index % 5]}
                          strokeWidth={2}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factor Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>风险因子雷达图对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={comparisonData.comparisonAnalysis.chartData.riskRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="factor" />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} />
                    <Radar
                      name="当前"
                      dataKey="current"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="历史"
                      dataKey="previous"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Overall Health Score */}
          <Card>
            <CardHeader>
              <CardTitle>整体健康评分趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData.comparisonAnalysis.chartData.overallScore}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>AI智能建议</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparisonData.comparisonAnalysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <p className="text-gray-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <span>检查时间线</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200"></div>
                {comparisonData.reports.map((report, index) => (
                  <div key={report.id} className="relative flex items-center mb-6 last:mb-0">
                    <div className="absolute left-2 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-md"></div>
                    <div className="ml-10 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">检查报告 #{report.id}</h4>
                        <span className="text-sm text-gray-500">{report.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">年龄: {report.patientAge}岁</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}