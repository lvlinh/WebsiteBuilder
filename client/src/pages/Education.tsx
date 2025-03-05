import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Education() {
  const { language } = useI18n()

  const content = {
    title: {
      vi: 'Đào tạo',
      en: 'Education'
    },
    programs: {
      philosophy: {
        title: {
          vi: 'Chương trình Triết học',
          en: 'Philosophy Program'
        },
        content: {
          vi: 'Chương trình triết học cung cấp nền tảng vững chắc cho việc học thần học.',
          en: 'The philosophy program provides a solid foundation for theological studies.'
        }
      },
      theology: {
        title: {
          vi: 'Cử nhân Thần học',
          en: 'Bachelor of Theology'
        },
        content: {
          vi: 'Chương trình đào tạo toàn diện về thần học công giáo và mục vụ.',
          en: 'A comprehensive program in Catholic theology and pastoral ministry.'
        }
      },
      pastoral: {
        title: {
          vi: 'Mục vụ',
          en: 'Pastoral Studies'
        },
        content: {
          vi: 'Đào tạo kỹ năng thực hành cho công tác mục vụ và phục vụ cộng đồng.',
          en: 'Training in practical skills for pastoral work and community service.'
        }
      }
    }
  }

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {content.title[language]}
      </h1>

      <Tabs defaultValue="philosophy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="philosophy">
            {content.programs.philosophy.title[language]}
          </TabsTrigger>
          <TabsTrigger value="theology">
            {content.programs.theology.title[language]}
          </TabsTrigger>
          <TabsTrigger value="pastoral">
            {content.programs.pastoral.title[language]}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="philosophy">
          <Card>
            <CardHeader>
              <CardTitle>{content.programs.philosophy.title[language]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {content.programs.philosophy.content[language]}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theology">
          <Card>
            <CardHeader>
              <CardTitle>{content.programs.theology.title[language]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {content.programs.theology.content[language]}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pastoral">
          <Card>
            <CardHeader>
              <CardTitle>{content.programs.pastoral.title[language]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {content.programs.pastoral.content[language]}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
