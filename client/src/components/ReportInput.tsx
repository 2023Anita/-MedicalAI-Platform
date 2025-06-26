import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Brain, Upload, Shield, File, X, Calendar, Trash2 } from "lucide-react";
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
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      
      if (!isValidType) {
        toast({
          title: "文件格式不支持",
          description: `文件 ${file.name} 格式不支持`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "文件过大",
          description: `文件 ${file.name} 大小超过100MB限制`,
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
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-blue-200/50 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
            <Upload className="text-white w-4 h-4" />
          </div>
          数据输入
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormLabel className="text-sm font-medium text-gray-800 mb-3 block bg-blue-50 px-3 py-2 rounded-lg">
                患者信息
              </FormLabel>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="姓名" 
                          {...field} 
                          className="text-sm bg-white/70 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                          className="text-sm bg-white/70 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientGender"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="性别（可选）" 
                          {...field}
                          className="text-sm bg-white/70 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                            className="text-sm bg-white/70 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 pointer-events-none" />
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
              <FormLabel className="text-sm font-medium text-gray-800 mb-3 block bg-teal-50 px-3 py-2 rounded-lg">
                文件上传
              </FormLabel>
              <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors">
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
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    点击上传或拖拽文件到此处
                  </span>
                  <span className="text-xs text-gray-600 bg-white/80 px-3 py-1 rounded-full">
                    支持: PDF, DOCX, 图片(PNG/JPG), 视频(MP4), DICOM(.dcm)
                  </span>
                </label>
              </div>
              
              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-800 bg-purple-50 px-3 py-2 rounded-lg">已选择文件：</p>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/70 border border-blue-200 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getFileIcon(file)}</span>
                        <div>
                          <span className="text-sm text-gray-800 font-medium truncate max-w-[200px] block">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isAnalyzing}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
                  <div className="flex items-center justify-between mb-3">
                    <FormLabel className="text-sm font-medium text-gray-800 bg-green-50 px-3 py-2 rounded-lg">
                      体检报告数据
                    </FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        form.setValue("reportData", "");
                        toast({
                          title: "清除成功",
                          description: "体检报告数据已清空",
                        });
                      }}
                      disabled={isAnalyzing || !field.value}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-auto p-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      清空
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea 
                      className="h-48 text-sm resize-none bg-white/70 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="请粘贴体检报告内容，包括影像学检查、实验室检验、个人病史等信息..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-600 mt-2 bg-blue-50 px-2 py-1 rounded-md">
                    支持文本格式，系统将自动识别不同类型的医疗数据
                  </p>
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              <FormField
                control={form.control}
                name="compareWithHistory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-blue-300 data-[state=checked]:bg-blue-500"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-gray-700 font-medium">
                      与历史报告对比
                    </FormLabel>
                  </FormItem>
                )}
              />
              <div className="flex items-center text-xs text-gray-600 bg-green-100 px-3 py-1 rounded-full">
                <Shield className="w-3 h-3 mr-1 text-green-600" />
                数据加密保护
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-4 font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={isAnalyzing}
            >
              <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <Brain className="w-3 h-3" />
              </div>
              {isAnalyzing ? "正在分析..." : "开始智能分析"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
