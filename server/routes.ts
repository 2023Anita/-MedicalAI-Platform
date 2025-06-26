import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { medicalAnalysisService } from "./services/medicalAnalysis";
import { upload, fileProcessorService } from "./services/fileProcessor";
import { analysisRequestSchema } from "@shared/schema";
import type { AnalysisProgress } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload endpoint for medical reports
  app.post("/api/upload", upload.array('files', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "没有上传文件",
        });
      }

      const processedFiles = await fileProcessorService.processFiles(files);
      
      res.json({
        success: true,
        files: processedFiles,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "文件上传失败",
      });
    }
  });

  // Medical report analysis endpoint with file support
  app.post("/api/analyze", upload.array('files', 10), async (req, res) => {
    try {
      const validatedData = analysisRequestSchema.parse({
        ...req.body,
        examDate: req.body.examDate || new Date().toISOString().split('T')[0],
      });
      
      let processedFiles: any[] = [];
      let combinedReportData = validatedData.reportData;

      // Process uploaded files if any
      if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const files = req.files as Express.Multer.File[];
        processedFiles = await fileProcessorService.processFiles(files);
        
        // Combine extracted text from files with manual input
        const extractedTexts = processedFiles
          .filter(file => file.extractedText)
          .map(file => `\n\n=== ${file.originalName} ===\n${file.extractedText}`)
          .join('\n');
        
        if (extractedTexts) {
          combinedReportData = validatedData.reportData + extractedTexts;
        }
      }
      
      let progressData: AnalysisProgress | null = null;
      
      const analysisResult = await medicalAnalysisService.analyzeReport(
        { ...validatedData, reportData: combinedReportData },
        (progress) => {
          progressData = progress;
        }
      );

      // Save the report to storage
      const savedReport = await storage.createMedicalReport({
        patientName: validatedData.patientName,
        patientAge: validatedData.patientAge,
        patientGender: validatedData.patientGender,
        examDate: new Date(validatedData.examDate),
        reportData: combinedReportData,
        analysisResult: analysisResult,
        uploadedFiles: processedFiles,
      });

      res.json({
        success: true,
        reportId: savedReport.id,
        analysis: analysisResult,
        processedFiles: processedFiles.length,
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
