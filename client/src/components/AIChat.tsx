import { useState, useRef, useEffect } from "react";
import { Send, Upload, X, MessageCircle, Bot, User as UserIcon, Image, Video, FileText } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";

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
      content: '您好！我是Med Agentic-AI智能助手。我可以帮您分析医疗图片、视频，回答医疗相关问题。请输入您的问题或上传文件。',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-lg border border-blue-200/50 backdrop-blur-sm">
      {/* Chat Header - 科技医疗风格 */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-teal-600 rounded-t-xl text-white shadow-md">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/30">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Med Agentic-AI</h3>
            <p className="text-blue-100 text-sm">智能医疗分析助手</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">实时在线</span>
          </div>
        </div>
      </div>

      {/* Messages Area - 增强医疗科技感 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-white/30">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
              {/* Avatar - 增强科技感 */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                message.type === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-3 ring-2 ring-blue-200' 
                  : 'bg-gradient-to-br from-teal-500 to-green-500 text-white mr-3 ring-2 ring-teal-200'
              }`}>
                {message.type === 'user' ? (
                  <UserIcon className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>

              {/* Message Content - 放大字体和改进样式 */}
              <div className={`rounded-2xl p-4 shadow-lg backdrop-blur-sm ${
                message.type === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                  : 'bg-white/90 text-gray-800 border border-gray-200/50'
              }`}>
                <div 
                  className={`leading-relaxed whitespace-pre-wrap ${
                    message.type === 'user' ? 'text-base' : 'text-lg'
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-green-500 text-white mr-3 ring-2 ring-teal-200 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50">
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-600 mr-2">AI正在思考</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
        <div className="border-t border-blue-200/50 bg-gradient-to-r from-blue-50 to-teal-50 p-4">
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>待发送文件 ({selectedFiles.length})</span>
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200/50 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center text-white shadow-md">
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
      <div className="border-t border-blue-200/50 bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-b-xl">
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
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 shadow-sm"
          >
            <Upload className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="🩺 输入您的医疗问题，或上传检查报告、影像资料进行AI分析..."
              className="min-h-[60px] max-h-[140px] resize-none text-base bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-200 shadow-sm"
              disabled={chatMutation.isPending}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={(!inputMessage.trim() && selectedFiles.length === 0) || chatMutation.isPending}
            className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg px-6 py-3 text-base font-medium"
            size="lg"
          >
            {chatMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>发送中</span>
              </div>
            ) : (
              <>
                <Send className="w-5 h-5 mr-1" />
                <span>发送</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}