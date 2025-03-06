import { useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BannerSlide } from "@shared/schema"

export default function HeroBanner() {
  const { language } = useI18n()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const { data: slides, isLoading } = useQuery<BannerSlide[]>({
    queryKey: ['/api/banner-slides'],
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi) return

    const intervalId = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(intervalId)
  }, [emblaApi])

  if (isLoading || !slides?.length) {
    return (
      <div className="w-full h-[600px] bg-muted animate-pulse" />
    )
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute left-4 right-4 top-1/2 z-10 flex justify-between transform -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/20 hover:bg-black/40 text-white rounded-full"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/20 hover:bg-black/40 text-white rounded-full"
          onClick={scrollNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className="relative flex-[0_0_100%] min-w-0"
            >
              <img
                src={slide.imageUrl}
                alt={language === 'vi' ? slide.title_vi : slide.title_en}
                className="w-full h-[600px] object-cover"
              />
              <div 
                className={`absolute inset-0 flex items-${slide.textVerticalAlign} justify-${slide.textHorizontalAlign} p-8`}
              >
                <div 
                  className={`max-w-lg p-6 rounded-lg ${
                    slide.darkOverlay ? 'bg-black/50' : 'bg-white/50'
                  } backdrop-blur-sm`}
                >
                  <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
                    slide.darkOverlay ? 'text-white' : 'text-gray-900'
                  }`}>
                    {language === 'vi' ? slide.title_vi : slide.title_en}
                  </h2>
                  <p className={`text-lg ${
                    slide.darkOverlay ? 'text-white/90' : 'text-gray-700'
                  }`}>
                    {language === 'vi' ? slide.description_vi : slide.description_en}
                  </p>
                  {slide.buttonLink && (
                    <Button 
                      variant={slide.darkOverlay ? "outline" : "default"}
                      className="mt-4"
                      asChild
                    >
                      <a href={slide.buttonLink}>
                        {language === 'vi' ? slide.buttonText_vi : slide.buttonText_en}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
