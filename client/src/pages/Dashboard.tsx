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
import AIChat from "@/components/AIChat";
import ReportComparison from "@/components/ReportComparison";
import type { HealthAssessmentReport, AnalysisProgress as AnalysisProgressType } from "@shared/schema";
import logoImage from "@assets/image_1751001197483.png";

export default function Dashboard() {
  const [currentReport, setCurrentReport] = useState<HealthAssessmentReport | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'history' | 'chat' | 'settings'>('analysis');
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Helper functions for report comparison
  const handleReportSelection = (reportId: number) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    } else {
      if (selectedReports.length < 3) { // Limit to 3 reports for comparison
        setSelectedReports([...selectedReports, reportId]);
      } else {
        toast({
          title: "选择限制",
          description: "最多只能选择3份报告进行对比",
          variant: "default",
        });
      }
    }
  };

  const handleCompareReports = () => {
    if (selectedReports.length < 2) {
      toast({
        title: "选择不足",
        description: "请至少选择2份报告进行对比",
        variant: "default",
      });
      return;
    }

    // Show AI comparison analysis modal
    setShowComparison(true);
  };

  const toggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    setSelectedReports([]);
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
    setIsCompareMode(false);
    setSelectedReports([]);
  };

  // Check authentication on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.log('Authentication check failed, redirecting to login');
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userEmail");
          setLocation("/");
          return;
        }
        
        const authData = await response.json();
        if (!authData.authenticated) {
          console.log('User not authenticated, redirecting to login');
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userEmail");
          setLocation("/");
          return;
        }
        
        // Update localStorage with current auth status
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", authData.user.email);
        console.log('Authentication verified for user:', authData.user.email);
        
      } catch (error) {
        console.error('Auth status check error:', error);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        setLocation("/");
      }
    };
    
    checkAuthStatus();
  }, [setLocation]);

  // Fetch historical reports
  const { data: historicalReports, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/reports'],
    enabled: activeTab === 'history',
    queryFn: async () => {
      const response = await fetch('/api/reports', {
        credentials: 'include',
        cache: 'no-cache'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      return response.json();
    },
  }) as { data: any, isLoading: boolean };

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        credentials: 'include',
        cache: 'no-cache'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-600 shadow-lg border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/30">
                  <img src={logoImage} alt="Med Agentic-AI Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Med Agentic-AI</h1>
                  <p className="text-sm text-blue-100">智能医疗分析平台</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl p-1">
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'analysis' 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                智能分析
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'history' 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                历史记录
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'chat' 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                AI对话
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'settings' 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white">AI已连接</span>
              </div>
              
              {/* User Info */}
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">
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
                <div className="relative bg-gradient-to-br from-white/95 via-blue-50/80 to-teal-50/60 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-200/30 overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full blur-3xl"></div>
                  </div>
                  
                  <div className="relative p-8 text-center">
                    {/* Icon Container with Animation */}
                    <div className="relative mx-auto mb-6 w-20 h-20">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl opacity-20 animate-pulse"></div>
                      <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                        <Activity className="w-8 h-8 text-white animate-pulse" />
                      </div>
                    </div>
                    
                    {/* Title with Gradient */}
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                      等待分析数据
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-base mb-6 max-w-sm mx-auto leading-relaxed">
                      请在左侧输入体检报告数据，开始智能分析
                    </p>
                    
                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
                      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">🩺</span>
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-800 text-sm">AI智能分析</h4>
                            <p className="text-xs text-gray-600">多模态医疗数据处理</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-teal-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">📊</span>
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-800 text-sm">数据洞察</h4>
                            <p className="text-xs text-gray-600">深度健康趋势分析</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-emerald-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">⚡</span>
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-800 text-sm">快速诊断</h4>
                            <p className="text-xs text-gray-600">秒级智能医疗建议</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-purple-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">🔒</span>
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-800 text-sm">隐私保护</h4>
                            <p className="text-xs text-gray-600">数据安全加密存储</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Supported File Types */}
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-200/50">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">支持的文件格式</h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">PDF</span>
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">DOCX</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">PNG/JPEG</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">MP4</span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">DICOM</span>
                      </div>
                    </div>
                    
                    {/* Animated Progress Dots */}
                    <div className="flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          /* History View */
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">我的分析记录</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isCompareMode ? "选择报告进行对比分析" : "查看您的体检报告分析历史"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {isCompareMode && selectedReports.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                      已选择 {selectedReports.length} 份
                    </span>
                    {selectedReports.length >= 2 && (
                      <button
                        onClick={handleCompareReports}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-md text-sm"
                      >
                        开始对比
                      </button>
                    )}
                  </div>
                )}
                <button
                  onClick={toggleCompareMode}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-md text-sm ${
                    isCompareMode 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white'
                  }`}
                >
                  {isCompareMode ? "取消对比" : "对比模式"}
                </button>
                <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                  共 {historicalReports?.reports?.length || 0} 条记录
                </div>
              </div>
            </div>
            
            {isLoadingHistory ? (
              <div className="relative bg-gradient-to-br from-white/95 via-blue-50/80 to-teal-50/60 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-200/30 overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full blur-3xl"></div>
                </div>
                <div className="relative p-16 text-center">
                  <div className="relative mx-auto mb-8 w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl opacity-20 animate-pulse"></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                    加载历史记录中
                  </h3>
                  <p className="text-gray-600">正在获取您的分析报告数据...</p>
                </div>
              </div>
            ) : historicalReports?.reports?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historicalReports.reports.map((report: any) => {
                  const isSelected = selectedReports.includes(report.id);
                  return (
                    <div 
                      key={report.id} 
                      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border transition-all duration-300 hover:scale-105 p-6 ${
                        isCompareMode 
                          ? isSelected 
                            ? 'border-green-400 ring-2 ring-green-200 hover:shadow-xl' 
                            : 'border-blue-200/50 hover:border-blue-300 hover:shadow-xl cursor-pointer'
                          : 'border-blue-200/50 hover:shadow-xl'
                      }`}
                      onClick={isCompareMode ? () => handleReportSelection(report.id) : undefined}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                            isCompareMode && isSelected 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-br from-blue-500 to-teal-500'
                          }`}>
                            {isCompareMode && isSelected ? (
                              <div className="w-6 h-6 text-white">✓</div>
                            ) : (
                              <FileText className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{report.patientName}</h3>
                            <p className="text-sm text-gray-600">{report.patientAge}岁 {report.patientGender}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isCompareMode && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleReportSelection(report.id)}
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                            个人记录
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{new Date(report.createdAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-teal-500" />
                          <span>{new Date(report.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Historical report data:', report);
                            setCurrentReport(report.analysisResult);
                            setSelectedPatient(report.patientName);
                            setActiveTab('analysis');
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md"
                        >
                          查看报告
                        </button>
                        {!isCompareMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('确定要删除这个报告吗？此操作无法撤销。')) {
                                deleteReportMutation.mutate(report.id);
                              }
                            }}
                            disabled={deleteReportMutation.isPending}
                            className="p-3 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-sm"
                            title="删除报告"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-white/95 via-blue-50/80 to-teal-50/60 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-200/30 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative p-16 text-center">
                  {/* Icon Container with Animation */}
                  <div className="relative mx-auto mb-8 w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl opacity-20 animate-pulse"></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  {/* Title with Gradient */}
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                    暂无分析记录
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                    您还没有分析过任何体检报告，立即开始您的健康数据分析之旅
                  </p>
                  
                  {/* Feature Pills */}
                  <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
                      <span className="text-sm font-medium text-blue-700">📋 报告分析</span>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-200/50 shadow-sm">
                      <span className="text-sm font-medium text-teal-700">📈 趋势追踪</span>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200/50 shadow-sm">
                      <span className="text-sm font-medium text-emerald-700">🔍 深度洞察</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button 
                    onClick={() => setActiveTab('analysis')}
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-10 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    开始分析
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'chat' && (
          /* Chat View */
          <div className="w-full">
            <AIChat />
          </div>
        )}
        
        {activeTab === 'settings' && (
          /* Settings View */
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200/50">
              <h2 className="text-2xl font-bold text-gray-800">系统设置</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Settings */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  账户信息
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-blue-200/30">
                    <div>
                      <p className="font-medium text-gray-800">用户名</p>
                      <p className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded-md mt-1">
                        {localStorage.getItem("userEmail")?.split("@")[0] || "未设置"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-blue-200/30">
                    <div>
                      <p className="font-medium text-gray-800">邮箱地址</p>
                      <p className="text-sm text-gray-600 bg-teal-50 px-2 py-1 rounded-md mt-1">
                        {localStorage.getItem("userEmail") || "未设置"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <div>
                      <p className="font-medium text-gray-800">注册时间</p>
                      <p className="text-sm text-gray-600 bg-purple-50 px-2 py-1 rounded-md mt-1">
                        {new Date().toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  系统偏好
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-blue-200/30">
                    <div>
                      <p className="font-medium text-gray-800">AI 模型</p>
                      <p className="text-sm text-gray-600 bg-green-50 px-2 py-1 rounded-md mt-1">智能运行平台：Med Agentic-AI</p>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-blue-200/30">
                    <div>
                      <p className="font-medium text-gray-800">报告语言</p>
                      <p className="text-sm text-gray-600 bg-orange-50 px-2 py-1 rounded-md mt-1">中文（简体）</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <div>
                      <p className="font-medium text-gray-800">数据存储</p>
                      <p className="text-sm text-gray-600 bg-indigo-50 px-2 py-1 rounded-md mt-1">PostgreSQL 数据库</p>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  数据管理
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-blue-200/30">
                    <div>
                      <p className="font-medium text-gray-800">历史报告数量</p>
                      <p className="text-sm text-gray-600 bg-cyan-50 px-2 py-1 rounded-md mt-1">
                        {historicalReports?.reports?.length || 0} 条报告
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-blue-200/30">
                    <div>
                      <p className="font-medium text-gray-800">支持文件格式</p>
                      <p className="text-sm text-gray-600 bg-pink-50 px-2 py-1 rounded-md mt-1">PDF, DOCX, PNG, JPEG, MP4, DICOM</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <div>
                      <p className="font-medium text-gray-800">最大文件大小</p>
                      <p className="text-sm text-gray-600 bg-violet-50 px-2 py-1 rounded-md mt-1">100MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  系统状态
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-blue-200/30">
                    <div>
                      <p className="font-medium text-gray-800">服务器状态</p>
                      <p className="text-sm text-gray-600 bg-green-50 px-2 py-1 rounded-md mt-1">正常运行</p>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-blue-200/30">
                    <div>
                      <p className="font-medium text-gray-800">AI 服务</p>
                      <p className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded-md mt-1">智能医疗分析引擎</p>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <div>
                      <p className="font-medium text-gray-800">版本信息</p>
                      <p className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md mt-1">Med Agentic-AI v1.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                操作
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    toast({
                      title: "清除缓存",
                      description: "本地缓存已清除",
                      variant: "default",
                    });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white font-medium rounded-xl transition-all duration-200 shadow-md"
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
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-200 shadow-md"
                >
                  导出数据
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-xl transition-all duration-200 shadow-md"
                >
                  返回分析
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Report Comparison Modal */}
        {showComparison && (
          <ReportComparison
            selectedReportIds={selectedReports}
            onClose={handleCloseComparison}
          />
        )}
      </main>
      
      {/* Footer with Copyright */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 py-4 px-6">
        <div className="text-center text-sm text-gray-500">
          <p>Med Agentic-AI © 江阴市人民医院-殷利鑫</p>
        </div>
      </footer>
    </div>
  );
}