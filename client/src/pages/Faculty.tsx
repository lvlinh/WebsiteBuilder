import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Faculty() {
  const { language } = useI18n()

  const content = {
    title: {
      vi: 'Ban giảng huấn & Nghiên cứu',
      en: 'Faculty & Research'
    },
    faculty: [
      {
        name: 'Fr. John Smith, SJ',
        role: {
          vi: 'Giáo sư Thần học',
          en: 'Professor of Theology'
        },
        specialty: {
          vi: 'Thần học Hệ thống',
          en: 'Systematic Theology'
        }
      },
      {
        name: 'Dr. Maria Nguyen',
        role: {
          vi: 'Giảng viên Triết học',
          en: 'Philosophy Lecturer'
        },
        specialty: {
          vi: 'Triết học Tôn giáo',
          en: 'Philosophy of Religion'
        }
      }
    ],
    research: {
      title: {
        vi: 'Nghiên cứu',
        en: 'Research'
      },
      content: {
        vi: 'Các dự án nghiên cứu của chúng tôi tập trung vào đối thoại giữa đức tin và văn hóa.',
        en: 'Our research projects focus on the dialogue between faith and culture.'
      }
    }
  }

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {content.title[language]}
      </h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">
            {language === 'vi' ? 'Ban giảng huấn' : 'Faculty Members'}
          </h2>
          {content.faculty.map((member, index) => (
            <Card key={index}>
              <CardContent className="flex items-center gap-4 pt-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {member.role[language]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.specialty[language]}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{content.research.title[language]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {content.research.content[language]}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
