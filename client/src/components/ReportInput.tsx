import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Brain, Upload, Shield, File, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { analysisRequestSchema } from "@shared/schema";
import type { AnalysisRequest, HealthAssessmentReport, AnalysisProgress } from "@shared/schema";

interface ReportInputProps {
  onAnalysisStart: (patientName: string) => void;
  onAnalysisComplete: (report: HealthAssessmentReport) => void;
  onProgressUpdate: (progress: AnalysisProgress) => void;
  isAnalyzing: boolean;
}

export default function ReportInput({
  onAnalysisStart,
  onAnalysisComplete,
  onProgressUpdate,
  isAnalyzing
}: ReportInputProps) {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const form = useForm<AnalysisRequest>({
    resolver: zodResolver(analysisRequestSchema),
    defaultValues: {
      patientName: "",
      patientAge: "",
      patientGender: "",
      examDate: new Date().toISOString().split('T')[0],
      reportData: "",
      compareWithHistory: false,
    },
  });

  const analysisMutation = useMutation({
    mutationFn: async (data: AnalysisRequest) => {
      const formData = new FormData();
      formData.append('patientName', data.patientName);
      formData.append('patientAge', data.patientAge);
      formData.append('patientGender', data.patientGender || '');
      formData.append('examDate', data.examDate);
      formData.append('reportData', data.reportData);
      formData.append('compareWithHistory', data.compareWithHistory?.toString() || 'false');
      
      // Add selected files
      selectedFiles.forEach((file, index) => {
        formData.append('files', file);
      });

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onMutate: (data) => {
      onAnalysisStart(data.patientName);
    },
    onSuccess: (data) => {
      if (data.success) {
        onAnalysisComplete(data.analysis);
        toast({
          title: "分析完成",
          description: `健康评估报告已生成${data.processedFiles ? `，处理了 ${data.processedFiles} 个文件` : ''}`,
        });
        setSelectedFiles([]);
      } else {
        throw new Error(data.error || "分析失败");
      }
    },
    onError: (error) => {
      toast({
        title: "分析失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
      setSelectedFiles([]);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'video/mp4'
    ];

    const validFiles = files.filter(file => {
      const isValidType = allowedTypes.includes(file.type) || file.name.toLowerCase().endsWith('.dcm');
      if (!isValidType) {
        toast({
          title: "文件格式不支持",
          description: `文件 ${file.name} 格式不支持`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    event.target.value = ''; // Reset input
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('image')) return '🖼️';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type.includes('video')) return '🎥';
    if (file.name.toLowerCase().endsWith('.dcm')) return '🏥';
    return '📁';
  };

  const onSubmit = (data: AnalysisRequest) => {
    if (data.reportData.trim() || selectedFiles.length > 0) {
      analysisMutation.mutate(data);
      
      // Simulate progress updates
      setTimeout(() => onProgressUpdate({
        orchestrator: 'completed',
        imagingAgent: 'processing',
        labAgent: 'pending',
        medicalHistoryAgent: 'pending',
        comprehensiveAnalysis: 'pending'
      }), 1000);
      
      setTimeout(() => onProgressUpdate({
        orchestrator: 'completed',
        imagingAgent: 'completed',
        labAgent: 'processing',
        medicalHistoryAgent: 'pending',
        comprehensiveAnalysis: 'pending'
      }), 2500);
      
      setTimeout(() => onProgressUpdate({
        orchestrator: 'completed',
        imagingAgent: 'completed',
        labAgent: 'completed',
        medicalHistoryAgent: 'processing',
        comprehensiveAnalysis: 'pending'
      }), 4000);
      
      setTimeout(() => onProgressUpdate({
        orchestrator: 'completed',
        imagingAgent: 'completed',
        labAgent: 'completed',
        medicalHistoryAgent: 'completed',
        comprehensiveAnalysis: 'processing'
      }), 5000);
    } else {
      toast({
        title: "数据缺失",
        description: "请输入体检报告数据或上传相关文件",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white shadow-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-professional">
          <Upload className="text-primary mr-3 w-5 h-5" />
          数据输入
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormLabel className="text-sm font-medium text-professional mb-2 block">
                患者信息
              </FormLabel>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="姓名" 
                          {...field} 
                          className="text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="patientAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="年龄" 
                          {...field}
                          className="text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="patientGender"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="性别（可选）" 
                          {...field}
                          className="text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="examDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="date"
                            {...field}
                            className="text-sm focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* File Upload Section */}
            <div>
              <FormLabel className="text-sm font-medium text-professional mb-2 block">
                文件上传
              </FormLabel>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.mp4,.dcm"
                  className="hidden"
                  id="file-upload"
                  disabled={isAnalyzing}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    点击上传或拖拽文件到此处
                  </span>
                  <span className="text-xs text-muted-foreground">
                    支持: PDF, DOCX, 图片(PNG/JPG), 视频(MP4), DICOM(.dcm)
                  </span>
                </label>
              </div>
              
              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-professional">已选择文件：</p>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted rounded p-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFileIcon(file)}</span>
                        <span className="text-sm text-professional truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isAnalyzing}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="reportData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-professional">
                    体检报告数据
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      className="h-48 text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="请粘贴体检报告内容，包括影像学检查、实验室检验、个人病史等信息..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-2">
                    支持文本格式，系统将自动识别不同类型的医疗数据
                  </p>
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="compareWithHistory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-border"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-muted-foreground">
                      与历史报告对比
                    </FormLabel>
                  </FormItem>
                )}
              />
              <div className="flex items-center text-xs text-muted-foreground">
                <Shield className="w-3 h-3 mr-1" />
                数据加密保护
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full medical-primary py-3 font-medium hover:bg-opacity-90 transition-colors"
              disabled={isAnalyzing}
            >
              <Brain className="mr-2 w-4 h-4" />
              {isAnalyzing ? "正在分析..." : "开始智能分析"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
