import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  studentId: z.string().min(1),
  program: z.string().min(1),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { language } = useI18n();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      studentId: "",
      program: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await apiRequest("POST", "/api/students/register", data);
      toast({
        title: language === 'vi' ? 'Đăng ký thành công' : 'Registration successful',
        description: language === 'vi'
          ? 'Vui lòng đăng nhập để tiếp tục'
          : 'Please login to continue',
      });
      setLocation("/student/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Đăng ký thất bại' : 'Registration failed',
        description: language === 'vi'
          ? 'Vui lòng kiểm tra lại thông tin đăng ký'
          : 'Please check your registration information',
      });
    }
  };

  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>
            {language === 'vi' ? 'Đăng ký tài khoản sinh viên' : 'Student Registration'}
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
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'vi' ? 'Họ và tên' : 'Full Name'}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'vi' ? 'Mã số sinh viên' : 'Student ID'}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'vi' ? 'Chương trình học' : 'Program'}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {language === 'vi' ? 'Đăng ký' : 'Register'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
