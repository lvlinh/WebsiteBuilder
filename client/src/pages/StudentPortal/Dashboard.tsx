import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, GraduationCap, BookOpen, Bell } from "lucide-react";
import { Link } from "wouter";
import type { Student, Course, Event, Article } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { language } = useI18n();

  const { data: student } = useQuery<Omit<Student, "password">>({
    queryKey: ['/api/students/me']
  });

  const { data: courses } = useQuery<(Course & { enrollment: { enrolledAt: Date; status: string; grade?: string } })[]>({
    queryKey: ['/api/students/me/courses']
  });

  // Fetch upcoming events
  const { data: upcomingEvents } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    select: (events) => events
      .filter(event => new Date(event.startDate) > new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3)
  });

  // Fetch latest news relevant to student's program
  const { data: relevantNews } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
    enabled: !!student?.program,
    select: (articles) => articles
      .filter(article => 
        article.published && 
        (article.tags?.includes(student?.program || '') || article.category === 'academic')
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3)
  });

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {language === 'vi' ? 'Cổng thông tin sinh viên' : 'Student Portal'}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Student Information Card */}
        {student && (
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'vi' ? 'Thông tin sinh viên' : 'Student Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4">
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

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'vi' ? 'Thao tác nhanh' : 'Quick Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <GraduationCap className="h-6 w-6 mb-2" />
                {language === 'vi' ? 'Xem điểm' : 'View Grades'}
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <BookOpen className="h-6 w-6 mb-2" />
                {language === 'vi' ? 'Khóa học' : 'Courses'}
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <CalendarDays className="h-6 w-6 mb-2" />
                {language === 'vi' ? 'Lịch học' : 'Schedule'}
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <Bell className="h-6 w-6 mb-2" />
                {language === 'vi' ? 'Thông báo' : 'Notifications'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'vi' ? 'Sự kiện sắp tới' : 'Upcoming Events'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents?.map(event => (
                <div key={event.id} className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded p-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {language === 'vi' ? event.title_vi : event.title_en}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.startDate), 'PPP')}
                    </p>
                  </div>
                </div>
              ))}
              {(!upcomingEvents || upcomingEvents.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' 
                    ? 'Không có sự kiện sắp tới'
                    : 'No upcoming events'
                  }
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest News Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'vi' ? 'Tin tức mới' : 'Latest News'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relevantNews?.map(article => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <div className="group cursor-pointer">
                    <h3 className="font-medium group-hover:text-primary">
                      {language === 'vi' ? article.title_vi : article.title_en}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {language === 'vi' ? article.excerpt_vi : article.excerpt_en}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(article.publishedAt), 'PPP')}
                    </p>
                  </div>
                </Link>
              ))}
              {(!relevantNews || relevantNews.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' 
                    ? 'Không có tin tức mới'
                    : 'No latest news'
                  }
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Courses Card */}
        <Card className="md:col-span-2">
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
    </div>
  );
}