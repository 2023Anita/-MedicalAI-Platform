import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Lock, Shield, CheckCircle } from "lucide-react";
import logoImage from "@assets/image_1751065393476.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        localStorage.setItem("userEmail", email);
        toast({
          title: "登录成功",
          description: "欢迎回到Med Agentic-AI医疗分析平台",
          variant: "default",
        });
        setLocation("/");
      } else {
        throw new Error(data.message || "登录失败");
      }
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "登录失败",
        description: error.message || "请检查您的邮箱和密码",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        localStorage.setItem("userEmail", email);
        toast({
          title: "注册成功",
          description: "欢迎使用Med Agentic-AI医疗分析平台",
          variant: "default",
        });
        setLocation("/");
      } else {
        throw new Error(data.message || "注册失败");
      }
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast({
        title: "注册失败", 
        description: error.message || "注册过程中出现错误",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "输入错误",
        description: "请填写邮箱和密码",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({ email, password });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "输入错误",
        description: "请填写所有必要信息",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确认两次输入的密码一致",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "密码太短",
        description: "密码长度至少需要6个字符",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Medical Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-40 h-40 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-teal-400/25 to-cyan-400/25 rounded-full blur-lg animate-ping" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-32 right-10 w-36 h-36 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-xl animate-pulse" style={{ animationDuration: '2s' }}></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-white/30 animate-pulse" style={{ animationDuration: '3s' }}>
                <img src={logoImage} alt="Med Agentic-AI Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-teal-400/20 rounded-3xl blur-lg animate-ping" style={{ animationDuration: '4s' }}></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-teal-700 bg-clip-text text-transparent mb-3 drop-shadow-lg">Med Agentic-AI</h1>
          <p className="text-lg text-gray-700 font-medium tracking-wide bg-gradient-to-r from-blue-600/80 to-teal-600/80 bg-clip-text text-transparent">智能体检报告分析平台</p>
          <div className="flex items-center justify-center mt-4 space-x-3 bg-white/40 backdrop-blur-sm rounded-full px-4 py-2 border border-green-200/50 shadow-lg">
            <div className="relative">
              <Shield className="h-5 w-5 text-green-600 animate-pulse" />
              <div className="absolute -inset-1 bg-green-400/30 rounded-full blur-sm animate-ping"></div>
            </div>
            <span className="text-sm text-green-700 font-semibold">医疗级数据安全保护</span>
          </div>
        </div>

        <div className="relative">
          {/* Card Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-teal-400/20 to-emerald-400/20 rounded-3xl blur-lg opacity-60 animate-pulse"></div>
          
          <Card className="relative bg-white/80 backdrop-blur-lg border border-white/30 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="space-y-3 text-center pt-8 pb-6">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-teal-700 bg-clip-text text-transparent">欢迎使用</CardTitle>
              <CardDescription className="text-lg text-gray-600 font-medium">
                登录您的账户或创建新账户开始使用
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-white/30">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-700 transition-all duration-300 rounded-xl font-medium">登录</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-700 transition-all duration-300 rounded-xl font-medium">注册</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-6 mt-6">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="login-email" className="text-gray-700 font-medium">邮箱地址</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-4 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="请输入您的邮箱"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 h-12 bg-white/60 backdrop-blur-sm border-white/30 rounded-xl focus:border-blue-500 focus:bg-white focus:shadow-lg transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="login-password" className="text-gray-700 font-medium">密码</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-4 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="请输入您的密码"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-12 h-12 bg-white/60 backdrop-blur-sm border-white/30 rounded-xl focus:border-blue-500 focus:bg-white focus:shadow-lg transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
                      disabled={loginMutation.isPending}
                    >
                      <span className="relative z-10">
                        {loginMutation.isPending ? "登录中..." : "登录"}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-6 mt-6">
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="register-email" className="text-gray-700 font-medium">注册邮箱</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-4 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="请输入您的邮箱地址"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 h-12 bg-white/60 backdrop-blur-sm border-white/30 rounded-xl focus:border-blue-500 focus:bg-white focus:shadow-lg transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="register-password" className="text-gray-700 font-medium">设置密码</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-4 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="请设置您的登录密码"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-12 h-12 bg-white/60 backdrop-blur-sm border-white/30 rounded-xl focus:border-blue-500 focus:bg-white focus:shadow-lg transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="confirm-password" className="text-gray-700 font-medium">确认密码</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-4 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="请再次输入密码"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-12 h-12 bg-white/60 backdrop-blur-sm border-white/30 rounded-xl focus:border-blue-500 focus:bg-white focus:shadow-lg transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-green-800">
                          <p className="font-semibold mb-2">注册说明：</p>
                          <ul className="space-y-1 text-xs">
                            <li>• 注册成功后可立即使用系统，无需激活</li>
                            <li>• 密码长度至少6个字符，建议包含数字和字母</li>
                            <li>• 请妥善保管您的登录信息</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
                      disabled={registerMutation.isPending}
                    >
                      <span className="relative z-10">
                        {registerMutation.isPending ? "注册中..." : "立即注册"}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 p-6 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg relative overflow-hidden">
          {/* Tech glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-teal-400/10 to-emerald-400/10 animate-pulse"></div>
          <p className="relative text-lg font-bold tracking-wider bg-gradient-to-r from-blue-700 via-teal-700 to-emerald-700 bg-clip-text text-transparent drop-shadow-lg whitespace-nowrap">Med Agentic-AI © 江阴市人民医院-睡眠魔法师Team</p>
        </div>
      </div>
    </div>
  );
}