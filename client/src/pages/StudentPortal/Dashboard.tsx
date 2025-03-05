import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student, Course } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { language } = useI18n();
  
  const { data: student } = useQuery<Omit<Student, "password">>({
    queryKey: ['/api/students/me']
  });

  const { data: courses } = useQuery<(Course & { enrollment: { enrolledAt: Date; status: string; grade?: string } })[]>({
    queryKey: ['/api/students/me/courses']
  });

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {language === 'vi' ? 'Cổng thông tin sinh viên' : 'Student Portal'}
      </h1>

      {student && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {language === 'vi' ? 'Thông tin sinh viên' : 'Student Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {language === 'vi' ? 'Họ và tên' : 'Full Name'}
                </dt>
                <dd className="text-sm font-semibold">
                  {student.fullName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {language === 'vi' ? 'Mã số sinh viên' : 'Student ID'}
                </dt>
                <dd className="text-sm font-semibold">
                  {student.studentId}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {language === 'vi' ? 'Chương trình' : 'Program'}
                </dt>
                <dd className="text-sm font-semibold">
                  {student.program}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {language === 'vi' ? 'Ngày nhập học' : 'Enrollment Date'}
                </dt>
                <dd className="text-sm font-semibold">
                  {format(new Date(student.enrollmentDate!), 'PPP')}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'vi' ? 'Khóa học' : 'Courses'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {courses?.map((course) => (
              <div key={course.id} className="py-4 first:pt-0 last:pb-0">
                <h3 className="font-semibold">
                  {language === 'vi' ? course.name_vi : course.name_en}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' ? course.description_vi : course.description_en}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span>
                    {language === 'vi' ? 'Mã khóa học:' : 'Course Code:'} {course.code}
                  </span>
                  <span>•</span>
                  <span>
                    {language === 'vi' ? 'Tín chỉ:' : 'Credits:'} {course.credits}
                  </span>
                  {course.enrollment.grade && (
                    <>
                      <span>•</span>
                      <span>
                        {language === 'vi' ? 'Điểm:' : 'Grade:'} {course.enrollment.grade}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}