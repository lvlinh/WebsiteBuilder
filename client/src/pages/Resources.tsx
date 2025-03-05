import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Book, Calendar, Video } from "lucide-react"

export default function Resources() {
  const { language } = useI18n()

  const content = {
    title: {
      vi: 'Tiện ích',
      en: 'Resources'
    },
    sections: {
      forms: {
        title: {
          vi: 'Biểu mẫu',
          en: 'Forms'
        },
        content: {
          vi: 'Các biểu mẫu và tài liệu cần thiết.',
          en: 'Necessary forms and documents.'
        }
      },
      library: {
        title: {
          vi: 'Thư viện',
          en: 'Library'
        },
        content: {
          vi: 'Truy cập tài nguyên thư viện trực tuyến.',
          en: 'Access online library resources.'
        }
      },
      events: {
        title: {
          vi: 'Sự kiện',
          en: 'Events'
        },
        content: {
          vi: 'Lịch sự kiện và hoạt động sắp tới.',
          en: 'Upcoming events and activities.'
        }
      },
      media: {
        title: {
          vi: 'Video & Hình ảnh',
          en: 'Video & Images'
        },
        content: {
          vi: 'Thư viện đa phương tiện.',
          en: 'Multimedia library.'
        }
      }
    }
  }

  const resourceCards = [
    { icon: FileText, ...content.sections.forms },
    { icon: Book, ...content.sections.library },
    { icon: Calendar, ...content.sections.events },
    { icon: Video, ...content.sections.media }
  ]

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {content.title[language]}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {resourceCards.map((resource, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <resource.icon className="h-6 w-6" />
                <CardTitle>{resource.title[language]}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {resource.content[language]}
              </p>
              <Button variant="outline">
                {language === 'vi' ? 'Xem thêm' : 'Learn More'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
