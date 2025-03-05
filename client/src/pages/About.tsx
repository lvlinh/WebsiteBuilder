import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function About() {
  const { language } = useI18n()

  const content = {
    title: {
      vi: 'Giới thiệu',
      en: 'About Us'
    },
    mission: {
      title: {
        vi: 'Sứ mạng & Lịch sử',
        en: 'Mission & History'
      },
      content: {
        vi: 'SJJS là học viện thần học hàng đầu trong việc đào tạo các nhà thần học và mục vụ theo truyền thống Dòng Tên.',
        en: 'SJJS is a leading theological institution in training theologians and pastoral workers in the Jesuit tradition.'
      }
    },
    values: {
      title: {
        vi: 'Giá trị cốt lõi',
        en: 'Core Values'
      },
      content: {
        vi: 'Chúng tôi đề cao việc học tập suốt đời, phục vụ tha nhân và phát triển toàn diện con người.',
        en: 'We emphasize lifelong learning, service to others, and holistic human development.'
      }
    },
    jesuitEd: {
      title: {
        vi: 'Giáo dục Dòng Tên',
        en: 'Jesuit Education'
      },
      content: {
        vi: 'Phương pháp giáo dục của chúng tôi kết hợp truyền thống học thuật lâu đời với các phương pháp hiện đại.',
        en: 'Our educational approach combines longstanding academic tradition with modern methodologies.'
      }
    }
  }

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {content.title[language]}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{content.mission.title[language]}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {content.mission.content[language]}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{content.values.title[language]}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {content.values.content[language]}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{content.jesuitEd.title[language]}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {content.jesuitEd.content[language]}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
