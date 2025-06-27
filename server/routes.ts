import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { medicalAnalysisService } from "./services/medicalAnalysis";
import { upload, fileProcessorService } from "./services/fileProcessor";
import { analysisRequestSchema } from "@shared/schema";
import type { AnalysisProgress } from "@shared/schema";

// Extend Request interface for session
declare module 'express-session' {
  interface SessionData {
    userId: number;
    userEmail: string;
  }
}

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

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被注册'
        });
      }

      // Create new user
      const newUser = await storage.createUser({
        username: email,
        password: password // In production, hash the password
      });

      // Set session
      req.session.userId = newUser.id;
      req.session.userEmail = email;
      
      console.log(`New user registered: ${email}`);
      
      res.json({ 
        success: true, 
        message: '注册成功，您现在可以直接使用系统',
        user: { id: newUser.id, email: email }
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
      
      // Check if user exists and password matches
      const user = await storage.getUserByUsername(email);
      if (!user || user.password !== password) { // In production, use proper password hashing
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userEmail = email;
      
      console.log(`User login: ${email}`);
      
      res.json({ 
        success: true, 
        message: '登录成功',
        user: { id: user.id, email: email }
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

      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          error: "用户未登录，请先登录"
        });
      }

      // Save the report to storage with user association
      const savedReport = await storage.createMedicalReport({
        userId: req.session.userId,
        patientName: validatedData.patientName,
        patientAge: validatedData.patientAge,
        patientGender: validatedData.patientGender,
        examDate: new Date(validatedData.examDate),
        reportData: combinedReportData || "",
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

  // Get user-specific reports
  app.get("/api/reports", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          error: "用户未登录"
        });
      }

      const reports = await storage.getMedicalReportsByUser(req.session.userId);
      
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
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          error: "用户未登录"
        });
      }

      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) {
        return res.status(400).json({
          success: false,
          error: "无效的报告ID",
        });
      }

      // Verify the report belongs to the user before deleting
      const report = await storage.getMedicalReport(reportId);
      if (!report || report.userId !== req.session.userId) {
        return res.status(404).json({
          success: false,
          error: "报告不存在或无权限删除",
        });
      }

      const deleted = await storage.deleteMedicalReport(reportId, req.session.userId);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: "删除报告失败",
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
      const sessionData = req.session as any;
      if (!sessionData?.userId) {
        return res.status(401).json({ success: false, error: "请先登录" });
      }

      const { message } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!message && (!files || files.length === 0)) {
        return res.status(400).json({
          success: false,
          error: "请提供消息或上传文件",
        });
      }

      console.log("Chat request from user:", sessionData.userId, "Message:", message?.substring(0, 100));

      // Get user's historical medical data for context
      const userReports = await storage.getMedicalReportsByUser(sessionData.userId);
      console.log(`Found ${userReports.length} historical reports for user context`);

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
          combinedContent = message ? `${message}\n\n当前上传文件内容:${extractedTexts}` : `请分析以下文件内容:${extractedTexts}`;
        }
      }

      // Build historical medical context
      let historicalContext = '';
      if (userReports.length > 0) {
        historicalContext = '\n\n=== 用户历史医疗记录参考 ===\n';
        userReports.slice(-3).forEach((report, index) => { // Only use last 3 reports to avoid token limit
          const analysis = report.analysisResult as any;
          historicalContext += `\n历史报告 ${index + 1} (${report.createdAt.toLocaleDateString()}):
患者: ${report.patientName}, ${report.patientAge}岁 ${report.patientGender || ''}
检查日期: ${report.examDate.toLocaleDateString()}
报告内容: ${report.reportData.substring(0, 200)}...
主要发现: ${analysis?.executiveSummary?.mainFindings?.slice(0, 3).join(', ') || '无'}
核心风险: ${analysis?.executiveSummary?.coreRisks?.slice(0, 3).join(', ') || '无'}
主要建议: ${analysis?.executiveSummary?.primaryRecommendations?.slice(0, 3).join(', ') || '无'}
`;
        });
      }

      // Combine all context
      combinedContent += historicalContext;

      // Create AI prompt for context-aware medical conversation
      const systemPrompt = `您是Med Agentic-AI智能医疗助手。您正在与一位已有医疗历史记录的用户对话。

【重要能力】:
1. 结合用户的历史医疗数据提供个性化建议
2. 识别历史报告中的趋势和变化
3. 基于既往检查结果进行对比分析
4. 提供连续性医疗建议和健康管理指导

【对话规则】:
- 绝对禁止使用星号、井号等Markdown符号
- 重点内容用【】标注
- 列表用数字编号
- 专业术语后用括号解释
- 可以引用历史记录中的具体数据进行说明
- 如果用户询问历史趋势，主动分析既往数据
- 提供基于历史数据的个性化健康建议

用户输入：`;
      const chatPrompt = systemPrompt + combinedContent;

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
          maxOutputTokens: 4096, // Reduced for faster response
          topP: 0.95,
          topK: 40,
        }
      });

      let aiResponse;
      
      // Try different ways to extract the response text
      if (response.text) {
        aiResponse = response.text;
      } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        aiResponse = response.candidates[0].content.parts?.map(part => part.text).join('') || null;
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
        
        // Clean up any remaining Markdown formatting
        aiResponse = aiResponse
          .replace(/\*\*(.*?)\*\*/g, '【$1】')  // Convert **text** to 【text】
          .replace(/\*(.*?)\*/g, '$1')         // Remove single asterisks
          .replace(/#{1,6}\s+/g, '')           // Remove headers
          .replace(/`(.*?)`/g, '$1')           // Remove code backticks
          .replace(/^[-*+]\s+/gm, '• ')        // Convert list markers to bullets
          .replace(/^\d+\.\s+/gm, (match) => match); // Keep numbered lists as is
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
