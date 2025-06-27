import { useState, useRef, useEffect } from "react";
import { Send, Upload, X, MessageCircle, Bot, User as UserIcon, Image, Video, FileText, Database, Activity } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import aiAvatarImage from "@assets/image_1751000871336.png";
import chatHeaderIconImage from "@assets/image_1751064453952.png";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  files?: Array<{
    name: string;
    type: string;
    size: number;
    url?: string;
  }>;
}

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: '您好！我是Med Agentic-AI智能助手。我已经接入您的历史医疗数据，可以：\n\n【核心功能】\n1. 基于您既往检查结果提供个性化健康建议\n2. 分析历史报告中的健康趋势变化\n3. 对比不同时期的检查数据\n4. 回答关于您医疗历史的任何问题\n\n【使用提示】\n• 如果您是新用户，请先在"报告分析"页面上传体检报告\n• 有历史数据后，我就能提供更精准的个性化分析\n• 您可以直接询问历史趋势、指标对比等问题\n\n请输入您的问题或上传新的医疗文件进行分析。',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Query user's historical reports count for context display
  const { data: historicalReports } = useQuery({
    queryKey: ['/api/reports'],
    enabled: true,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; files: File[] }) => {
      const formData = new FormData();
      formData.append('message', data.message);
      
      data.files.forEach((file, index) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for session management
      });
      
      if (!response.ok) {
        throw new Error('Chat request failed');
      }
      
      return await response.json();
    },
    onSuccess: (response) => {
      setIsTyping(false);
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        type: 'ai',
        content: response.message || '抱歉，我无法处理您的请求。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        variant: "destructive",
      });
      console.error('Chat error:', error);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'video/mp4',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const validFiles = files.filter(file => {
      const isValidType = allowedTypes.includes(file.type);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim() || '上传了文件',
      timestamp: new Date(),
      files: selectedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Send to AI
    chatMutation.mutate({
      message: inputMessage.trim(),
      files: selectedFiles,
    });

    // Clear input
    setInputMessage('');
    setSelectedFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to highlight medical terms
  const highlightMedicalTerms = (text: string) => {
    const medicalPatterns = [
      /【([^】]+)】/g,  // 【医学术语】
      /(\d+\.?\d*\s*(?:mg|ml|g|kg|cm|mm|μg|μl|IU|U|%|倍|次|天|小时|分钟)(?:\/[a-zA-Z]+)?)/g, // 数值单位
      /(血压|血糖|心率|体温|血氧|白细胞|红细胞|血小板|肌酐|尿素氮|谷丙转氨酶|谷草转氨酶)/g, // 常见指标
      /(正常|异常|偏高|偏低|超标|不足|增高|降低|升高|下降)/g, // 状态词
    ];

    let highlightedText = text;
    
    // 【】标记 - 蓝色医疗主题
    highlightedText = highlightedText.replace(/【([^】]+)】/g, 
      '<span class="text-blue-800 font-bold">$1</span>'
    );
    
    // 数值单位 - 绿色科技感
    highlightedText = highlightedText.replace(/(\d+\.?\d*\s*(?:mg|ml|g|kg|cm|mm|μg|μl|IU|U|%|倍|次|天|小时|分钟)(?:\/[a-zA-Z]+)?)/g, 
      '<span class="text-green-700 font-bold font-mono">$1</span>'
    );
    
    // 医学指标 - 紫色专业感
    highlightedText = highlightedText.replace(/(血压|血糖|心率|体温|血氧|白细胞|红细胞|血小板|肌酐|尿素氮|谷丙转氨酶|谷草转氨酶)/g, 
      '<span class="text-purple-700 font-bold">$1</span>'
    );
    
    // 状态词 - 根据状态显示不同颜色
    highlightedText = highlightedText.replace(/(正常)/g, 
      '<span class="text-green-800 font-bold">$1</span>'
    );
    highlightedText = highlightedText.replace(/(异常|偏高|超标|增高|升高)/g, 
      '<span class="text-red-800 font-bold">$1</span>'
    );
    highlightedText = highlightedText.replace(/(偏低|不足|降低|下降)/g, 
      '<span class="text-orange-800 font-bold">$1</span>'
    );
    
    return highlightedText;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-lg border border-blue-200/50 backdrop-blur-sm">
      {/* Chat Header - 科技医疗风格 */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-teal-600 rounded-t-xl text-white shadow-md">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/30">
            <img src={chatHeaderIconImage} alt="Med Agentic-AI" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Med Agentic-AI</h3>
            <p className="text-blue-100 text-sm">智能医疗分析助手</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Medical Data Context Indicator */}
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <Database className="w-4 h-4 text-blue-200" />
            <div className="text-sm">
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-green-300" />
                <span className="text-blue-100">历史数据已连接</span>
              </div>
              <div className="text-xs text-blue-200">
                {(historicalReports as any)?.reports?.length || 0} 份医疗记录
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">实时在线</span>
          </div>
        </div>
      </div>

      {/* Messages Area - 增强医疗科技感 */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-b from-transparent to-white/30">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex max-w-[95%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-4`}>
              {/* Avatar - 增强科技感 */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                message.type === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-3 ring-2 ring-blue-200' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white mr-3 ring-2 ring-emerald-200'
              }`}>
                {message.type === 'user' ? (
                  <UserIcon className="w-5 h-5" />
                ) : (
                  <img src={aiAvatarImage} alt="Med Agentic-AI" className="w-6 h-6 object-contain" />
                )}
              </div>

              {/* Message Content - 优化字体大小和样式 */}
              <div className={`rounded-2xl p-6 shadow-lg backdrop-blur-sm ${
                message.type === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                  : 'bg-white/90 text-gray-800 border border-gray-200/50'
              }`}>
                <div 
                  className={`leading-relaxed whitespace-pre-wrap ${
                    message.type === 'user' ? 'text-base' : 'text-base'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: message.type === 'ai' ? highlightMedicalTerms(message.content) : message.content
                  }}
                />
                
                {/* File attachments - 增强文件显示 */}
                {message.files && message.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.files.map((file, index) => (
                      <div key={index} className={`flex items-center space-x-3 p-3 rounded-xl ${
                        message.type === 'user' ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          message.type === 'user' ? 'bg-white/30' : 'bg-blue-100'
                        }`}>
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs opacity-70">({formatFileSize(file.size)})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs opacity-70 mt-3 flex items-center space-x-1">
                  <span>{message.timestamp.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator - 科技感加载动画 */}
        {isTyping && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mr-3 ring-2 ring-emerald-200 flex items-center justify-center shadow-lg">
                <img src={aiAvatarImage} alt="Med Agentic-AI" className="w-6 h-6 object-contain" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50">
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-600 mr-2">AI正在思考</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview - 科技医疗风格 */}
      {selectedFiles.length > 0 && (
        <div className="border-t border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>待发送文件 ({selectedFiles.length})</span>
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200/50 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white shadow-md">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">({formatFileSize(file.size)})</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - 增强科技医疗风格 */}
      <div className="border-t border-blue-200/50 bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-md p-4 rounded-b-xl">
        <div className="flex items-end space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-blue-300/60 hover:bg-blue-50 hover:border-blue-400 text-blue-600 shadow-sm rounded-lg h-10 w-10 p-0"
          >
            <Upload className="w-4 h-4" />
          </Button>

          <div className="flex-1">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="🩺 输入您的医疗问题，或上传检查报告、影像资料进行AI分析..."
              className="min-h-[50px] max-h-[120px] resize-none text-sm leading-relaxed bg-white/90 backdrop-blur-sm border-blue-300/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 shadow-sm p-3 rounded-lg"
              disabled={chatMutation.isPending}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={(!inputMessage.trim() && selectedFiles.length === 0) || chatMutation.isPending}
            className="flex-shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md rounded-lg h-10 px-4 text-sm font-medium transition-all duration-200"
            size="sm"
          >
            {chatMutation.isPending ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>发送中</span>
              </div>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                <span>发送</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Footer with Copyright */}
      <div className="border-t border-blue-200/50 bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-md py-3 px-4">
        <div className="text-center text-xs text-gray-500">
          <p>Med Agentic-AI © 江阴市人民医院-殷利鑫</p>
        </div>
      </div>
    </div>
  );
}