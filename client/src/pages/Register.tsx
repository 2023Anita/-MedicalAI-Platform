import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import logoImage from "@assets/image_1750951783733.png";

interface RegisterData {
  email: string;
  password: string;
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "注册申请已提交",
        description: "我们将在24小时内审核您的申请并发送确认邮件。",
        variant: "default",
      });
      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "注册失败",
        description: error.message || "请检查输入信息并重试",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password || !confirmPassword) {
      toast({
        title: "请填写完整信息",
        description: "邮箱和密码都是必填项",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确保两次输入的密码相同",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "密码过短",
        description: "密码长度至少需要6个字符",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden shadow-lg">
              <img src={logoImage} alt="Med Agentic-AI Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Med Agentic-AI</h1>
          <p className="text-gray-600 mt-1">体检报告·分析平台</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">用户注册</CardTitle>
            <CardDescription className="text-center">
              填写邮箱和密码申请使用权限
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">注册邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入您的邮箱地址"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">设置密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="请设置您的登录密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">注册说明：</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 提交注册申请后，我们将在24小时内审核</li>
                      <li>• 审核通过后会发送激活邮件到您的邮箱</li>
                      <li>• 密码长度至少6个字符，建议包含数字和字母</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "提交中..." : "提交注册申请"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/">
                <Button variant="ghost" className="text-sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>已有账户？请联系管理员获取登录权限</p>
        </div>
      </div>
    </div>
  );
}