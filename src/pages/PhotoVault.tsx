import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { VaultSidebar } from '@/components/VaultSidebar';
import { PhotoCard } from '@/components/PhotoCard';
import { PhotoDialog, PhotoFormData } from '@/components/PhotoDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Plus, Lock, User, LogOut, Image } from 'lucide-react';
import { toast } from 'sonner';

interface Photo {
  id: string;
  user_id: string;
  title: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category: string;
  is_favorite: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export default function PhotoVault() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [user]);

  useEffect(() => {
    filterPhotos();
    calculateCategoryCounts();
  }, [photos, searchQuery, selectedCategory]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      toast.error('Failed to load photos');
      console.error(error);
    }
  };

  const filterPhotos = () => {
    let filtered = photos;

    if (selectedCategory === 'Favorites') {
      filtered = filtered.filter(p => p.is_favorite);
    } else if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.notes?.toLowerCase().includes(query)
      );
    }

    setFilteredPhotos(filtered);
  };

  const calculateCategoryCounts = () => {
    const counts: Record<string, number> = {
      All: photos.length,
      Favorites: photos.filter(p => p.is_favorite).length,
    };

    const categories = ['Personal', 'Family', 'Work', 'Travel', 'Events', 'Documents'];
    categories.forEach(cat => {
      counts[cat] = photos.filter(p => p.category === cat).length;
    });

    setCategoryCounts(counts);
  };

  const handleSavePhoto = async (formData: PhotoFormData) => {
    if (!user) return;

    try {
      if (editingPhoto) {
        const { error } = await supabase
          .from('photos')
          .update({
            title: formData.title,
            category: formData.category,
            notes: formData.notes || null,
          })
          .eq('id', editingPhoto.id);

        if (error) throw error;
        toast.success('Photo updated successfully');
      } else {
        if (!formData.file) {
          toast.error('Please select a file');
          return;
        }

        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, formData.file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from('photos').insert({
          title: formData.title,
          file_path: fileName,
          file_size: formData.file.size,
          mime_type: formData.file.type,
          category: formData.category,
          notes: formData.notes || null,
          user_id: user.id,
        });

        if (dbError) throw dbError;
        toast.success('Photo added successfully');
      }

      await fetchPhotos();
      setEditingPhoto(null);
    } catch (error: any) {
      toast.error('Failed to save photo');
      console.error(error);
      throw error;
    }
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;

    try {
      const photo = photos.find(p => p.id === photoToDelete);
      if (!photo) return;

      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([photo.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoToDelete);

      if (dbError) throw dbError;
      toast.success('Photo deleted successfully');
      await fetchPhotos();
    } catch (error: any) {
      toast.error('Failed to delete photo');
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
    }
  };

  const handleToggleFavorite = async (photo: Photo) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_favorite: !photo.is_favorite })
        .eq('id', photo.id);

      if (error) throw error;
      toast.success(photo.is_favorite ? 'Removed from favorites' : 'Added to favorites');
      await fetchPhotos();
    } catch (error: any) {
      toast.error('Failed to update favorite status');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Image className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading photo vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="w-64 flex-shrink-0">
        <VaultSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categoryCounts={categoryCounts}
          isPhotoVault
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Photo
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => navigate('/vault')}>
                <Lock className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile & Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Image className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery
                  ? 'No photos found'
                  : selectedCategory === 'All'
                  ? 'No photos yet'
                  : `No photos in ${selectedCategory}`}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Get started by adding your first photo'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Photo
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onEdit={() => {
                    setEditingPhoto(photo);
                    setDialogOpen(true);
                  }}
                  onDelete={() => {
                    setPhotoToDelete(photo.id);
                    setDeleteDialogOpen(true);
                  }}
                  onToggleFavorite={() => handleToggleFavorite(photo)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <PhotoDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingPhoto(null);
        }}
        onSave={handleSavePhoto}
        initialData={editingPhoto ? {
          title: editingPhoto.title,
          category: editingPhoto.category,
          notes: editingPhoto.notes || '',
        } : null}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePhoto} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
