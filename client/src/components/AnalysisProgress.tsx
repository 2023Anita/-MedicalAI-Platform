import { Settings, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisProgress } from "@shared/schema";

interface AnalysisProgressProps {
  progress: AnalysisProgress | null;
  isVisible: boolean;
}

const progressSteps = [
  { key: 'orchestrator' as keyof AnalysisProgress, label: '编排器 (Orchestrator)' },
  { key: 'imagingAgent' as keyof AnalysisProgress, label: '影像分析 Agent' },
  { key: 'labAgent' as keyof AnalysisProgress, label: '化验单解读 Agent' },
  { key: 'medicalHistoryAgent' as keyof AnalysisProgress, label: '病例数据 Agent' },
  { key: 'comprehensiveAnalysis' as keyof AnalysisProgress, label: '综合推理分析' },
];

export default function AnalysisProgress({ progress, isVisible }: AnalysisProgressProps) {
  if (!isVisible || !progress) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="text-white w-3 h-3" />;
      case 'processing':
        return <Loader2 className="text-white w-3 h-3 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完成';
      case 'processing':
        return '分析中...';
      default:
        return '等待中';
    }
  };

  const getStatusTextClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'processing':
        return 'text-secondary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-blue-200/50 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center text-md font-semibold text-gray-800">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
            <Settings className="text-white w-4 h-4" />
          </div>
          分析进度
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progressSteps.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between bg-white/60 border border-blue-200/30 rounded-xl p-3">
              <span className="text-sm text-gray-700 font-medium">{label}</span>
              <div className="flex items-center space-x-3">
                <div className={`status-indicator ${getStatusClass(progress[key])}`}>
                  {getStatusIcon(progress[key])}
                </div>
                <span className={`text-xs font-medium ${getStatusTextClass(progress[key])}`}>
                  {getStatusText(progress[key])}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 medical-clinical rounded-lg p-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <Settings className="w-3 h-3 mr-2" />
            正在使用 Gemini 2.5-Flash Lite 模型进行快速分析
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
