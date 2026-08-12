import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, Trash2, Star, FileText, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DocumentDialog } from './DocumentDialog';

interface Document {
  id: string;
  title: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category: string;
  is_favorite: boolean;
  notes?: string;
  created_at: string;
}

interface DocumentCardProps {
  document: Document;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

export function DocumentCard({ document, onUpdate, onDelete }: DocumentCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    if (document.mime_type.includes('pdf')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Document downloaded');
    } catch (error: any) {
      toast.error('Failed to download document');
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ is_favorite: !document.is_favorite })
        .eq('id', document.id);

      if (error) throw error;
      onUpdate();
      toast.success(document.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error: any) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      onDelete(document.id);
      toast.success('Document deleted');
    } catch (error: any) {
      toast.error('Failed to delete document');
      console.error(error);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="text-primary">
                {getFileIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{document.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(document.file_size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className={document.is_favorite ? 'text-yellow-500' : ''}
            >
              <Star className={document.is_favorite ? 'fill-current' : ''} />
            </Button>
          </div>

          <div className="space-y-2">
            <Badge variant="secondary">{document.category}</Badge>
            {document.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {document.notes}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2 pt-0">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <DocumentDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        document={document}
        onSuccess={onUpdate}
      />
    </>
  );
}