import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { medicalAnalysisService } from "./services/medicalAnalysis";
import { analysisRequestSchema } from "@shared/schema";
import type { AnalysisProgress } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Medical report analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const validatedData = analysisRequestSchema.parse(req.body);
      
      let progressData: AnalysisProgress | null = null;
      
      const analysisResult = await medicalAnalysisService.analyzeReport(
        validatedData,
        (progress) => {
          progressData = progress;
        }
      );

      // Save the report to storage
      const savedReport = await storage.createMedicalReport({
        patientName: validatedData.patientName,
        patientAge: validatedData.patientAge,
        patientGender: validatedData.patientGender,
        reportData: validatedData.reportData,
        analysisResult: analysisResult,
      });

      res.json({
        success: true,
        reportId: savedReport.id,
        analysis: analysisResult,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "分析失败",
      });
    }
  });

  // Get historical reports for a patient
  app.get("/api/reports/patient/:patientName", async (req, res) => {
    try {
      const { patientName } = req.params;
      const reports = await storage.getMedicalReportsByPatient(decodeURIComponent(patientName));
      
      res.json({
        success: true,
        reports: reports.map(report => ({
          id: report.id,
          patientName: report.patientName,
          patientAge: report.patientAge,
          patientGender: report.patientGender,
          createdAt: report.createdAt,
          analysis: report.analysisResult,
        })),
      });
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "获取报告失败",
      });
    }
  });

  // Get a specific report
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getMedicalReport(reportId);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          error: "报告不存在",
        });
      }
      
      res.json({
        success: true,
        report: {
          id: report.id,
          patientName: report.patientName,
          patientAge: report.patientAge,
          patientGender: report.patientGender,
          reportData: report.reportData,
          createdAt: report.createdAt,
          analysis: report.analysisResult,
        },
      });
    } catch (error) {
      console.error("Get report error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "获取报告失败",
      });
    }
  });

  // Get all reports (for admin/overview)
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getAllMedicalReports();
      
      res.json({
        success: true,
        reports: reports.map(report => ({
          id: report.id,
          patientName: report.patientName,
          patientAge: report.patientAge,
          patientGender: report.patientGender,
          createdAt: report.createdAt,
          hasAnalysis: !!report.analysisResult,
        })),
      });
    } catch (error) {
      console.error("Get all reports error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "获取报告列表失败",
      });
    }
  });

  // Report summary endpoint (using Gemini 2.5-Flash for quick summaries)
  app.post("/api/summarize", async (req, res) => {
    try {
      const { reportData } = req.body;
      
      if (!reportData || typeof reportData !== 'string') {
        return res.status(400).json({
          success: false,
          error: "报告数据不能为空",
        });
      }

      const summary = await medicalAnalysisService.summarizeReport(reportData);
      
      res.json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error("Summarize error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "总结生成失败",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
