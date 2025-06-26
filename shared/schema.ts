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
  patientGender: z.string().optional(),
  examDate: z.string().min(1, "体检日期不能为空"),
  reportData: z.string().min(10, "报告数据不能少于10个字符"),
  compareWithHistory: z.boolean().optional(),
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
    videoFindings?: string[];
    labAbnormalities: Array<{
      indicator: string;
      value: string;
      status: 'high' | 'low' | 'normal';
      interpretation: string;
    }>;
    clinicalReasoning: string[];
    riskFactors: string[];
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
  };
}
