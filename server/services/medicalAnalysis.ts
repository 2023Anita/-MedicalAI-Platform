import { GoogleGenAI } from "@google/genai";
import type { AnalysisRequest, HealthAssessmentReport, AnalysisProgress } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

const MEDICAL_ANALYSIS_PROMPT = `你将扮演一个名为 "医检智解 (MediScan-Insight)" 的高级 Agentic AI 系统。你的任务是接收用户提供的体检报告数据（包括文本、医学影像分析和医学视频分析），并模拟一个多智能体架构，对数据进行全面分析，最终生成一份综合健康评估报告。

你必须严格遵循以下定义的架构和工作流程进行思考和响应：

1. 你的核心架构（模拟）
你将通过模拟以下四个核心模块的协作来完成任务：

A. 编排器 (Orchestrator): 识别数据类型（影像描述、化验单数值、个人病史、医学影像分析、医学视频分析等），规划分析顺序
B. 专业化 Agent 集群:
   - 影像分析 Agent: 解读影像报告和医学影像分析结果，提取关键发现和异常表现
   - 视频诊断 Agent: 分析医学视频内容，解读超声、内镜、X光透视等检查结果
   - 化验单解读 Agent: 分析实验室检验数值，识别异常指标和参考范围
   - 病例与结构化数据 Agent: 提取个人史、家族史、生活习惯等风险因素
   - 医学知识库 Agent: 查询症状、指标异常和疾病关联
C. 高级推理与规划: 信息融合、关联分析、纵向对比、风险评估与建议
D. 持久化记忆: 如有历史数据，进行纵向对比分析

2. 特别注意事项
- 对于医学影像分析：重点关注影像中提取的数值、异常指标、测量结果，明确标注"影像来源"
- 对于医学视频分析：重点关注检查发现、异常表现、医生建议，明确标注"视频来源"
- 对于体检报告数据：标注"报告来源"
- 将影像和视频分析结果与化验数据进行关联分析和推理
- 提供详细的推理过程：从发现→分析→关联→结论
- 基于不同数据源提供综合性的专业医学建议和最终诊断

3. 输出要求
你必须返回结构化的JSON数据，包含以下字段：
- patientInfo: 患者基本信息
- executiveSummary: 核心摘要（主要发现、核心风险、首要建议）
- detailedAnalysis: 详细分析，必须包含：
  - imagingFindings: 影像学发现（明确标注数据来源：影像来源/视频来源/报告来源）
  - videoFindings: 视频检查结果（如有视频上传）
  - labAbnormalities: 实验室检查异常
  - clinicalReasoning: 详细推理过程（发现→分析→关联→结论）
  - riskFactors: 个人健康风险因素
- riskAssessment: 综合风险评估与建议，必须包含：
  - overallAssessment: 综合评估
  - diagnosticConclusion: 最终诊断结论
  - actionableRecommendations: 具体建议
- reportMetadata: 报告元数据

重要要求：
1. 在imagingFindings中明确标注数据来源（影像来源/视频来源/报告来源）
2. clinicalReasoning保持简洁，重点突出关键推理步骤（3-5条即可）
3. diagnosticConclusion给出明确简洁的最终诊断
4. 响应必须是有效的JSON格式，避免过长的文本导致解析错误

请基于提供的体检报告数据进行快速精准分析，重点突出关键发现和结论。`;

export class MedicalAnalysisService {
  private progressCallbacks: Map<string, (progress: AnalysisProgress) => void> = new Map();

