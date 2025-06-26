import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Brain, Upload, Shield } from "lucide-react";
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
  
  const form = useForm<AnalysisRequest>({
    resolver: zodResolver(analysisRequestSchema),
    defaultValues: {
      patientName: "",
      patientAge: "",
      patientGender: "",
      reportData: "",
      compareWithHistory: false,
    },
  });

  const analysisMutation = useMutation({
    mutationFn: async (data: AnalysisRequest) => {
      const response = await apiRequest("POST", "/api/analyze", data);
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
          description: "健康评估报告已生成",
        });
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
    },
  });

  const onSubmit = (data: AnalysisRequest) => {
    // Mock progress updates for demonstration
    if (data.reportData.trim()) {
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
              <div className="grid grid-cols-2 gap-3">
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
            </div>
            
            <FormField
              control={form.control}
              name="patientGender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-professional">
                    性别（可选）
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="性别" 
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
