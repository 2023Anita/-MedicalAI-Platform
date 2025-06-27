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
          {/* User Guide Section */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">📚</span>
                </div>
                <span>如何阅读这份对比报告</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="mr-2">📊</span>看懂图表
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li>• 每个图表都有详细的说明指南</li>
                    <li>• 颜色和形状代表不同含义</li>
                    <li>• 数值变化反映健康趋势</li>
                    <li>• 重点关注趋势而非单次数值</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="mr-2">📈</span>理解趋势
                  </h4>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li>• 上升不一定是坏事</li>
                    <li>• 下降也不一定是好事</li>
                    <li>• 需要结合正常范围判断</li>
                    <li>• 重要的是整体改善方向</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="mr-2">💡</span>行动指南
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-2">
                    <li>• 查看AI专业建议部分</li>
                    <li>• 与医生讨论具体结果</li>
                    <li>• 制定个性化改善计划</li>
                    <li>• 保持定期检查习惯</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

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
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">📈</span>
                </div>
                <span>健康指标变化趋势</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                📊 这个图表显示您的各项健康指标随时间的变化情况
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">📖 如何看懂这个图表：</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 横轴 (X轴)：检查日期时间线</li>
                  <li>• 纵轴 (Y轴)：各项指标的数值</li>
                  <li>• 不同颜色的线条：代表不同的健康指标</li>
                  <li>• 线条向上：指标数值增加 | 线条向下：指标数值减少</li>
                  <li>• 线条平稳：指标保持稳定状态</li>
                </ul>
              </div>
              
              <div className="h-96 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData.comparisonAnalysis.chartData.labTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#374151"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#374151"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                    />
                    <Legend 
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '14px'
                      }}
                    />
                    {Object.keys(comparisonData.comparisonAnalysis.chartData.labTrends[0] || {})
                      .filter(key => key !== 'date')
                      .map((key, index) => {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                        return (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={colors[index % colors.length]}
                            strokeWidth={3}
                            dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
                          />
                        );
                      })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">💡 重要提示：</h4>
                <p className="text-sm text-green-700">
                  数值变化需要结合正常参考范围来判断。上升不一定代表变差，下降也不一定代表变好。
                  请结合下方的专业分析和医生建议来理解您的健康状况。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factor Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">🎯</span>
                </div>
                <span>健康风险雷达图对比</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                🔍 直观显示您各项健康风险因子的前后对比情况
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-purple-800 mb-2">📖 雷达图阅读指南：</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-700">
                  <div>
                    <p className="font-medium mb-1">图表结构：</p>
                    <ul className="space-y-1">
                      <li>• 每个角代表一种健康风险</li>
                      <li>• 距离中心越远风险越高</li>
                      <li>• 蓝色区域：最新检查结果</li>
                      <li>• 绿色区域：历史检查结果</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">风险评估：</p>
                    <ul className="space-y-1">
                      <li>• 0-3分：低风险 (靠近中心)</li>
                      <li>• 4-6分：中等风险</li>
                      <li>• 7-10分：高风险 (远离中心)</li>
                      <li>• 蓝色比绿色小：风险降低 ✅</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="h-96 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={comparisonData.comparisonAnalysis.chartData.riskRadar}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis 
                      dataKey="factor" 
                      tick={{ fontSize: 12, fill: '#374151' }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 10]} 
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      tickCount={6}
                    />
                    <Radar
                      name="最新检查"
                      dataKey="current"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Radar
                      name="历史对比"
                      dataKey="previous"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Legend 
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '14px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <h5 className="font-semibold text-blue-800 mb-1">🔵 最新检查 (蓝色区域)</h5>
                  <p className="text-sm text-blue-700">代表您最近一次体检的风险评估结果</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <h5 className="font-semibold text-green-800 mb-1">🟢 历史对比 (绿色区域)</h5>
                  <p className="text-sm text-green-700">代表您之前体检的风险评估结果</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">📊</span>
                </div>
                <span>综合健康评分变化</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                📈 量化显示您的整体健康状况改善程度
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-orange-800 mb-2">📖 评分系统说明：</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-red-100 rounded-lg p-3 text-center">
                    <div className="font-bold text-red-800">0-40分</div>
                    <div className="text-red-600">需要关注</div>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-3 text-center">
                    <div className="font-bold text-yellow-800">41-60分</div>
                    <div className="text-yellow-600">有待改善</div>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3 text-center">
                    <div className="font-bold text-blue-800">61-80分</div>
                    <div className="text-blue-600">良好状态</div>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3 text-center">
                    <div className="font-bold text-green-800">81-100分</div>
                    <div className="text-green-600">优秀健康</div>
                  </div>
                </div>
              </div>
              
              <div className="h-80 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={comparisonData.comparisonAnalysis.chartData.overallScore}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#374151' }}
                      stroke="#374151"
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12, fill: '#374151' }}
                      stroke="#374151"
                      label={{ value: '健康评分', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any, name: string) => [
                        `${value}分`,
                        '健康评分'
                      ]}
                      labelFormatter={(label) => `检查日期: ${label}`}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      stroke="#2563eb"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">💡 评分解读：</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="font-medium mb-1">柱状图高度表示：</p>
                    <ul className="space-y-1">
                      <li>• 柱子越高，健康评分越好</li>
                      <li>• 从左到右显示时间发展</li>
                      <li>• 颜色深浅反映评分等级</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">如何改善评分：</p>
                    <ul className="space-y-1">
                      <li>• 遵循医生的治疗建议</li>
                      <li>• 保持健康的生活方式</li>
                      <li>• 定期进行健康检查</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span>AI专业健康建议</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                基于您的对比分析结果，AI为您量身定制的健康改善建议
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-800 mb-2">🎯 实施建议的优先级：</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-1 font-bold">1</div>
                    <div className="text-red-700 font-medium">立即执行</div>
                    <div className="text-red-600">健康风险相关</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center mx-auto mb-1 font-bold">2</div>
                    <div className="text-yellow-700 font-medium">尽快安排</div>
                    <div className="text-yellow-600">预防措施</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-1 font-bold">3</div>
                    <div className="text-blue-700 font-medium">持续改善</div>
                    <div className="text-blue-600">生活方式优化</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {comparisonData.comparisonAnalysis.recommendations.map((recommendation, index) => {
                  const priorityColors = [
                    'border-red-500 bg-red-50',
                    'border-yellow-500 bg-yellow-50', 
                    'border-blue-500 bg-blue-50',
                    'border-green-500 bg-green-50'
                  ];
                  const priorityIcons = ['🚨', '⚠️', '📋', '💪'];
                  
                  return (
                    <div key={index} className={`rounded-lg p-4 border-l-4 ${priorityColors[index % 4]}`}>
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{priorityIcons[index % 4]}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">
                              建议 {index + 1}
                            </span>
                            <span className="text-xs text-gray-500">
                              {index === 0 ? '高优先级' : index === 1 ? '中优先级' : '持续执行'}
                            </span>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{recommendation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">📞</span>重要提醒
                </h4>
                <p className="text-sm text-gray-700">
                  以上建议基于AI分析生成，仅供参考。请务必与您的医生讨论这些建议，
                  并根据您的具体情况制定个性化的健康管理方案。
                </p>
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
      
      {/* Footer with Copyright */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 py-4 px-6">
        <div className="text-center text-sm text-gray-500">
          <p>Med Agentic-AI © 江阴市人民医院-殷利鑫</p>
        </div>
      </div>
    </div>
  );
}