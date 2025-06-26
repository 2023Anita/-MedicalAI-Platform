import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mammoth from 'mammoth';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import dicomParser from 'dicom-parser';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'video/mp4',
      'application/dicom'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.dcm')) {
      cb(null, true);
    } else {
      const error = new Error('不支持的文件格式') as any;
      cb(error, false);
    }
  }
});

export interface ProcessedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  extractedText?: string;
  metadata?: any;
  thumbnailPath?: string;
}

export class FileProcessorService {
  async processFiles(files: Express.Multer.File[]): Promise<ProcessedFile[]> {
    const processedFiles: ProcessedFile[] = [];

    for (const file of files) {
      try {
        const processed = await this.processFile(file);
        processedFiles.push(processed);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Continue processing other files even if one fails
      }
    }

    return processedFiles;
  }

  private async processFile(file: Express.Multer.File): Promise<ProcessedFile> {
    const baseResult: ProcessedFile = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };

    switch (file.mimetype) {
      case 'application/pdf':
        return await this.processPDF(file, baseResult);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return await this.processWord(file, baseResult);
      
      case 'image/png':
      case 'image/jpeg':
      case 'image/jpg':
        return await this.processImage(file, baseResult);
      
      case 'video/mp4':
        return await this.processVideo(file, baseResult);
      
      default:
        // Check for DICOM files
        if (file.originalname.toLowerCase().endsWith('.dcm')) {
          return await this.processDICOM(file, baseResult);
        }
        return baseResult;
    }
  }

  private async processPDF(file: Express.Multer.File, result: ProcessedFile): Promise<ProcessedFile> {
    try {
      // For now, we'll just note that it's a PDF file and set basic metadata
      // In a production environment, you would use a proper PDF parsing library
      result.extractedText = `PDF文件: ${file.originalname} - 请手动输入PDF内容或使用专业PDF阅读软件提取文本内容`;
      result.metadata = {
        type: 'PDF Document',
        size: file.size,
        note: '需要手动提取文本内容'
      };
    } catch (error) {
      console.error('PDF processing error:', error);
    }
    
    return result;
  }

  private async processWord(file: Express.Multer.File, result: ProcessedFile): Promise<ProcessedFile> {
    try {
      const dataBuffer = fs.readFileSync(file.path);
      const mammothResult = await mammoth.extractRawText({ buffer: dataBuffer });
      
      result.extractedText = mammothResult.value;
      if (mammothResult.messages.length > 0) {
        result.metadata = { warnings: mammothResult.messages };
      }
    } catch (error) {
      console.error('Word processing error:', error);
    }
    
    return result;
  }

  private async processImage(file: Express.Multer.File, result: ProcessedFile): Promise<ProcessedFile> {
    try {
      const image = sharp(file.path);
      const metadata = await image.metadata();
      
      result.metadata = {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        density: metadata.density,
      };

      // Create thumbnail
      const thumbnailPath = file.path.replace(/(\.[^.]+)$/, '_thumb$1');
      await image
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .toFile(thumbnailPath);
      
      result.thumbnailPath = thumbnailPath;

      // Use Gemini to analyze medical images and extract text
      const extractedText = await this.analyzeImageWithGemini(file.path);
      if (extractedText) {
        result.extractedText = extractedText;
      }
    } catch (error) {
      console.error('Image processing error:', error);
    }
    
    return result;
  }

  private async analyzeImageWithGemini(imagePath: string): Promise<string> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY || "" 
      });

      const imageBytes = fs.readFileSync(imagePath);
      const base64Image = imageBytes.toString('base64');

      // Determine MIME type based on file extension
      const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          `请详细分析这张医疗图像，如果这是化验报告单、检查报告或医学影像，请：

1. 识别并提取所有数字、指标名称和数值
2. 识别患者信息（如有）
3. 提取检查项目、检查结果和参考范围
4. 识别异常指标和建议
5. 转录所有可见的医疗文本内容

请以结构化格式输出，包含：
- 报告类型：[血常规/生化/影像学等]
- 患者信息：[姓名、年龄、性别等]
- 检查项目和结果：
  - 项目名称：数值 [参考范围] 状态
- 异常指标：[列出所有异常项目]
- 医生建议：[如有]
- 其他重要信息：[日期、医院等]

如果不是医疗相关图像，请简要说明图像内容。`
        ]
      });

      return response.text || '';
    } catch (error) {
      console.error('Gemini image analysis error:', error);
      return `图像文件: ${path.basename(imagePath)} - 图像分析失败，请手动输入图像中的文本内容`;
    }
  }

  private async processVideo(file: Express.Multer.File, result: ProcessedFile): Promise<ProcessedFile> {
    try {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(file.path, (err, metadata) => {
          if (err) {
            console.error('Video processing error:', err);
            resolve(result);
            return;
          }

          result.metadata = {
            duration: metadata.format.duration,
            bitrate: metadata.format.bit_rate,
            size: metadata.format.size,
            streams: metadata.streams.map(stream => ({
              codec: stream.codec_name,
              type: stream.codec_type,
              width: stream.width,
              height: stream.height,
              fps: stream.r_frame_rate,
            })),
          };

          // Generate thumbnail
          const thumbnailPath = file.path.replace(/\.[^.]+$/, '_thumb.jpg');
          ffmpeg(file.path)
            .screenshots({
              timestamps: ['10%'],
              filename: path.basename(thumbnailPath),
              folder: path.dirname(thumbnailPath),
              size: '300x300'
            })
            .on('end', async () => {
              result.thumbnailPath = thumbnailPath;
              
              // Analyze video content with Gemini for medical videos
              try {
                const videoAnalysis = await this.analyzeVideoWithGemini(file.path);
                if (videoAnalysis) {
                  result.extractedText = videoAnalysis;
                }
              } catch (error) {
                console.error('Video analysis error:', error);
              }
              
              resolve(result);
            })
            .on('error', (error) => {
              console.error('Thumbnail generation error:', error);
              resolve(result);
            });
        });
      });
    } catch (error) {
      console.error('Video processing error:', error);
      return result;
    }
  }

  private async analyzeVideoWithGemini(videoPath: string): Promise<string> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY || "" 
      });

      const videoBytes = fs.readFileSync(videoPath);
      const base64Video = videoBytes.toString('base64');

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Video,
              mimeType: "video/mp4"
            }
          },
          `请分析这个医疗视频内容，如果包含医疗检查、手术或诊断相关内容，请提取：

1. 视频类型（超声、内镜、X光透视等）
2. 检查部位和发现
3. 可见的异常表现
4. 医疗设备读数或测量值
5. 医生的口述内容或诊断意见

请以结构化格式输出：
- 视频类型：[检查类型]
- 检查部位：[部位描述]
- 主要发现：[检查结果]
- 异常表现：[如有异常]
- 测量数据：[如有数值]
- 诊断意见：[医生建议]

如果不是医疗视频，请简要说明视频内容。`
        ]
      });

      return response.text || '';
    } catch (error) {
      console.error('Gemini video analysis error:', error);
      return `视频文件: ${path.basename(videoPath)} - 视频分析失败，建议手动描述视频中的医疗内容`;
    }
  }

  private async processDICOM(file: Express.Multer.File, result: ProcessedFile): Promise<ProcessedFile> {
    try {
      const dataBuffer = fs.readFileSync(file.path);
      const dataSet = dicomParser.parseDicom(dataBuffer);
      
      // Extract key DICOM metadata
      const patientName = dataSet.string('x00100010');
      const studyDate = dataSet.string('x00080020');
      const modality = dataSet.string('x00080060');
      const studyDescription = dataSet.string('x00081030');
      const seriesDescription = dataSet.string('x0008103e');
      
      result.metadata = {
        patientName,
        studyDate,
        modality,
        studyDescription,
        seriesDescription,
        transferSyntax: dataSet.string('x00020010'),
      };

      // Extract readable information for analysis
      result.extractedText = `
DICOM医学影像报告:
患者姓名: ${patientName || '未知'}
检查日期: ${studyDate || '未知'}
检查方式: ${modality || '未知'}
检查描述: ${studyDescription || '未提供'}
序列描述: ${seriesDescription || '未提供'}
      `.trim();
    } catch (error) {
      console.error('DICOM processing error:', error);
    }
    
    return result;
  }

  // Clean up uploaded files
  async cleanupFiles(files: ProcessedFile[]): Promise<void> {
    for (const file of files) {
      try {
        if (fs.existsSync(`uploads/${file.filename}`)) {
          fs.unlinkSync(`uploads/${file.filename}`);
        }
        if (file.thumbnailPath && fs.existsSync(file.thumbnailPath)) {
          fs.unlinkSync(file.thumbnailPath);
        }
      } catch (error) {
        console.error(`Error cleaning up file ${file.filename}:`, error);
      }
    }
  }
}

export const fileProcessorService = new FileProcessorService();