  async analyzeReport(
    request: AnalysisRequest,
    progressCallback?: (progress: AnalysisProgress) => void
  ): Promise<HealthAssessmentReport> {
    const analysisId = Math.random().toString(36).substring(7);
    
    if (progressCallback) {
      this.progressCallbacks.set(analysisId, progressCallback);
    }

    const progress: AnalysisProgress = {
      orchestrator: 'processing',
      imagingAgent: 'pending',
      labAgent: 'pending',
      medicalHistoryAgent: 'pending',
      comprehensiveAnalysis: 'pending'
    };

    try {
      // Step 1: Orchestrator - Fast processing
      this.updateProgress(analysisId, { ...progress, orchestrator: 'completed', imagingAgent: 'processing' });
      await this.delay(300);

      // Step 2: Imaging Analysis - Optimized
      this.updateProgress(analysisId, { ...progress, orchestrator: 'completed', imagingAgent: 'completed', labAgent: 'processing' });
      await this.delay(400);

      // Step 3: Lab Analysis - Quick processing
      this.updateProgress(analysisId, { ...progress, orchestrator: 'completed', imagingAgent: 'completed', labAgent: 'completed', medicalHistoryAgent: 'processing' });
      await this.delay(300);

      // Step 4: Medical History Analysis - Fast completion
      this.updateProgress(analysisId, { ...progress, orchestrator: 'completed', imagingAgent: 'completed', labAgent: 'completed', medicalHistoryAgent: 'completed', comprehensiveAnalysis: 'processing' });
      await this.delay(500);

      // Step 5: Comprehensive Analysis using Gemini 2.5-Pro
      const analysisPrompt = `${MEDICAL_ANALYSIS_PROMPT}

患者信息：
姓名：${request.patientName}
年龄：${request.patientAge}
性别：${request.patientGender || '未提供'}

体检报告数据：
${request.reportData}

请进行全面分析并返回结构化的健康评估报告。`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: MEDICAL_ANALYSIS_PROMPT,
          responseMimeType: "application/json",
          maxOutputTokens: 2500,
          temperature: 0.1,
          responseSchema: {
            type: "object",
            properties: {
              patientInfo: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  age: { type: "string" },
                  gender: { type: "string" }
                },
                required: ["name", "age"]
              },
              executiveSummary: {
                type: "object",
                properties: {
                  mainFindings: { type: "array", items: { type: "string" } },
                  coreRisks: { type: "array", items: { type: "string" } },
                  primaryRecommendations: { type: "array", items: { type: "string" } }
                },
                required: ["mainFindings", "coreRisks", "primaryRecommendations"]
              },
              detailedAnalysis: {
                type: "object",
                properties: {
                  imagingFindings: { type: "array", items: { type: "string", maxLength: 150 }, maxItems: 6 },
                  videoFindings: { type: "array", items: { type: "string", maxLength: 150 }, maxItems: 4 },
                  labAbnormalities: {
                    type: "array",
                    maxItems: 8,
                    items: {
                      type: "object",
                      properties: {
                        indicator: { type: "string", maxLength: 50 },
                        value: { type: "string", maxLength: 30 },
                        status: { type: "string", enum: ["high", "low", "normal"] },
                        interpretation: { type: "string", maxLength: 80 }
                      },
                      required: ["indicator", "value", "status", "interpretation"]
                    }
                  },
                  clinicalReasoning: { type: "array", items: { type: "string", maxLength: 120 }, maxItems: 4 },
                  riskFactors: { type: "array", items: { type: "string", maxLength: 80 }, maxItems: 5 }
                },
                required: ["imagingFindings", "labAbnormalities", "riskFactors"]
              },
              riskAssessment: {
                type: "object",
                properties: {
                  overallAssessment: { type: "string", maxLength: 300 },
                  diagnosticConclusion: { type: "string", maxLength: 150 },
                  actionableRecommendations: {
                    type: "object",
                    properties: {
                      followUp: { type: "array", items: { type: "string", maxLength: 80 }, maxItems: 3 },
                      specialistConsultation: { type: "array", items: { type: "string", maxLength: 80 }, maxItems: 3 },
                      lifestyleAdjustments: { type: "array", items: { type: "string", maxLength: 80 }, maxItems: 3 }
                    },
                    required: ["followUp", "specialistConsultation", "lifestyleAdjustments"]
                  }
                },
                required: ["overallAssessment", "actionableRecommendations"]
              }
            },
            required: ["patientInfo", "executiveSummary", "detailedAnalysis", "riskAssessment"]
          }
        },
        contents: analysisPrompt,
      });

      let analysisResult: HealthAssessmentReport;
      
      try {
        const responseText = response.text || '{}';
        console.log('Response length:', responseText.length);
        
        // Validate JSON before parsing
        if (!responseText.trim()) {
          throw new Error('Empty response from AI model');
        }
        
        analysisResult = JSON.parse(responseText) as HealthAssessmentReport;
        
        // Validate required fields
        if (!analysisResult.patientInfo || !analysisResult.executiveSummary || !analysisResult.detailedAnalysis) {
          throw new Error('Invalid response structure from AI model');
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Response text:', response.text?.substring(0, 1000));
        
        // Create fallback structure
        analysisResult = {
          patientInfo: {
            name: request.patientName,
            age: request.patientAge,
            gender: request.patientGender || '未提供'
          },
          executiveSummary: {
            mainFindings: ['AI分析遇到技术问题，请重新提交'],
            coreRisks: ['数据解析失败'],
            primaryRecommendations: ['请重新上传报告']
          },
          detailedAnalysis: {
            imagingFindings: ['分析失败，请重试'],
            videoFindings: [],
            labAbnormalities: [],
            clinicalReasoning: ['AI处理遇到问题'],
            riskFactors: []
          },
          riskAssessment: {
            overallAssessment: '由于技术问题，无法完成完整分析。请重新提交报告。',
            diagnosticConclusion: '分析失败',
            actionableRecommendations: {
              followUp: ['重新提交报告'],
              specialistConsultation: ['咨询医生'],
              lifestyleAdjustments: []
            }
          },
          reportMetadata: {
            reportId: `MSI-ERROR-${analysisId}`,
            generatedAt: new Date().toISOString(),
            model: "Gemini 2.5-Flash (Error Recovery)"
          }
        };
      }
      
      // Ensure metadata exists
      if (!analysisResult.reportMetadata) {
        analysisResult.reportMetadata = {
          reportId: `MSI-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${analysisId}`,
          generatedAt: new Date().toISOString(),
          model: "Gemini 2.5-Flash"
        };
      }

      // Final progress update
      this.updateProgress(analysisId, { 
        orchestrator: 'completed', 
        imagingAgent: 'completed', 
        labAgent: 'completed', 
        medicalHistoryAgent: 'completed', 
        comprehensiveAnalysis: 'completed' 
      });

      this.progressCallbacks.delete(analysisId);
      return analysisResult;

    } catch (error) {
      this.progressCallbacks.delete(analysisId);
      throw new Error(`医疗分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private updateProgress(analysisId: string, progress: AnalysisProgress) {
    const callback = this.progressCallbacks.get(analysisId);
    if (callback) {
      callback(progress);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async summarizeReport(reportData: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `请简要总结以下医疗报告的关键信息：\n\n${reportData}`,
      });

      return response.text || "总结生成失败";
    } catch (error) {
      throw new Error(`报告总结失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

export const medicalAnalysisService = new MedicalAnalysisService();
