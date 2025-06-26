import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export async function analyzeMedicalReport(reportData: string, patientInfo: any): Promise<any> {
  const prompt = `你将扮演一个名为 "医检智解 (MediScan-Insight)" 的高级 Agentic AI 系统。你的唯一任务是接收用户提供的体检报告数据，并模拟一个多智能体（Agentic）架构，对数据进行全面分析，最终生成一份综合健康评估报告。

患者信息：
姓名：${patientInfo.name}
年龄：${patientInfo.age}
性别：${patientInfo.gender || '未提供'}

体检报告数据：
${reportData}

请进行全面分析并返回结构化的健康评估报告。`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    config: {
      responseMimeType: "application/json",
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
              imagingFindings: { type: "array", items: { type: "string" } },
              labAbnormalities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    indicator: { type: "string" },
                    value: { type: "string" },
                    status: { type: "string", enum: ["high", "low", "normal"] },
                    interpretation: { type: "string" }
                  },
                  required: ["indicator", "value", "status", "interpretation"]
                }
              },
              riskFactors: { type: "array", items: { type: "string" } }
            },
            required: ["imagingFindings", "labAbnormalities", "riskFactors"]
          },
          riskAssessment: {
            type: "object",
            properties: {
              overallAssessment: { type: "string" },
              actionableRecommendations: {
                type: "object",
                properties: {
                  followUp: { type: "array", items: { type: "string" } },
                  specialistConsultation: { type: "array", items: { type: "string" } },
                  lifestyleAdjustments: { type: "array", items: { type: "string" } }
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
    contents: prompt,
  });

  return JSON.parse(response.text || '{}');
}

export async function summarizeReport(reportData: string): Promise<string> {
  const prompt = `请简要总结以下医疗报告的关键信息：\n\n${reportData}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "总结生成失败";
}

export async function quickAnalysis(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `作为医疗专家，请对以下内容进行快速分析：\n\n${text}`,
  });

  return response.text || "分析失败";
}
