import { useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/hooks/use-i18n" // Updated import path
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BannerSlide } from "@shared/schema"

export default function HeroBanner() {
  const { language } = useI18n()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const { data: slides = [], isLoading } = useQuery<BannerSlide[]>({
    queryKey: ['/api/banner-slides'],
    queryFn: async () => {
      const response = await fetch('/api/banner-slides');
      const data = await response.json();
      console.log('Banner slides data:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
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
    console.log("Embla carousel initialized")

    const intervalId = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(intervalId)
  }, [emblaApi])

  console.log("Banner slides data:", slides)

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-muted animate-pulse flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading slides...</p>
      </div>
    )
  }

  if (!slides?.length) {
    return (
      <div className="w-full h-[600px] bg-muted flex items-center justify-center">
        <p className="text-lg text-muted-foreground">No slides available</p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-background py-24 sm:py-32">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation buttons with adjusted positioning */}
        <div className="absolute left-8 right-8 top-1/2 z-10 flex justify-between transform -translate-y-1/2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/20 hover:bg-black/40 text-white rounded-full w-12 h-12 backdrop-blur-sm"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/20 hover:bg-black/40 text-white rounded-full w-12 h-12 backdrop-blur-sm"
            onClick={scrollNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide) => (
              <div 
                key={slide.id}
                className="relative flex-[0_0_100%] min-w-0"
              >
                <img
                  src={slide.imageUrl}
                  alt={language === 'vi' ? slide.title_vi : slide.title_en}
                  className="w-full h-[600px] object-cover rounded-lg"
                />
                <div className="absolute inset-0">
                  <div 
                    className={`absolute inset-0 flex items-${slide.textVerticalAlign} justify-${slide.textHorizontalAlign} p-8`}
                  >
                    <div 
                      className={`max-w-lg p-8 rounded-lg ${
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
                          className="mt-6"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}