import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Family() {
  const { language } = useI18n()

  const content = {
    title: {
      vi: 'Gia đình SJJS',
      en: 'SJJS Family'
    },
    sections: {
      liturgy: {
        title: {
          vi: 'Phụng vụ',
          en: 'Liturgy'
        },
        content: {
          vi: 'Lịch phụng vụ và các hoạt động cầu nguyện trong cộng đoàn.',
          en: 'Liturgical calendar and community prayer activities.'
        }
      },
      facilities: {
        title: {
          vi: 'Cơ sở học tập',
          en: 'Learning Facilities'
        },
        content: {
          vi: 'Thư viện, phòng học và các tiện ích phục vụ việc học tập.',
          en: 'Library, classrooms and study facilities.'
        }
      },
      alumni: {
        title: {
          vi: 'Cựu sinh viên',
          en: 'Alumni'
        },
        content: {
          vi: 'Mạng lưới cựu sinh viên và các hoạt động kết nối.',
          en: 'Alumni network and connection activities.'
        }
      }
    }
  }

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {content.title[language]}
      </h1>

      <Tabs defaultValue="liturgy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="liturgy">
            {content.sections.liturgy.title[language]}
          </TabsTrigger>
          <TabsTrigger value="facilities">
            {content.sections.facilities.title[language]}
          </TabsTrigger>
          <TabsTrigger value="alumni">
            {content.sections.alumni.title[language]}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liturgy">
          <Card>
            <CardHeader>
              <CardTitle>{content.sections.liturgy.title[language]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {content.sections.liturgy.content[language]}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities">
          <Card>
            <CardHeader>
              <CardTitle>{content.sections.facilities.title[language]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {content.sections.facilities.content[language]}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alumni">
          <Card>
            <CardHeader>
              <CardTitle>{content.sections.alumni.title[language]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {content.sections.alumni.content[language]}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
