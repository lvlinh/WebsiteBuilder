import { useI18n, translations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"

export default function Hero() {
  const { language } = useI18n()
  const t = translations.home.hero

  return (
    <div className="relative overflow-hidden bg-background py-24 sm:py-32">
      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {t.title[language]}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t.subtitle[language]}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/about">
              <Button size="lg">
                {language === 'vi' ? 'Tìm hiểu thêm' : 'Learn More'}
              </Button>
            </Link>
            <Link href="/admissions">
              <Button variant="outline" size="lg">
                {language === 'vi' ? 'Tuyển sinh' : 'Admissions'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
