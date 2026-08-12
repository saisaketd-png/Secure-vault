import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Heart, Pencil, Trash2, Download, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Photo {
  id: string;
  title: string;
  file_path: string;
  category: string;
  is_favorite: boolean;
  notes?: string | null;
  created_at: string;
}

interface PhotoCardProps {
  photo: Photo;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export function PhotoCard({ photo, onEdit, onDelete, onToggleFavorite }: PhotoCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      const { data } = await supabase.storage.from('photos').download(photo.file_path);
      if (data) {
        const url = URL.createObjectURL(data);
        setImageUrl(url);
      }
    };
    loadImage();
  }, [photo.file_path]);

  const handleDownload = async () => {
    const { data } = await supabase.storage.from('photos').download(photo.file_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.title;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div 
          className="relative aspect-square cursor-pointer bg-muted"
          onClick={() => setViewerOpen(true)}
        >
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={photo.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Pencil className="h-4 w-4 text-white" />
            </Button>
            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
              <Download className="h-4 w-4 text-white" />
            </Button>
            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold truncate">{photo.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={onToggleFavorite}
            >
              <Heart
                className={`h-4 w-4 ${photo.is_favorite ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
          </div>
          <Badge variant="secondary">{photo.category}</Badge>
          {photo.notes && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{photo.notes}</p>
          )}
        </div>
      </Card>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 bg-background/80"
            onClick={() => setViewerOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={photo.title}
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
