import { FileText, Download, Printer, ClipboardList, Microscope, TrendingUp, Calendar, UserCheck, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HealthAssessmentReport } from "@shared/schema";

interface ReportDisplayProps {
  report: HealthAssessmentReport;
}

export default function ReportDisplay({ report }: ReportDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLabStatusClass = (status: string) => {
    switch (status) {
      case 'high':
      case 'low':
        return 'lab-result-high';
      case 'normal':
        return 'lab-result-normal';
      default:
        return 'lab-result-high';
    }
  };

  const getLabStatusText = (status: string) => {
    switch (status) {
      case 'high':
        return '偏高';
      case 'low':
        return '偏低';
      case 'normal':
        return '正常';
      default:
        return '异常';
    }
  };

  const getLabStatusColor = (status: string) => {
    switch (status) {
      case 'high':
      case 'low':
        return 'text-warning';
      case 'normal':
        return 'text-success';
      default:
        return 'text-warning';
    }
  };

  return (
    <Card className="bg-white shadow-sm border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl font-semibold text-professional">
            <FileText className="text-primary mr-3 w-6 h-6" />
            综合健康评估报告
          </CardTitle>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground">
              生成时间: {formatDate(report.reportMetadata.generatedAt)}
            </span>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Patient Info */}
        <div className="mb-6 p-4 medical-clinical rounded-lg">
          <p className="text-professional font-medium">
            <span className="text-muted-foreground">患者信息:</span>{' '}
            <span>{report.patientInfo.name}</span>, {' '}
            <span>{report.patientInfo.age}</span>岁
            {report.patientInfo.gender && (
              <span>, {report.patientInfo.gender}</span>
            )}
          </p>
        </div>
        
        {/* Executive Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-professional mb-4 flex items-center">
            <ClipboardList className="text-primary mr-2 w-5 h-5" />
            一、核心摘要 (Executive Summary)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border-l-4 border-secondary p-4 rounded-r-lg">
              <h4 className="font-medium text-secondary mb-2">主要发现</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {report.executiveSummary.mainFindings.map((finding, index) => (
                  <li key={index}>• {finding}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-red-50 border-l-4 border-warning p-4 rounded-r-lg">
              <h4 className="font-medium text-warning mb-2">核心风险</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {report.executiveSummary.coreRisks.map((risk, index) => (
                  <li key={index}>• {risk}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-green-50 border-l-4 border-success p-4 rounded-r-lg">
              <h4 className="font-medium text-success mb-2">首要建议</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {report.executiveSummary.primaryRecommendations.map((recommendation, index) => (
                  <li key={index}>• {recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Detailed Analysis */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-professional mb-6 flex items-center">
            <Microscope className="text-primary mr-2 w-5 h-5" />
            二、详细解读与分析 (Detailed Interpretation & Analysis)
          </h3>
          
          {/* Imaging Findings */}
          <div className="mb-6">
            <h4 className="font-medium text-professional mb-3 flex items-center">
              <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
              1. 影像学发现 (Imaging Findings)
            </h4>
            <div className="bg-muted rounded-lg p-4">
              <ul className="space-y-2 text-sm">
                {report.detailedAnalysis.imagingFindings.map((finding, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-warning rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Lab Results */}
          <div className="mb-6">
            <h4 className="font-medium text-professional mb-3 flex items-center">
              <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
              2. 实验室检查异常 (Lab Test Abnormalities)
            </h4>
            <div className="bg-muted rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.detailedAnalysis.labAbnormalities.map((lab, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 bg-white rounded ${getLabStatusClass(lab.status)}`}>
                    <div>
                      <span className="font-medium">{lab.indicator}</span>
                      <p className="text-xs text-muted-foreground mt-1">{lab.interpretation}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${getLabStatusColor(lab.status)}`}>{lab.value}</span>
                      <p className={`text-xs ${getLabStatusColor(lab.status)}`}>{getLabStatusText(lab.status)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Risk Factors */}
          <div className="mb-6">
            <h4 className="font-medium text-professional mb-3 flex items-center">
              <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
              3. 个人健康风险因素 (Personal Health Risk Factors)
            </h4>
            <div className="bg-muted rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm">
                  {report.detailedAnalysis.riskFactors.slice(0, Math.ceil(report.detailedAnalysis.riskFactors.length / 2)).map((factor, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-warning rounded-full mr-2"></div>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2 text-sm">
                  {report.detailedAnalysis.riskFactors.slice(Math.ceil(report.detailedAnalysis.riskFactors.length / 2)).map((factor, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-warning rounded-full mr-2"></div>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Risk Assessment & Recommendations */}
        <div>
          <h3 className="text-lg font-semibold text-professional mb-6 flex items-center">
            <TrendingUp className="text-primary mr-2 w-5 h-5" />
            三、综合风险评估与建议 (Overall Risk Assessment & Recommendations)
          </h3>
          
          {/* Overall Assessment */}
          <div className="mb-6">
            <h4 className="font-medium text-professional mb-3">1. 综合评估 (Overall Assessment)</h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm leading-relaxed">
                {report.riskAssessment.overallAssessment}
              </p>
            </div>
          </div>
          
          {/* Actionable Recommendations */}
          <div>
            <h4 className="font-medium text-professional mb-4">2. 行动建议 (Actionable Recommendations)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-secondary mb-3 flex items-center">
                  <Calendar className="mr-2 w-4 h-4" />
                  复查与随访
                </h5>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {report.riskAssessment.actionableRecommendations.followUp.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h5 className="font-medium text-purple-600 mb-3 flex items-center">
                  <UserCheck className="mr-2 w-4 h-4" />
                  专科咨询
                </h5>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {report.riskAssessment.actionableRecommendations.specialistConsultation.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h5 className="font-medium text-success mb-3 flex items-center">
                  <Heart className="mr-2 w-4 h-4" />
                  生活方式调整
                </h5>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {report.riskAssessment.actionableRecommendations.lifestyleAdjustments.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <div className="px-6 py-4 medical-clinical border-t border-border rounded-b-xl">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>报告编号: {report.reportMetadata.reportId}</span>
            <span>AI分析模型: {report.reportMetadata.model}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span>医疗级数据安全保护</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
