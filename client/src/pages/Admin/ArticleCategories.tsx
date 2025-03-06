import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit2, ChevronUp, ChevronDown, X } from "lucide-react"
import type { ArticleCategory, InsertArticleCategory } from "@shared/schema"

interface CategoryEditorProps {
  category?: ArticleCategory
  onSave: () => void
  onCancel: () => void
}

function CategoryEditor({ category, onSave, onCancel }: CategoryEditorProps) {
  const { language } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: InsertArticleCategory) => {
      const res = await fetch('/api/article-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create category')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/article-categories'] })
      toast({
        title: language === 'vi' ? 'Tạo danh mục thành công' : 'Category created successfully',
      })
      onSave()
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Tạo danh mục thất bại' : 'Failed to create category',
        description: error.message
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (data: ArticleCategory) => {
      const { id, createdAt, ...updateData } = data
      const res = await fetch(`/api/article-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update category')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/article-categories'] })
      toast({
        title: language === 'vi' ? 'Cập nhật danh mục thành công' : 'Category updated successfully',
      })
      onSave()
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Cập nhật danh mục thất bại' : 'Failed to update category',
        description: error.message
      })
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      slug: formData.get('slug') as string,
      title_vi: formData.get('title_vi') as string,
      title_en: formData.get('title_en') as string,
      order: Number(formData.get('order')) || 0,
      active: formData.get('active') === 'on'
    }

    if (category?.id) {
      updateMutation.mutate({ ...data, id: category.id, createdAt: category.createdAt })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title_vi">
            {language === 'vi' ? 'Tiêu đề tiếng Việt' : 'Vietnamese Title'}
          </Label>
          <Input 
            id="title_vi" 
            name="title_vi" 
            defaultValue={category?.title_vi}
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
            defaultValue={category?.title_en}
            required 
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input 
            id="slug" 
            name="slug" 
            defaultValue={category?.slug}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">
            {language === 'vi' ? 'Thứ tự' : 'Order'}
          </Label>
          <Input 
            type="number"
            id="order" 
            name="order" 
            defaultValue={category?.order || 0}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="active" 
          name="active"
          defaultChecked={category?.active ?? true}
        />
        <Label htmlFor="active">
          {language === 'vi' ? 'Kích hoạt' : 'Active'}
        </Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
        >
          {language === 'vi' ? 'Hủy' : 'Cancel'}
        </Button>
        <Button type="submit">
          {category?.id
            ? language === 'vi' ? 'Cập nhật' : 'Update'
            : language === 'vi' ? 'Tạo mới' : 'Create'
          }
        </Button>
      </div>
    </form>
  )
}

export default function ArticleCategories() {
  const { language } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editingCategory, setEditingCategory] = useState<ArticleCategory | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const { data: categories } = useQuery<ArticleCategory[]>({
    queryKey: ['/api/article-categories']
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/article-categories/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete category')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/article-categories'] })
      toast({
        title: language === 'vi' ? 'Xóa danh mục thành công' : 'Category deleted successfully',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Xóa danh mục thất bại' : 'Failed to delete category',
        description: error.message
      })
    }
  })

  const moveOrderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: number, newOrder: number }) => {
      const res = await fetch(`/api/article-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder })
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update category order')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/article-categories'] })
    }
  })

  const handleMoveUp = (category: ArticleCategory, index: number) => {
    if (index === 0 || !categories) return
    const newOrder = categories[index - 1].order
    moveOrderMutation.mutate({ id: category.id, newOrder })
  }

  const handleMoveDown = (category: ArticleCategory, index: number) => {
    if (!categories || index === categories.length - 1) return
    const newOrder = categories[index + 1].order
    moveOrderMutation.mutate({ id: category.id, newOrder })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === 'vi' ? 'Quản lý danh mục bài viết' : 'Manage Article Categories'}
        </CardTitle>
        <CardDescription>
          {language === 'vi' 
            ? 'Thêm, sửa, xóa và sắp xếp các danh mục bài viết'
            : 'Add, edit, delete and reorder article categories'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Editor Section */}
        {(isCreating || editingCategory) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCategory
                  ? language === 'vi' ? 'Chỉnh sửa danh mục' : 'Edit Category'
                  : language === 'vi' ? 'Tạo danh mục mới' : 'Create New Category'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryEditor 
                category={editingCategory ?? undefined}
                onSave={() => {
                  setEditingCategory(null)
                  setIsCreating(false)
                }}
                onCancel={() => {
                  setEditingCategory(null)
                  setIsCreating(false)
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <div className="flex justify-end">
          <Button 
            onClick={() => setIsCreating(true)}
            disabled={isCreating || !!editingCategory}
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Tạo danh mục mới' : 'Create New Category'}
          </Button>
        </div>

        <div className="space-y-2">
          {categories?.map((category, index) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {language === 'vi' ? category.title_vi : category.title_en}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.slug}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Order controls */}
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveUp(category, index)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveDown(category, index)}
                        disabled={!categories || index === categories.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Action buttons */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCategory(category)}
                      disabled={isCreating || !!editingCategory}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(
                          language === 'vi'
                            ? 'Bạn có chắc muốn xóa danh mục này?'
                            : 'Are you sure you want to delete this category?'
                        )) {
                          deleteMutation.mutate(category.id)
                        }
                      }}
                      disabled={isCreating || !!editingCategory}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
