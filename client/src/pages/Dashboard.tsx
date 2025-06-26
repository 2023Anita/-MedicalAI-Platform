import { useState, useEffect } from "react";
import { Activity, User, LogOut, FileText, Calendar, Clock, Trash2, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReportInput from "@/components/ReportInput";
import AnalysisProgress from "@/components/AnalysisProgress";
import ReportDisplay from "@/components/ReportDisplay";
import HistoricalComparison from "@/components/HistoricalComparison";
import type { HealthAssessmentReport, AnalysisProgress as AnalysisProgressType } from "@shared/schema";
import logoImage from "@assets/image_1750951783733.png";

export default function Dashboard() {
  const [currentReport, setCurrentReport] = useState<HealthAssessmentReport | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'history' | 'settings'>('analysis');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      setLocation("/");
    }
  }, [setLocation]);

  // Fetch historical reports
  const { data: historicalReports, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/reports'],
    enabled: activeTab === 'history',
  }) as { data: any, isLoading: boolean };

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "删除成功",
        description: "报告已从历史记录中删除",
        variant: "default",
      });
      // Refresh the reports list
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: "删除失败",
        description: error.message || "请重试",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    // Clear any stored session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Use setLocation for faster navigation
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-clinical">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <img src={logoImage} alt="Med Agentic-AI Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-professional">Med Agentic-AI</h1>
                  <p className="text-xs text-muted-foreground">体检报告·分析平台</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`transition-colors pb-1 ${
                  activeTab === 'analysis' 
                    ? 'text-primary font-medium border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                报告分析
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`transition-colors pb-1 ${
                  activeTab === 'history' 
                    ? 'text-primary font-medium border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                历史记录
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-1 transition-colors pb-1 ${
                  activeTab === 'settings' 
                    ? 'text-primary font-medium border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>设置</span>
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Med Agentic-AI 已连接</span>
              </div>
              
              {/* User Info */}
              <div className="flex items-center space-x-3 bg-gradient-to-r from-primary/5 to-blue-50 px-4 py-2 rounded-full border border-primary/10">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-primary">
                    {localStorage.getItem("userEmail")?.split("@")[0] || "用户"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {localStorage.getItem("userEmail") || ""}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-lg"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">退出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-6">
              <ReportInput 
                onAnalysisStart={(patientName) => {
                  setIsAnalyzing(true);
                  setSelectedPatient(patientName);
                  setCurrentReport(null);
                }}
                onAnalysisComplete={(report) => {
                  setCurrentReport(report);
                  setIsAnalyzing(false);
                  setAnalysisProgress(null);
                }}
                onProgressUpdate={setAnalysisProgress}
                isAnalyzing={isAnalyzing}
              />
              
              <AnalysisProgress 
                progress={analysisProgress}
                isVisible={isAnalyzing}
              />
            </div>
            
            {/* Report Display Section */}
            <div className="lg:col-span-2 space-y-6">
              {currentReport ? (
                <>
                  <ReportDisplay report={currentReport} />
                  {selectedPatient && (
                    <HistoricalComparison 
                      patientName={selectedPatient}
                      currentReport={currentReport}
                    />
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
                  <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-professional mb-2">
                    等待分析数据
                  </h3>
                  <p className="text-muted-foreground">
                    请在左侧输入体检报告数据，开始智能分析
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          /* History View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-professional">历史记录</h2>
              <div className="text-sm text-muted-foreground">
                共 {historicalReports?.reports?.length || 0} 条记录
              </div>
            </div>
            
            {isLoadingHistory ? (
              <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">加载历史记录中...</p>
              </div>
            ) : historicalReports?.reports?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historicalReports.reports.map((report: any) => (
                  <div key={report.id} className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-professional">{report.patientName}</h3>
                          <p className="text-sm text-muted-foreground">{report.patientAge}岁 {report.patientGender}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(report.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(report.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          console.log('Historical report data:', report);
                          setCurrentReport(report.analysisResult);
                          setSelectedPatient(report.patientName);
                          setActiveTab('analysis');
                        }}
                        className="flex-1 bg-primary/5 hover:bg-primary/10 text-primary font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        查看报告
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定要删除这个报告吗？此操作无法撤销。')) {
                            deleteReportMutation.mutate(report.id);
                          }
                        }}
                        disabled={deleteReportMutation.isPending}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="删除报告"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-professional mb-2">
                  暂无历史记录
                </h3>
                <p className="text-muted-foreground mb-4">
                  您还没有分析过任何体检报告
                </p>
                <button 
                  onClick={() => setActiveTab('analysis')}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  开始分析
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'settings' && (
          /* Settings View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-professional">系统设置</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-professional mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  账户信息
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <div>
                      <p className="font-medium text-professional">用户名</p>
                      <p className="text-sm text-muted-foreground">
                        {localStorage.getItem("userEmail")?.split("@")[0] || "未设置"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <div>
                      <p className="font-medium text-professional">邮箱地址</p>
                      <p className="text-sm text-muted-foreground">
                        {localStorage.getItem("userEmail") || "未设置"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-professional">注册时间</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-professional mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-primary" />
                  系统偏好
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <div>
                      <p className="font-medium text-professional">AI 模型</p>
                      <p className="text-sm text-muted-foreground">Agentic-AI</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <div>
                      <p className="font-medium text-professional">报告语言</p>
                      <p className="text-sm text-muted-foreground">中文（简体）</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-professional">数据存储</p>
                      <p className="text-sm text-muted-foreground">PostgreSQL 数据库</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-professional mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" />
                  数据管理
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <div>
                      <p className="font-medium text-professional">历史报告数量</p>
                      <p className="text-sm text-muted-foreground">
                        {historicalReports?.reports?.length || 0} 条报告
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <div>
                      <p className="font-medium text-professional">支持文件格式</p>
                      <p className="text-sm text-muted-foreground">PDF, DOCX, PNG, JPEG, MP4, DICOM</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-professional">最大文件大小</p>
                      <p className="text-sm text-muted-foreground">100MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-professional mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  系统状态
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <div>
                      <p className="font-medium text-professional">服务器状态</p>
                      <p className="text-sm text-muted-foreground">正常运行</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <div>
                      <p className="font-medium text-professional">AI 服务</p>
                      <p className="text-sm text-muted-foreground">智能医疗分析引擎</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-professional">版本信息</p>
                      <p className="text-sm text-muted-foreground">Med Agentic-AI v1.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-professional mb-4">操作</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    toast({
                      title: "清除缓存",
                      description: "本地缓存已清除",
                      variant: "default",
                    });
                  }}
                  className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors"
                >
                  清除缓存
                </button>
                <button
                  onClick={() => {
                    const data = {
                      userEmail: localStorage.getItem("userEmail"),
                      exportTime: new Date().toISOString(),
                      reports: historicalReports?.reports || []
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `medical-reports-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast({
                      title: "导出成功",
                      description: "数据已导出到本地文件",
                      variant: "default",
                    });
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  导出数据
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className="px-4 py-2 bg-green-50 text-green-600 font-medium rounded-lg hover:bg-green-100 transition-colors"
                >
                  返回分析
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}