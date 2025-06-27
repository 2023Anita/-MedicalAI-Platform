import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Brain, Upload, Shield, File, X, Calendar, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      formData.append('patientGender', data.patientGender);
      formData.append('examDate', data.examDate);
      formData.append('reportData', data.reportData || '');
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
    // 验证至少有文本内容或文件上传其中一个
    const hasTextData = data.reportData && data.reportData.trim().length >= 10;
    const hasFiles = selectedFiles.length > 0;
    
    // 如果既没有文本也没有文件，显示错误
    if (!hasTextData && !hasFiles) {
      toast({
        title: "数据不完整", 
        description: `请至少填写体检报告文本内容或上传医疗文件。当前状态: 文本${hasTextData ? '有' : '无'}, 文件${hasFiles ? selectedFiles.length + '个' : '无'}`,
        variant: "destructive",
      });
      return;
    }
    
    // 验证通过，继续处理
    onAnalysisStart(data.patientName);
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
              <FormLabel className="text-base font-semibold text-gray-800 mb-4 block bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 rounded-xl border border-blue-200 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                  <User className="w-3 h-3 text-white" />
                </div>
                患者信息 (Patient Information)
              </FormLabel>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="患者姓名" 
                          {...field} 
                          className="text-base bg-white/80 backdrop-blur-sm border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm h-12 leading-relaxed"
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
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
                          className="text-base bg-white/80 backdrop-blur-sm border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm h-12 leading-relaxed"
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="text-base bg-white/80 backdrop-blur-sm border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm h-12 leading-relaxed">
                            <SelectValue placeholder="选择性别 *" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm border-blue-200 rounded-xl shadow-lg">
                            <SelectItem value="男性" className="text-base hover:bg-blue-50 focus:bg-blue-50">男性</SelectItem>
                            <SelectItem value="女性" className="text-base hover:bg-blue-50 focus:bg-blue-50">女性</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-sm" />
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
                            className="text-base bg-white/80 backdrop-blur-sm border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm h-12 leading-relaxed pr-12"
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* File Upload Section */}
            <div>
              <FormLabel className="text-base font-semibold text-gray-800 mb-4 block bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-3 rounded-xl border border-teal-200 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                  <Upload className="w-3 h-3 text-white" />
                </div>
                文件上传 (File Upload)
              </FormLabel>
              <div className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 backdrop-blur-sm rounded-2xl p-8 text-center hover:border-blue-400 transition-all shadow-sm">
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
                  className="cursor-pointer flex flex-col items-center space-y-5"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center space-y-3">
                    <span className="text-lg text-gray-800 font-semibold leading-relaxed block">
                      点击上传或拖拽医疗文件到此处
                    </span>
                    <p className="text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                      支持上传病历图片、化验报告图片、影像学图片、影像学视频等多种医疗文件格式
                    </p>
                  </div>
                  
                  {/* File Type Categories */}
                  <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mt-6">
                    <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-4 text-left shadow-sm">
                      <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                        病历文档
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• 电子病历 (PDF/DOCX)</li>
                        <li>• 诊断报告文档</li>
                        <li>• 检查报告单</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/90 backdrop-blur-sm border border-green-200 rounded-xl p-4 text-left shadow-sm">
                      <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                        化验检查
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• 血液检查报告图片</li>
                        <li>• 尿液分析报告</li>
                        <li>• 生化指标图片</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/90 backdrop-blur-sm border border-purple-200 rounded-xl p-4 text-left shadow-sm">
                      <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center">
                        <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                        医学影像
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• CT/MRI 影像图片</li>
                        <li>• X光片照片</li>
                        <li>• DICOM 医学格式</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/90 backdrop-blur-sm border border-orange-200 rounded-xl p-4 text-left shadow-sm">
                      <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center">
                        <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                        动态检查
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• 超声检查视频</li>
                        <li>• 内镜检查录像</li>
                        <li>• 心电图动态记录</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                      支持格式: PDF • DOCX • PNG/JPG • MP4 • DICOM • 最大100MB
                    </span>
                  </div>
                </label>
              </div>
              
              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <div className="mt-6 space-y-4">
                  <p className="text-base font-semibold text-gray-800 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 rounded-xl border border-purple-200 flex items-center">
                    <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                      <File className="w-3 h-3 text-white" />
                    </div>
                    已选择文件 (Selected Files)：
                  </p>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getFileIcon(file)}</span>
                        <div>
                          <span className="text-base text-gray-800 font-medium truncate max-w-[220px] block leading-relaxed">
                            {file.name}
                          </span>
                          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
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
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl p-3"
                      >
                        <X className="w-5 h-5" />
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
                  <div className="flex items-center justify-between mb-4">
                    <FormLabel className="text-base font-semibold text-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200 flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                        <File className="w-3 h-3 text-white" />
                      </div>
                      体检报告数据 (Medical Report Data)
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
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-auto p-3 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">清空</span>
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea 
                      className="h-52 text-base resize-none bg-white/80 backdrop-blur-sm border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm leading-relaxed p-4"
                      placeholder="请粘贴体检报告内容，包括影像学检查、实验室检验、个人病史等信息..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                  <div className="text-sm text-gray-600 mt-3 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-xl border border-blue-200 leading-relaxed">
                    支持文本格式，系统将自动识别不同类型的医疗数据
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-5 shadow-sm">
              <FormField
                control={form.control}
                name="compareWithHistory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-4 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-blue-300 data-[state=checked]:bg-blue-500 w-5 h-5"
                      />
                    </FormControl>
                    <FormLabel className="text-base text-gray-700 font-medium leading-relaxed cursor-pointer">
                      与历史报告对比 (Compare with History)
                    </FormLabel>
                  </FormItem>
                )}
              />
              <div className="flex items-center text-sm text-gray-600 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border border-green-200 shadow-sm">
                <Shield className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-medium">数据加密保护</span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-5 font-semibold text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 leading-relaxed"
              disabled={isAnalyzing}
            >
              <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-sm">
                <Brain className="w-4 h-4" />
              </div>
              {isAnalyzing ? "正在分析中..." : "开始智能分析 (Start AI Analysis)"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
