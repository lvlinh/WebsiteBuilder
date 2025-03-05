import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

export default function LocaleToggle() {
  const { language, setLanguage } = useI18n()
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
    >
      {language === 'vi' ? 'EN' : 'VI'}
    </Button>
  )
}
