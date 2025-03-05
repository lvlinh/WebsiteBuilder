import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { useLocation } from "wouter"
import EventCard from "@/components/Events/EventCard"
import type { Event, EventRegistration } from "@shared/schema"

export default function Events() {
  const { language } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [_, setLocation] = useLocation()

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events']
  })

  const { data: registrationStatuses = [], isLoading: statusesLoading } = useQuery<EventRegistration[]>({
    queryKey: ['/api/students/me/event-registrations'],
    retry: false // Don't retry on 401 (unauthorized)
  })

  const registerMutation = useMutation({
    mutationFn: (eventId: number) =>
      apiRequest("POST", `/api/events/${eventId}/register`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students/me/event-registrations'] })
      toast({
        title: language === 'vi' ? 'Đăng ký thành công' : 'Registration successful',
        description: language === 'vi'
          ? 'Bạn đã đăng ký tham gia sự kiện thành công'
          : 'You have successfully registered for the event',
      })
    },
    onError: (error: any) => {
      if (error.message === 'Unauthorized') {
        toast({
          variant: "destructive",
          title: language === 'vi' ? 'Chưa đăng nhập' : 'Not logged in',
          description: language === 'vi'
            ? 'Vui lòng đăng nhập để đăng ký sự kiện'
            : 'Please log in to register for events',
        })
        setLocation('/student/login')
        return
      }

      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Đăng ký thất bại' : 'Registration failed',
        description: error.message || (language === 'vi'
          ? 'Có lỗi xảy ra khi đăng ký sự kiện'
          : 'There was an error registering for the event'),
      })
    }
  })

  const isRegistered = (eventId: number) => {
    return registrationStatuses.some(reg => reg.eventId === eventId)
  }

  const handleRegister = (eventId: number) => {
    registerMutation.mutate(eventId)
  }

  if (eventsLoading || statusesLoading) {
    return (
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">
          {language === 'vi' ? 'Sự kiện' : 'Events'}
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {language === 'vi' ? 'Sự kiện' : 'Events'}
      </h1>
      <div className="grid gap-6 md:grid-cols-2">
        {events?.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isRegistered={isRegistered(event.id)}
            onRegister={() => handleRegister(event.id)}
          />
        ))}
      </div>
    </div>
  )
}