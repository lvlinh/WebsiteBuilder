import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { BannerSlide } from "@shared/schema";

export default function BannerSlides() {
  const { language } = useI18n();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<BannerSlide | null>(null);

  const { data: slides = [], isLoading } = useQuery<BannerSlide[]>({
    queryKey: ['/api/banner-slides'],
  });

  const createMutation = useMutation({
    mutationFn: async (newSlide: Omit<BannerSlide, 'id' | 'createdAt'>) => {
      const res = await fetch('/api/banner-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlide),
      });
      if (!res.ok) throw new Error('Failed to create slide');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banner-slides'] });
      toast({ title: 'Slide created successfully' });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ 
        title: 'Failed to create slide',
        variant: 'destructive'
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (slide: BannerSlide) => {
      const res = await fetch(`/api/banner-slides/${slide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slide),
      });
      if (!res.ok) throw new Error('Failed to update slide');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banner-slides'] });
      toast({ title: 'Slide updated successfully' });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ 
        title: 'Failed to update slide',
        variant: 'destructive'
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/banner-slides/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete slide');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banner-slides'] });
      toast({ title: 'Slide deleted successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Failed to delete slide',
        variant: 'destructive'
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      imageUrl: formData.get('imageUrl') as string,
      title_vi: formData.get('title_vi') as string,
      title_en: formData.get('title_en') as string,
      description_vi: formData.get('description_vi') as string,
      description_en: formData.get('description_en') as string,
      textVerticalAlign: formData.get('textVerticalAlign') as string,
      textHorizontalAlign: formData.get('textHorizontalAlign') as string,
      darkOverlay: formData.get('darkOverlay') === 'on',
      buttonLink: formData.get('buttonLink') as string || null,
      buttonText_vi: formData.get('buttonText_vi') as string || null,
      buttonText_en: formData.get('buttonText_en') as string || null,
      order: parseInt(formData.get('order') as string),
      active: formData.get('active') === 'on',
    };

    if (selectedSlide) {
      updateMutation.mutate({ ...data, id: selectedSlide.id, createdAt: selectedSlide.createdAt });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {language === 'vi' ? 'Quản lý Banner' : 'Banner Management'}
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedSlide(null)}>
              <Plus className="mr-2 h-4 w-4" />
              {language === 'vi' ? 'Thêm Banner' : 'Add Banner'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedSlide 
                  ? (language === 'vi' ? 'Chỉnh sửa Banner' : 'Edit Banner')
                  : (language === 'vi' ? 'Thêm Banner Mới' : 'Add New Banner')}
              </DialogTitle>
              <DialogDescription>
                {language === 'vi' 
                  ? 'Điền thông tin banner bên dưới'
                  : 'Fill in the banner information below'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input 
                    id="imageUrl"
                    name="imageUrl"
                    defaultValue={selectedSlide?.imageUrl}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title_vi">Vietnamese Title</Label>
                    <Input 
                      id="title_vi"
                      name="title_vi"
                      defaultValue={selectedSlide?.title_vi}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="title_en">English Title</Label>
                    <Input 
                      id="title_en"
                      name="title_en"
                      defaultValue={selectedSlide?.title_en}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description_vi">Vietnamese Description</Label>
                    <Input 
                      id="description_vi"
                      name="description_vi"
                      defaultValue={selectedSlide?.description_vi}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description_en">English Description</Label>
                    <Input 
                      id="description_en"
                      name="description_en"
                      defaultValue={selectedSlide?.description_en}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="textVerticalAlign">Vertical Alignment</Label>
                    <Select 
                      name="textVerticalAlign"
                      defaultValue={selectedSlide?.textVerticalAlign || "center"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="start">Top</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="end">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="textHorizontalAlign">Horizontal Alignment</Label>
                    <Select 
                      name="textHorizontalAlign"
                      defaultValue={selectedSlide?.textHorizontalAlign || "center"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="start">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="end">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="darkOverlay" 
                    name="darkOverlay"
                    defaultChecked={selectedSlide?.darkOverlay}
                  />
                  <Label htmlFor="darkOverlay">Dark Overlay</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buttonLink">Button Link (Optional)</Label>
                    <Input 
                      id="buttonLink"
                      name="buttonLink"
                      defaultValue={selectedSlide?.buttonLink || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="order">Order</Label>
                    <Input 
                      id="order"
                      name="order"
                      type="number"
                      defaultValue={selectedSlide?.order || slides.length + 1}
                      required
                    />
                  </div>
                </div>
                {/* Only show button text fields if buttonLink is present */}
                {(selectedSlide?.buttonLink || !selectedSlide) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buttonText_vi">Vietnamese Button Text</Label>
                      <Input 
                        id="buttonText_vi"
                        name="buttonText_vi"
                        defaultValue={selectedSlide?.buttonText_vi || ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="buttonText_en">English Button Text</Label>
                      <Input 
                        id="buttonText_en"
                        name="buttonText_en"
                        defaultValue={selectedSlide?.buttonText_en || ''}
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="active" 
                    name="active"
                    defaultChecked={selectedSlide?.active ?? true}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="submit">
                  {selectedSlide 
                    ? (language === 'vi' ? 'Cập nhật' : 'Update')
                    : (language === 'vi' ? 'Tạo mới' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {slides.map((slide) => (
          <Card key={slide.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{language === 'vi' ? slide.title_vi : slide.title_en}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSlide(slide);
                      setIsDialogOpen(true);
                    }}
                  >
                    {language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm(language === 'vi' ? 'Xác nhận xóa?' : 'Confirm deletion?')) {
                        deleteMutation.mutate(slide.id);
                      }
                    }}
                  >
                    {language === 'vi' ? 'Xóa' : 'Delete'}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>Order: {slide.order}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative">
                <img
                  src={slide.imageUrl}
                  alt={language === 'vi' ? slide.title_vi : slide.title_en}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}