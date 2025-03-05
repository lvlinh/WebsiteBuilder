import { useI18n } from "@/lib/i18n"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from "lucide-react"
import type { Event } from "@shared/schema"

interface EventCardProps {
  event: Event
  isRegistered?: boolean
  onRegister?: () => void
}

export default function EventCard({ event, isRegistered, onRegister }: EventCardProps) {
  const { language } = useI18n()
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "ongoing":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">
            {language === 'vi' ? event.title_vi : event.title_en}
          </CardTitle>
          <Badge className={getStatusColor(event.status)}>
            {event.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {language === 'vi' ? event.description_vi : event.description_en}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(event.startDate), 'PPP')} - {format(new Date(event.endDate), 'PPP')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              {language === 'vi' ? 'Hạn đăng ký: ' : 'Registration deadline: '}
              {format(new Date(event.registrationDeadline), 'PPP')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {language === 'vi' ? 'Sức chứa: ' : 'Capacity: '}
            {event.capacity}
          </span>
          {onRegister && (
            <Button
              onClick={onRegister}
              disabled={isRegistered}
            >
              {isRegistered
                ? language === 'vi' ? 'Đã đăng ký' : 'Registered'
                : language === 'vi' ? 'Đăng ký' : 'Register'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
