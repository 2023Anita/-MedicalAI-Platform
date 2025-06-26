import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { medicalAnalysisService } from "./services/medicalAnalysis";
import { upload, fileProcessorService } from "./services/fileProcessor";
import { analysisRequestSchema } from "@shared/schema";
import type { AnalysisProgress } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User registration route
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: '邮箱和密码都是必填项' 
        });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: '密码长度至少需要6个字符' 
        });
      }
      
      // Log the registration request
      console.log(`New user registered: ${email}`);
      
      res.json({ 
        success: true, 
        message: '注册成功，您现在可以直接使用系统' 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: '服务器错误，请稍后重试' 
      });
    }
  });

  // User login route
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: '邮箱和密码都是必填项' 
        });
      }
      
      // In a real app, you would verify credentials against database
      console.log(`User login: ${email}`);
      
      res.json({ 
        success: true, 
        message: '登录成功' 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: '服务器错误，请稍后重试' 
      });
    }
  });

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
      // Handle FormData conversion for proper validation
      const formData = {
        patientName: req.body.patientName || '',
        patientAge: req.body.patientAge || '',
        patientGender: req.body.patientGender || '',
        examDate: req.body.examDate || new Date().toISOString().split('T')[0],
        reportData: req.body.reportData || '',
        compareWithHistory: req.body.compareWithHistory === 'true',
      };
      
      const validatedData = analysisRequestSchema.parse(formData);
      
      let processedFiles: any[] = [];
      let combinedReportData = validatedData.reportData;

      // Process uploaded files if any
      if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const files = req.files as Express.Multer.File[];
        processedFiles = await fileProcessorService.processFiles(files);
        
        // Combine extracted text from files with enhanced medical analysis
        const extractedTexts = processedFiles
          .filter(file => file.extractedText)
          .map(file => {
            const fileType = file.mimeType.startsWith('image/') ? '医学影像分析' : 
                           file.mimeType.startsWith('video/') ? '医学视频分析' : '医学文档';
            return `\n\n=== ${fileType}: ${file.originalName} ===\n${file.extractedText}`;
          })
          .join('\n');
        
        if (extractedTexts) {
          combinedReportData = validatedData.reportData + '\n\n=== 影像与视频诊断分析 ===' + extractedTexts;
        }
      }
      
      // Track uploaded file types
      const hasVideoFiles = processedFiles.some(file => file.mimeType.startsWith('video/'));
      const hasImageFiles = processedFiles.some(file => file.mimeType.startsWith('image/'));
      const uploadedFileTypes = processedFiles.map(file => file.mimeType);
      
      let progressData: AnalysisProgress | null = null;
      
      const analysisResult = await medicalAnalysisService.analyzeReport(
        { ...validatedData, reportData: combinedReportData },
        (progress) => {
          progressData = progress;
        },
        { hasVideoFiles, hasImageFiles, uploadedFileTypes }
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
      if (isNaN(reportId)) {
        return res.status(400).json({
          success: false,
          error: "无效的报告ID",
        });
      }
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
          analysisResult: report.analysisResult,
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

  // Delete a specific report
  app.delete("/api/reports/:id", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) {
        return res.status(400).json({
          success: false,
          error: "无效的报告ID",
        });
      }

      const deleted = await storage.deleteMedicalReport(reportId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "报告不存在或删除失败",
        });
      }

      res.json({
        success: true,
        message: "报告删除成功",
      });
    } catch (error) {
      console.error("Delete report error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "删除报告失败",
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

  // Chat API endpoint for AI conversations
  app.post("/api/chat", upload.array('files'), async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!message && (!files || files.length === 0)) {
        return res.status(400).json({
          success: false,
          error: "请提供消息或上传文件",
        });
      }

      let combinedContent = message || '';
      let processedFiles: any[] = [];

      // Process uploaded files if any
      if (files && files.length > 0) {
        processedFiles = await fileProcessorService.processFiles(files);
        
        // Extract content from files
        const extractedTexts = processedFiles
          .filter(file => file.extractedText)
          .map(file => {
            const fileType = file.mimeType.startsWith('image/') ? '图像分析' : 
                           file.mimeType.startsWith('video/') ? '视频分析' : '文档内容';
            return `\n\n=== ${fileType}: ${file.originalName} ===\n${file.extractedText}`;
          })
          .join('\n');
        
        if (extractedTexts) {
          combinedContent = message ? `${message}\n\n文件内容:${extractedTexts}` : `请分析以下文件内容:${extractedTexts}`;
        }
      }

      // Create AI prompt for general conversation
      const chatPrompt = `您是Med Agentic-AI智能医疗助手。请根据用户的问题或上传的文件内容，提供专业、准确的医疗相关回答。

输出格式要求：
- 请使用纯文本格式，不要使用Markdown格式符号（**、*、#、-等）
- 重点内容用【】标注，例如：【烟雾病】、【重要提醒】
- 列表使用简单的数字编号或• 符号
- 段落之间用空行分隔
- 专业术语后用括号提供通俗解释

用户输入：
${combinedContent}

请提供：
1. 如果有文件分析，请详细解读文件内容
2. 针对用户问题的专业医疗建议
3. 如有必要，提供进一步的检查建议
4. 用简单易懂的语言解释医疗术语

注意：您的回答应该专业但易懂，适合患者阅读，并严格按照上述格式要求输出。`;

      // Get AI response using the same service as medical analysis
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY || "" 
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: chatPrompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 1000000,
          topP: 0.95,
          topK: 40,
        }
      });

      let aiResponse;
      
      // Try different ways to extract the response text
      if (response.text) {
        aiResponse = response.text;
      } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        aiResponse = response.candidates[0].content.parts.map(part => part.text).join('');
      } else {
        console.error("Unable to extract response text from response object");
        aiResponse = null;
      }
      
      // Simple response status logging
      console.log(`AI response received: ${aiResponse?.length || 0} characters`);
      if (response.candidates && response.candidates[0]) {
        console.log(`Response finish reason: ${response.candidates[0].finishReason}`);
      }
      
      // Check if response is complete
      if (!aiResponse) {
        console.error("No response text received from AI");
        aiResponse = "抱歉，我无法处理您的请求，请重新尝试。";
      } else if (aiResponse.length < 10) {
        console.warn("AI response seems incomplete:", aiResponse);
      } else {
        console.log("AI response appears complete, length:", aiResponse.length);
      }

      // Clean up temporary files
      if (processedFiles.length > 0) {
        await fileProcessorService.cleanupFiles(processedFiles);
      }

      res.json({
        success: true,
        message: aiResponse,
      });

    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({
        success: false,
        error: "对话处理失败，请稍后重试",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
