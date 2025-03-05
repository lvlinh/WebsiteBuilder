import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"

export default function Admissions() {
  const { language } = useI18n()

  const content = {
    title: {
      vi: 'Tuyển sinh',
      en: 'Admissions'
    },
    overview: {
      title: {
        vi: 'Tổng quan',
        en: 'Overview'
      },
      content: {
        vi: 'SJJS chào đón các ứng viên có nguyện vọng theo đuổi nghiên cứu thần học và mục vụ.',
        en: 'SJJS welcomes candidates who wish to pursue theological studies and pastoral work.'
      }
    },
    requirements: {
      title: {
        vi: 'Tiêu chuẩn tuyển sinh',
        en: 'Admission Requirements'
      },
      content: {
        vi: 'Ứng viên cần có bằng cử nhân, kiến thức triết học và ngôn ngữ cần thiết.',
        en: 'Candidates need a bachelor\'s degree, philosophical background, and required language skills.'
      }
    },
    process: {
      title: {
        vi: 'Quy trình tuyển sinh',
        en: 'Application Process'
      },
      content: {
        vi: 'Quá trình bao gồm nộp hồ sơ, phỏng vấn và đánh giá năng lực.',
        en: 'The process includes application submission, interviews, and competency assessment.'
      }
    }
  }

  return (
    <main className="container py-12">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {content.title[language]}
        </h1>
        <Button asChild>
          <Link href="/contact">
            {language === 'vi' ? 'Liên hệ tư vấn' : 'Contact for Consultation'}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{content.overview.title[language]}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {content.overview.content[language]}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{content.requirements.title[language]}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {content.requirements.content[language]}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{content.process.title[language]}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {content.process.content[language]}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
