import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Activity, AlertTriangle, CheckCircle, Clock, Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { HealthAssessmentReport } from "@shared/schema";

interface HistoricalComparisonProps {
  patientName: string;
  currentReport: HealthAssessmentReport;
}

export default function HistoricalComparison({ patientName, currentReport }: HistoricalComparisonProps) {
  const { data: historicalData, isLoading } = useQuery({
    queryKey: ['/api/reports/patient', patientName],
    queryFn: () => fetch(`/api/reports/patient/${encodeURIComponent(patientName)}`).then(res => res.json()),
    enabled: !!patientName,
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-white/95 via-blue-50/80 to-teal-50/60 backdrop-blur-sm shadow-xl border border-blue-200/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center animate-pulse">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              历史对比分析
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl"></div>
              <div className="flex-1 h-20 bg-gradient-to-r from-teal-100 to-teal-200 rounded-xl"></div>
            </div>
            <div className="h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!historicalData?.success || !historicalData.reports || historicalData.reports.length <= 1) {
    return null;
  }

  // Get the most recent previous report (excluding current one)
  const previousReport = historicalData.reports.find((report: any) => 
    report.id !== currentReport.reportMetadata.reportId
  );

  if (!previousReport?.analysisResult) {
    return null;
  }

  // Enhanced comparison analytics
  const generateHealthScore = (report: any) => {
    const riskFactors = report.detailedAnalysis?.riskFactors?.length || 0;
    const labAbnormalities = report.detailedAnalysis?.labAbnormalities?.filter((lab: any) => lab.status !== 'normal')?.length || 0;
    
    return Math.max(0, Math.min(100, 100 - ((riskFactors * 10) + (labAbnormalities * 5))));
  };

  const currentHealthScore = generateHealthScore(currentReport);
  const previousHealthScore = generateHealthScore(previousReport.analysisResult);
  const healthTrend = currentHealthScore - previousHealthScore;

  const analyzeKeyChanges = () => {
    const currentRisks = currentReport.detailedAnalysis.riskFactors || [];
    const previousRisks = previousReport.analysisResult.detailedAnalysis?.riskFactors || [];
    
    const newRisks = currentRisks.filter((risk: string) => !previousRisks.includes(risk));
    const resolvedRisks = previousRisks.filter((risk: string) => !currentRisks.includes(risk));
    
    return { newRisks, resolvedRisks };
  };

  const { newRisks, resolvedRisks } = analyzeKeyChanges();

  const compareLabValues = () => {
    const currentLabs = currentReport.detailedAnalysis.labAbnormalities || [];
    const previousLabs = previousReport.analysisResult.detailedAnalysis?.labAbnormalities || [];
    
    const labComparisons = currentLabs.map((currentLab: any) => {
      const previousLab = previousLabs.find((lab: any) => lab.indicator === currentLab.indicator);
      if (previousLab) {
        return {
          indicator: currentLab.indicator,
          current: currentLab,
          previous: previousLab,
          trend: currentLab.status === previousLab.status ? 'stable' : 
                 (currentLab.status === 'normal' ? 'improved' : 'worsened')
        };
      }
      return null;
    }).filter(Boolean);
    
    return labComparisons;
  };

  const labComparisons = compareLabValues();
  const reportDate = new Date(previousReport.createdAt).toLocaleDateString('zh-CN');
  const currentDate = new Date().toLocaleDateString('zh-CN');

  return (
    <Card className="bg-gradient-to-br from-white/95 via-blue-50/80 to-teal-50/60 backdrop-blur-sm shadow-xl border border-blue-200/30 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">历史对比分析</h3>
              <p className="text-blue-100 text-sm">Health Trend Analysis</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {historicalData.reports.length} 份报告
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* 健康评分对比 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 当前健康评分 */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">当前健康评分</h4>
                  <p className="text-sm text-gray-600">{currentDate}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">{currentHealthScore}</div>
                <div className="text-xs text-gray-500">满分100</div>
              </div>
            </div>
            <Progress value={currentHealthScore} className="h-3 bg-emerald-100" />
            <div className="mt-2 text-xs text-gray-600">
              {currentHealthScore >= 80 ? '健康状况良好' : 
               currentHealthScore >= 60 ? '需要关注' : '建议就医'}
            </div>
          </div>

          {/* 历史健康评分 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">历史健康评分</h4>
                  <p className="text-sm text-gray-600">{reportDate}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{previousHealthScore}</div>
                <div className="text-xs text-gray-500">满分100</div>
              </div>
            </div>
            <Progress value={previousHealthScore} className="h-3 bg-blue-100" />
          </div>
        </div>

        {/* 健康趋势指示器 */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              {healthTrend > 0 ? (
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              ) : healthTrend < 0 ? (
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <div className="text-lg font-bold text-gray-800">
                  健康趋势变化: {Math.abs(healthTrend).toFixed(1)} 分
                </div>
                <div className={`text-sm font-medium ${
                  healthTrend > 0 ? 'text-green-600' : 
                  healthTrend < 0 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {healthTrend > 0 ? '↗ 健康状况改善' : 
                   healthTrend < 0 ? '↘ 需要关注' : '→ 状况稳定'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 风险因子变化分析 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 新增风险 */}
          {newRisks.length > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">新增风险因子</h4>
                  <p className="text-sm text-gray-600">需要重点关注</p>
                </div>
              </div>
              <div className="space-y-2">
                {newRisks.slice(0, 3).map((risk: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 bg-white/60 rounded-lg p-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 flex-1">{risk}</span>
                  </div>
                ))}
                {newRisks.length > 3 && (
                  <div className="text-xs text-gray-500 text-center pt-2">
                    还有 {newRisks.length - 3} 项新增风险
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 改善情况 */}
          {resolvedRisks.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">改善的风险因子</h4>
                  <p className="text-sm text-gray-600">积极的变化</p>
                </div>
              </div>
              <div className="space-y-2">
                {resolvedRisks.slice(0, 3).map((risk: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 bg-white/60 rounded-lg p-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 flex-1">{risk}</span>
                  </div>
                ))}
                {resolvedRisks.length > 3 && (
                  <div className="text-xs text-gray-500 text-center pt-2">
                    还有 {resolvedRisks.length - 3} 项改善
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 检验指标变化 */}
        {labComparisons.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">关键指标变化趋势</h4>
                <p className="text-sm text-gray-600">Laboratory Trend Analysis</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labComparisons.slice(0, 6).map((comparison: any, index: number) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-800">{comparison.indicator}</span>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      comparison.trend === 'improved' ? 'bg-green-100 text-green-700' :
                      comparison.trend === 'worsened' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {comparison.trend === 'improved' ? (
                        <>
                          <ArrowUp className="w-3 h-3" />
                          <span>改善</span>
                        </>
                      ) : comparison.trend === 'worsened' ? (
                        <>
                          <ArrowDown className="w-3 h-3" />
                          <span>恶化</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-3 h-3" />
                          <span>稳定</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">当前:</span>
                      <span className={`font-medium ${
                        comparison.current.status === 'normal' ? 'text-green-600' :
                        comparison.current.status === 'high' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {comparison.current.value}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">历史:</span>
                      <span className={`font-medium ${
                        comparison.previous.status === 'normal' ? 'text-green-600' :
                        comparison.previous.status === 'high' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {comparison.previous.value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {labComparisons.length > 6 && (
              <div className="text-center mt-4">
                <span className="text-sm text-gray-500">
                  显示 6 / {labComparisons.length} 项指标变化
                </span>
              </div>
            )}
          </div>
        )}

        {/* 报告对比信息 */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-200/50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 px-3 py-1 rounded-full font-medium">
                报告对比: {reportDate} vs {currentDate}
              </span>
              <span className="bg-purple-100 px-3 py-1 rounded-full font-medium">
                建议持续追踪: {healthTrend > 0 ? '继续保持' : '加强关注'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs">Med Agentic-AI 智能分析</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}