import { useState, useEffect } from "react";
import { Activity, User, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
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
  const [, setLocation] = useLocation();

  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      window.location.href = "/";
    }
  }, []);

  const handleLogout = () => {
    // Clear any stored session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Immediate redirect to login page
    window.location.href = "/";
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
              <a href="#" className="text-primary font-medium border-b-2 border-primary pb-1">报告分析</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">历史记录</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">设置</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Med Agentic-AI 已连接</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-primary transition-colors"
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
      </main>
    </div>
  );
}