import { FileText, Download, Printer, ClipboardList, Microscope, TrendingUp, Calendar, UserCheck, Heart, Video, Brain, Target } from "lucide-react";
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
        return '↑ 偏高 (Above Normal Range)';
      case 'low':
        return '↓ 偏低 (Below Normal Range)';
      case 'normal':
        return '✓ 正常 (Within Normal Range)';
      default:
        return '⚠ 异常 (Abnormal)';
    }
  };

  const getLabStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return 'text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-md font-medium text-sm';
      case 'low':
        return 'text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md font-medium text-sm';
      case 'normal':
        return 'text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-md font-medium text-sm';
      default:
        return 'text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-md font-medium text-sm';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-blue-200/50 rounded-2xl">
      <CardHeader className="border-b border-blue-200/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mr-3">
              <FileText className="text-white w-5 h-5" />
            </div>
            Med Agentic-AI 综合健康评估报告
          </CardTitle>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              生成时间: {formatDate(report.reportMetadata.generatedAt)}
            </span>
            <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 rounded-lg">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 rounded-lg">
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Patient Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200/50 rounded-xl">
          <p className="text-gray-800 font-medium">
            <span className="text-gray-600">患者信息:</span>{' '}
            <span className="text-blue-600 font-semibold">{report.patientInfo.name}</span>, {' '}
            <span className="text-teal-600">{report.patientInfo.age}</span>岁
            {report.patientInfo.gender && (
              <span className="text-purple-600">, {report.patientInfo.gender}</span>
            )}
          </p>
        </div>
        
        {/* Executive Summary */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <ClipboardList className="text-white w-5 h-5" />
            </div>
            一、核心摘要 (Executive Summary)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-5 rounded-2xl shadow-sm">
              <h4 className="font-semibold text-blue-700 mb-3 text-base flex items-center">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white text-xs">📋</span>
                </div>
                主要发现
              </h4>
              <ul className="text-base space-y-2 text-gray-700">
                {report.executiveSummary.mainFindings.map((finding, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 p-5 rounded-2xl shadow-sm">
              <h4 className="font-semibold text-red-700 mb-3 text-base flex items-center">
                <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white text-xs">⚠️</span>
                </div>
                核心风险
              </h4>
              <ul className="text-base space-y-2 text-gray-700">
                {report.executiveSummary.coreRisks.map((risk, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-5 rounded-2xl shadow-sm">
              <h4 className="font-semibold text-green-700 mb-3 text-base flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white text-xs">✅</span>
                </div>
                首要建议
              </h4>
              <ul className="text-base space-y-2 text-gray-700">
                {report.executiveSummary.primaryRecommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Detailed Analysis */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Microscope className="text-white w-5 h-5" />
            </div>
            二、详细解读与分析 (Detailed Interpretation & Analysis)
          </h3>
          
          {/* Imaging Findings */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-3 rounded-xl border border-blue-200">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mr-3 shadow-sm"></div>
              1. 影像学发现 (Imaging Findings)
            </h4>
            <div className="bg-white/70 border border-blue-200 rounded-xl p-5 shadow-sm">
              <ul className="space-y-3 text-base">
                {report.detailedAnalysis.imagingFindings.map((finding, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-warning rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Video Findings */}
          {report.detailedAnalysis.videoFindings && report.detailedAnalysis.videoFindings.length > 0 && report.reportMetadata.hasVideoFiles && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-3 rounded-xl border border-purple-200">
                <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mr-3 shadow-sm"></div>
                1.5. 视频检查结果 (Video Examination Results)
              </h4>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-5 space-y-4 shadow-sm">
                {report.detailedAnalysis.videoFindings.map((finding, index) => (
                  <div key={index} className="bg-white/80 border-l-4 border-purple-400 rounded-r-xl p-4">
                    <div className="flex items-start mb-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                        <Video className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-medium text-gray-800 mb-2">{finding.finding}</p>
                        <div className="text-sm text-gray-600 mb-3 bg-blue-50 px-3 py-2 rounded-lg">
                          <span className="font-medium text-blue-700">专业术语:</span> {finding.medicalTerms}
                        </div>
                        <div className="text-sm bg-green-50 p-3 rounded-lg border-l-3 border-green-400 mb-2">
                          <span className="font-medium text-green-700">通俗解释:</span> {finding.patientExplanation}
                        </div>
                        <div className="text-sm text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
                          <span className="font-medium">临床意义:</span> {finding.significance}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Reasoning */}
          {report.detailedAnalysis.clinicalReasoning && report.detailedAnalysis.clinicalReasoning.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-professional mb-3 flex items-center">
                <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                1.6. 临床推理过程 (Clinical Reasoning Process)
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <ul className="space-y-3 text-sm">
                  {report.detailedAnalysis.clinicalReasoning.map((reasoning, index) => (
                    <li key={index} className="flex items-start">
                      <Brain className="mr-2 w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground leading-relaxed">{reasoning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Lab Results */}
          <div className="mb-6">
            <h4 className="font-medium text-professional mb-3 flex items-center">
              <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
              2. 实验室检查异常 (Lab Test Abnormalities)
            </h4>
            <div className="bg-muted rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.detailedAnalysis.labAbnormalities.map((lab, index) => (
                  <div key={index} className={`p-3 bg-white rounded ${getLabStatusClass(lab.status)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{lab.indicator}</span>
                      <span className={`font-semibold ${getLabStatusColor(lab.status)}`}>{lab.value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{lab.interpretation}</p>
                    {lab.patientFriendly && (
                      <div className="text-xs bg-green-50 p-2 rounded border-l-2 border-green-300">
                        <span className="font-medium text-green-700">通俗解释:</span> {lab.patientFriendly}
                      </div>
                    )}
                    <div className={`mt-2 inline-block ${getLabStatusColor(lab.status)}`}>{getLabStatusText(lab.status)}</div>
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

          {/* Possible Diagnoses */}
          {report.detailedAnalysis.possibleDiagnoses && report.detailedAnalysis.possibleDiagnoses.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-professional mb-3 flex items-center">
                <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                4. 可能的诊断 (Possible Diagnoses)
              </h4>
              <div className="space-y-4">
                {report.detailedAnalysis.possibleDiagnoses.map((diagnosis, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-foreground">{diagnosis.diagnosis}</h5>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        diagnosis.probability === 'high' ? 'bg-red-100 text-red-700' :
                        diagnosis.probability === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {diagnosis.probability === 'high' ? '高可能性' : 
                         diagnosis.probability === 'moderate' ? '中等可能性' : '低可能性'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{diagnosis.reasoning}</p>
                    <div className="text-sm bg-blue-50 p-2 rounded border-l-2 border-blue-300">
                      <span className="font-medium text-blue-700">患者解释:</span> {diagnosis.patientExplanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Differential Diagnosis */}
          {report.detailedAnalysis.differentialDiagnosis && report.detailedAnalysis.differentialDiagnosis.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-professional mb-3 flex items-center">
                <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                5. 鉴别诊断 (Differential Diagnosis)
              </h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="space-y-3">
                  {report.detailedAnalysis.differentialDiagnosis.map((diff, index) => (
                    <div key={index} className="bg-white p-3 rounded border-l-4 border-yellow-400">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-foreground">{diff.condition}</span>
                        <span className="text-xs text-muted-foreground">{diff.likelihood}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{diff.distinguishingFeatures}</p>
                      <p className="text-xs text-yellow-700">{diff.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Imaging Report Summary */}
          {report.detailedAnalysis.imagingReportSummary && (
            <div className="mb-6">
              <h4 className="font-medium text-professional mb-3 flex items-center">
                <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                6. 影像学报告总结 (Imaging Report Summary)
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <div>
                  <h5 className="font-medium text-sm mb-2 text-gray-700">技术发现 (Technical Findings)</h5>
                  <ul className="space-y-1">
                    {report.detailedAnalysis.imagingReportSummary.technicalFindings.map((finding, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-2"></div>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-sm mb-2 text-gray-700">临床相关性 (Clinical Correlation)</h5>
                  <p className="text-sm text-muted-foreground">{report.detailedAnalysis.imagingReportSummary.clinicalCorrelation}</p>
                </div>
                
                <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                  <h5 className="font-medium text-sm mb-2 text-blue-700">患者总结 (Patient Summary)</h5>
                  <p className="text-sm text-blue-600">{report.detailedAnalysis.imagingReportSummary.patientSummary}</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-sm mb-2 text-gray-700">建议后续步骤 (Next Steps)</h5>
                  <ul className="space-y-1">
                    {report.detailedAnalysis.imagingReportSummary.nextSteps.map((step, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2"></div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Risk Assessment & Recommendations */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            三、综合风险评估与建议 (Overall Risk Assessment & Recommendations)
          </h3>
          
          {/* Diagnostic Conclusion */}
          {report.riskAssessment.diagnosticConclusion && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center bg-gradient-to-r from-red-50 to-orange-50 px-5 py-3 rounded-xl border border-red-200">
                <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mr-3 shadow-sm"></div>
                1. 最终诊断结论 (Final Diagnostic Conclusion)
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-base leading-relaxed font-medium text-red-800">
                  {report.riskAssessment.diagnosticConclusion}
                </p>
              </div>
            </div>
          )}

          {/* Overall Assessment */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 rounded-xl border border-amber-200">
              <div className="w-4 h-4 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full mr-3 shadow-sm"></div>
              2. 综合评估 (Overall Assessment)
            </h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-base leading-relaxed">
                {report.riskAssessment.overallAssessment}
              </p>
            </div>
          </div>
          
          {/* Actionable Recommendations */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center bg-gradient-to-r from-emerald-50 to-green-50 px-5 py-3 rounded-xl border border-emerald-200">
              <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full mr-3 shadow-sm"></div>
              3. 行动建议 (Actionable Recommendations)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
                <h5 className="text-base font-semibold text-blue-700 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="w-3 h-3 text-white" />
                  </div>
                  复查与随访
                </h5>
                <ul className="text-base space-y-2 text-gray-700">
                  {report.riskAssessment.actionableRecommendations.followUp.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-5 shadow-sm">
                <h5 className="text-base font-semibold text-purple-700 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <UserCheck className="w-3 h-3 text-white" />
                  </div>
                  专科咨询
                </h5>
                <ul className="text-base space-y-2 text-gray-700">
                  {report.riskAssessment.actionableRecommendations.specialistConsultation.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 shadow-sm">
                <h5 className="text-base font-semibold text-green-700 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                  生活方式调整
                </h5>
                <ul className="text-base space-y-2 text-gray-700">
                  {report.riskAssessment.actionableRecommendations.lifestyleAdjustments.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-blue-200/30 rounded-b-2xl">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <span className="bg-blue-100 px-3 py-1 rounded-full font-medium">报告编号: {report.reportMetadata.reportId}</span>
            <span className="bg-purple-100 px-3 py-1 rounded-full font-medium">AI分析模型: {report.reportMetadata.model}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm animate-pulse"></div>
            <span className="bg-green-100 px-3 py-1 rounded-full font-medium text-green-700">医疗级数据安全保护</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
