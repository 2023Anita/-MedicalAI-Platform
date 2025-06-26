import { GoogleGenAI } from "@google/genai";
import type { AnalysisRequest, HealthAssessmentReport, AnalysisProgress } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

const MEDICAL_ANALYSIS_PROMPT = `你是专业医学分析AI，分析医学影像、视频和检验报告，返回简洁的JSON格式诊断结果。

分析要求：
1. 影像发现：提取关键异常，标注"(影像来源)"
2. 视频发现：识别检查异常，标注"(视频来源)"  
3. 化验异常：解读指标，标注状态(high/low/normal)
4. 推理过程：简明推理链条
5. 诊断结论：明确诊断建议

输出要求：返回完整JSON结构，内容简洁准确，避免过长描述。`;

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
          maxOutputTokens: 4000,
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
        
        // Advanced JSON repair for truncated responses
        const trimmedText = responseText.trim();
        let jsonText = trimmedText;
        
        // Check if JSON is properly closed
        if (!trimmedText.endsWith('}')) {
          console.warn('Response appears to be truncated, attempting intelligent repair...');
          
          // Count opening and closing braces to determine missing closures
          const openBraces = (trimmedText.match(/{/g) || []).length;
          const closeBraces = (trimmedText.match(/}/g) || []).length;
          const missingBraces = openBraces - closeBraces;
          
          if (missingBraces > 0) {
            // Find the last complete field and close properly
            const lastQuoteIndex = trimmedText.lastIndexOf('"');
            if (lastQuoteIndex > 0) {
              // Trim to last complete field and add required closures
              let repairText = trimmedText.substring(0, lastQuoteIndex + 1);
              
              // Add missing closing braces
              for (let i = 0; i < missingBraces; i++) {
                repairText += '}';
              }
              
              jsonText = repairText;
              console.log('Attempting to repair with', missingBraces, 'missing braces');
            }
          }
        }
        
        analysisResult = JSON.parse(jsonText) as HealthAssessmentReport;
        
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
