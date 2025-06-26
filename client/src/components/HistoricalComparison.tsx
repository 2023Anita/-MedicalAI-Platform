import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HealthAssessmentReport } from "@shared/schema";

interface HistoricalComparisonProps {
  patientName: string;
  currentReport: HealthAssessmentReport;
}

export default function HistoricalComparison({ patientName, currentReport }: HistoricalComparisonProps) {
  const { data: historicalData, isLoading } = useQuery({
    queryKey: ['/api/reports/patient', encodeURIComponent(patientName)],
    enabled: !!patientName,
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border-border">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
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

  if (!previousReport?.analysis) {
    return null;
  }

  const compareLabValues = () => {
    const currentLabs = currentReport.detailedAnalysis.labAbnormalities;
    const previousLabs = previousReport.analysis.detailedAnalysis.labAbnormalities;
    
    const comparisons = [];
    
    for (const currentLab of currentLabs) {
      const previousLab = previousLabs.find((lab: any) => lab.indicator === currentLab.indicator);
      if (previousLab) {
        const currentValue = parseFloat(currentLab.value.replace(/[^\d.]/g, ''));
        const previousValue = parseFloat(previousLab.value.replace(/[^\d.]/g, ''));
        
        if (!isNaN(currentValue) && !isNaN(previousValue)) {
          const trend = currentValue > previousValue ? 'up' : currentValue < previousValue ? 'down' : 'stable';
          comparisons.push({
            indicator: currentLab.indicator,
            current: currentLab.value,
            previous: previousLab.value,
            trend,
            status: currentLab.status
          });
        }
      }
    }
    
    return comparisons;
  };

  const getRiskComparison = () => {
    const currentRisks = currentReport.executiveSummary.coreRisks.length;
    const previousRisks = previousReport.analysis.executiveSummary.coreRisks.length;
    
    return {
      current: currentRisks,
      previous: previousRisks,
      change: currentRisks - previousRisks
    };
  };

  const labComparisons = compareLabValues();
  const riskComparison = getRiskComparison();

  return (
    <Card className="bg-white shadow-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-professional">
          <BarChart3 className="text-primary mr-3 w-5 h-5" />
          历史对比分析
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-muted-foreground mb-3">关键指标变化趋势</h4>
            <div className="space-y-3">
              {labComparisons.slice(0, 3).map((comparison, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                  <span className="text-sm">{comparison.indicator}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {comparison.previous} → {comparison.current}
                    </span>
                    {comparison.trend === 'up' && <ArrowUp className="w-4 h-4 text-warning" />}
                    {comparison.trend === 'down' && <ArrowDown className="w-4 h-4 text-success" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-muted-foreground mb-3">风险评估变化</h4>
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded border-l-4 border-amber-400">
                <p className="text-sm">
                  <strong>风险因素数量:</strong> {riskComparison.previous} → {riskComparison.current}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {riskComparison.change > 0 ? '风险增加' : riskComparison.change < 0 ? '风险减少' : '风险保持稳定'}
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm">
                  <strong>报告对比:</strong> 
                  {new Date(previousReport.createdAt).toLocaleDateString('zh-CN')} vs 今日
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  建议持续监控变化趋势
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
