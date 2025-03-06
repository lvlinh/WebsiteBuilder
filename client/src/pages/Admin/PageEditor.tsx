import { useMutation } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft } from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useToast } from "@/hooks/use-toast"
import { queryClient } from "@/lib/queryClient"
import type { Page } from "@shared/schema"

interface PageEditorProps {
  page: Page
  onBack: () => void
}

export default function PageEditor({ page, onBack }: PageEditorProps) {
  const { language } = useI18n()
  const { toast } = useToast()

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Page> & { id: number }) => {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update page')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] })
      toast({ title: language === 'vi' ? 'Cập nhật thành công' : 'Update successful' })
      onBack()
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Cập nhật thất bại' : 'Update failed'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateMutation.mutate({
      id: page.id,
      title_vi: formData.get('title_vi') as string,
      title_en: formData.get('title_en') as string,
      content_vi: formData.get('content_vi') as string,
      content_en: formData.get('content_en') as string,
      published: formData.get('published') === 'on'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {language === 'vi' ? 'Chỉnh sửa trang' : 'Edit Page'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title_vi">
              {language === 'vi' ? 'Tiêu đề tiếng Việt' : 'Vietnamese Title'}
            </Label>
            <Input 
              id="title_vi" 
              name="title_vi" 
              defaultValue={page.title_vi}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title_en">
              {language === 'vi' ? 'Tiêu đề tiếng Anh' : 'English Title'}
            </Label>
            <Input 
              id="title_en" 
              name="title_en" 
              defaultValue={page.title_en}
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content_vi">
            {language === 'vi' ? 'Nội dung tiếng Việt' : 'Vietnamese Content'}
          </Label>
          <input 
            type="hidden" 
            name="content_vi" 
            id="content_vi" 
            value={page.content_vi} 
          />
          <RichTextEditor
            content={page.content_vi}
            onChange={(html) => {
              const input = document.getElementById('content_vi') as HTMLInputElement
              if (input) input.value = html
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content_en">
            {language === 'vi' ? 'Nội dung tiếng Anh' : 'English Content'}
          </Label>
          <input 
            type="hidden" 
            name="content_en" 
            id="content_en" 
            value={page.content_en} 
          />
          <RichTextEditor
            content={page.content_en}
            onChange={(html) => {
              const input = document.getElementById('content_en') as HTMLInputElement
              if (input) input.value = html
            }}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id="published" 
            name="published"
            defaultChecked={page.published ?? true}
          />
          <Label htmlFor="published">
            {language === 'vi' ? 'Xuất bản' : 'Published'}
          </Label>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </Button>
          <Button 
            type="submit"
            disabled={updateMutation.isPending}
          >
            {language === 'vi' ? 'Lưu thay đổi' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
