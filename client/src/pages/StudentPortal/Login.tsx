import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { language } = useI18n();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await apiRequest("POST", "/api/auth/login", data);
      setLocation("/student/dashboard");
      toast({
        title: language === 'vi' ? 'Đăng nhập thành công' : 'Login successful',
        description: language === 'vi' 
          ? 'Chào mừng bạn đến với cổng thông tin sinh viên' 
          : 'Welcome to the student portal',
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Đăng nhập thất bại' : 'Login failed',
        description: language === 'vi'
          ? 'Email hoặc mật khẩu không đúng'
          : 'Invalid email or password',
      });
    }
  };

  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>
            {language === 'vi' ? 'Đăng nhập sinh viên' : 'Student Login'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'vi' ? 'Mật khẩu' : 'Password'}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {language === 'vi' ? 'Đăng nhập' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {language === 'vi' ? 'Chưa có tài khoản?' : "Don't have an account?"}{' '}
            <Link href="/student/register">
              <a className="text-primary hover:underline">
                {language === 'vi' ? 'Đăng ký ngay' : 'Register now'}
              </a>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}