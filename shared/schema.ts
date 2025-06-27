import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const medicalReports = pgTable("medical_reports", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  patientAge: text("patient_age").notNull(),
  patientGender: text("patient_gender"),
  examDate: timestamp("exam_date").notNull(),
  reportData: text("report_data").notNull(),
  uploadedFiles: jsonb("uploaded_files"),
  analysisResult: jsonb("analysis_result"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMedicalReportSchema = createInsertSchema(medicalReports).pick({
  patientName: true,
  patientAge: true,
  patientGender: true,
  examDate: true,
  reportData: true,
});

export const analysisRequestSchema = z.object({
  patientName: z.string().min(1, "患者姓名不能为空"),
  patientAge: z.string().min(1, "患者年龄不能为空"),
  patientGender: z.string().min(1, "请选择患者性别"),
  examDate: z.string().min(1, "体检日期不能为空"),
  reportData: z.string().optional(),
  compareWithHistory: z.boolean().optional(),
}).refine((data) => {
  // 至少需要有文本内容或文件上传其中一个
  const hasTextData = data.reportData && data.reportData.trim().length >= 10;
  return hasTextData; // 这里我们假设文件会在后端验证
}, {
  message: "请至少填写体检报告文本内容或上传医疗文件",
  path: ["reportData"]
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MedicalReport = typeof medicalReports.$inferSelect;
export type InsertMedicalReport = z.infer<typeof insertMedicalReportSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

export interface AnalysisProgress {
  orchestrator: 'pending' | 'processing' | 'completed';
  imagingAgent: 'pending' | 'processing' | 'completed';
  labAgent: 'pending' | 'processing' | 'completed';
  medicalHistoryAgent: 'pending' | 'processing' | 'completed';
  comprehensiveAnalysis: 'pending' | 'processing' | 'completed';
}

export interface HealthAssessmentReport {
  patientInfo: {
    name: string;
    age: string;
    gender?: string;
  };
  executiveSummary: {
    mainFindings: string[];
    coreRisks: string[];
    primaryRecommendations: string[];
  };
  detailedAnalysis: {
    imagingFindings: string[];
    videoFindings?: Array<{
      finding: string;
      medicalTerms: string;
      patientExplanation: string;
      significance: string;
    }>;
    labAbnormalities: Array<{
      indicator: string;
      value: string;
      status: 'high' | 'low' | 'normal';
      interpretation: string;
      patientFriendly: string;
    }>;
    clinicalReasoning: string[];
    riskFactors: string[];
    possibleDiagnoses: Array<{
      diagnosis: string;
      probability: 'high' | 'moderate' | 'low';
      reasoning: string;
      patientExplanation: string;
    }>;
    differentialDiagnosis: Array<{
      condition: string;
      likelihood: string;
      distinguishingFeatures: string;
      explanation: string;
    }>;
    imagingReportSummary: {
      technicalFindings: string[];
      clinicalCorrelation: string;
      patientSummary: string;
      nextSteps: string[];
    };
  };
  riskAssessment: {
    overallAssessment: string;
    diagnosticConclusion: string;
    actionableRecommendations: {
      followUp: string[];
      specialistConsultation: string[];
      lifestyleAdjustments: string[];
    };
  };
  reportMetadata: {
    reportId: string;
    generatedAt: string;
    model: string;
    hasVideoFiles?: boolean;
    hasImageFiles?: boolean;
    uploadedFileTypes?: string[];
  };
}
