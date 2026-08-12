import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { VaultSidebar } from '@/components/VaultSidebar';
import { CredentialCard } from '@/components/CredentialCard';
import { CredentialDialog, CredentialFormData } from '@/components/CredentialDialog';
import { PasswordGenerator } from '@/components/PasswordGenerator';
import { BreachChecker } from '@/components/BreachChecker';
import { AIChatbot } from '@/components/AIChatbot';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  Download, 
  Lock, 
  User,
  LogOut,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { EncryptionService } from '@/lib/encryption';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Credential {
  id: string;
  user_id: string;
  title: string;
  website_url?: string | null;
  username?: string | null;
  encrypted_password: string;
  notes?: string | null;
  category: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export default function Vault() {
  const { user, masterPassword, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCredentialData, setEditingCredentialData] = useState<any>(null);
  const [editingCredentialId, setEditingCredentialId] = useState<string | null>(null);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [breachCheckerOpen, setBreachCheckerOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && (!user || !masterPassword)) {
      navigate('/auth');
    }
  }, [user, masterPassword, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCredentials();
    }
  }, [user]);

  useEffect(() => {
    filterCredentials();
    calculateCategoryCounts();
  }, [credentials, searchQuery, selectedCategory]);

  const fetchCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error: any) {
      toast.error('Failed to load credentials');
      console.error(error);
    }
  };

  const filterCredentials = () => {
    let filtered = credentials;

    if (selectedCategory === 'Favorites') {
      filtered = filtered.filter(c => c.is_favorite);
    } else if (selectedCategory !== 'All') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.title.toLowerCase().includes(query) ||
          (c.username?.toLowerCase() || '').includes(query) ||
          (c.website_url?.toLowerCase() || '').includes(query) ||
          (c.notes?.toLowerCase() || '').includes(query)
      );
    }

    setFilteredCredentials(filtered);
  };

  const calculateCategoryCounts = () => {
    const counts: Record<string, number> = {
      All: credentials.length,
      Favorites: credentials.filter(c => c.is_favorite).length,
    };

    const categories = ['Social', 'Work', 'Finance', 'Email', 'Gaming', 'Shopping', 'Personal'];
    categories.forEach(cat => {
      counts[cat] = credentials.filter(c => c.category === cat).length;
    });

    setCategoryCounts(counts);
  };

  const handleSaveCredential = async (formData: CredentialFormData) => {
    if (!masterPassword) {
      toast.error('Master password not available');
      return;
    }

    try {
      const encryptedPassword = await EncryptionService.encrypt(formData.password, masterPassword);

      if (editingCredentialId) {
        const { error } = await supabase
          .from('credentials')
          .update({
            title: formData.title,
            website_url: formData.website_url || null,
            username: formData.username || null,
            encrypted_password: encryptedPassword,
            notes: formData.notes || null,
            category: formData.category,
          })
          .eq('id', editingCredentialId);

        if (error) throw error;
        toast.success('Credential updated successfully');
      } else {
        const { error } = await supabase.from('credentials').insert({
          title: formData.title,
          website_url: formData.website_url || null,
          username: formData.username || null,
          encrypted_password: encryptedPassword,
          notes: formData.notes || null,
          category: formData.category,
          user_id: user!.id,
        });

        if (error) throw error;
        toast.success('Credential added successfully');
      }

      await fetchCredentials();
      setEditingCredentialData(null);
      setEditingCredentialId(null);
    } catch (error: any) {
      toast.error('Failed to save credential');
      console.error(error);
      throw error;
    }
  };

  const handleDeleteCredential = async () => {
    if (!credentialToDelete) return;

    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', credentialToDelete);

      if (error) throw error;
      toast.success('Credential deleted successfully');
      await fetchCredentials();
    } catch (error: any) {
      toast.error('Failed to delete credential');
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setCredentialToDelete(null);
    }
  };

  const handleToggleFavorite = async (credential: Credential) => {
    try {
      const { error } = await supabase
        .from('credentials')
        .update({ is_favorite: !credential.is_favorite })
        .eq('id', credential.id);

      if (error) throw error;
      toast.success(credential.is_favorite ? 'Removed from favorites' : 'Added to favorites');
      await fetchCredentials();
    } catch (error: any) {
      toast.error('Failed to update favorite status');
      console.error(error);
    }
  };

  const handleEdit = async (credential: Credential) => {
    if (!masterPassword) {
      toast.error('Master password not available');
      return;
    }

    try {
      const password = await EncryptionService.decrypt(credential.encrypted_password, masterPassword);
      setEditingCredentialId(credential.id);
      setEditingCredentialData({
        title: credential.title,
        website_url: credential.website_url || '',
        username: credential.username || '',
        password,
        notes: credential.notes || '',
        category: credential.category,
      });
      setDialogOpen(true);
    } catch (error) {
      toast.error('Failed to decrypt password');
    }
  };

  const handleExport = async () => {
    if (!masterPassword) {
      toast.error('Master password not available');
      return;
    }

    try {
      const exportData = await Promise.all(
        credentials.map(async (c) => ({
          ...c,
          password: await EncryptionService.decrypt(c.encrypted_password, masterPassword),
          encrypted_password: undefined,
        }))
      );

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `secure-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Vault exported successfully');
    } catch (error) {
      toast.error('Failed to export vault');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center">
          <Lock className="h-8 w-8 text-primary animate-pulse mb-4" />
          <p className="text-sm text-muted-foreground font-medium">Unlocking vault...</p>
        </div>
      </div>
    );
  }

  if (!user || !masterPassword) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SEO 
        title="My Secure Vault" 
        description="Access your encrypted passwords and secure digital vault."
        url="/vault"
      />
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 z-10 bg-card border-r border-border">
        <VaultSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categoryCounts={categoryCounts}
          onGeneratorClick={() => setGeneratorOpen(true)}
          onBreachCheckerClick={() => setBreachCheckerOpen(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Clean Header */}
        <header className="px-8 py-5 flex items-center justify-between border-b border-border/50 bg-background z-20 sticky top-0">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                placeholder="Search credentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-transparent hover:border-border focus-visible:bg-background h-10 shadow-sm transition-colors rounded-md"
              />
            </div>
            <Button onClick={() => setDialogOpen(true)} className="h-10 px-4 shadow-sm rounded-md font-medium text-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Credential
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatbotOpen(true)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-md"
              title="Security Assistant"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleExport}
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-md"
              title="Export Vault"
            >
              <Download className="h-4 w-4" />
            </Button>
            <div className="flex items-center ml-1 border-l border-border/50 pl-2">
              <ThemeToggle />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md ml-1 hover:bg-secondary border border-transparent hover:border-border/50">
                  <User className="h-4 w-4 text-foreground/80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-md p-1 border-border/50 shadow-md">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-sm p-2 cursor-pointer">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Profile & Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuItem onClick={signOut} className="text-destructive rounded-sm p-2 cursor-pointer focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Lock Vault & Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Credentials Grid */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {filteredCredentials.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[70vh] max-w-sm mx-auto text-center space-y-4">
              <div className="h-16 w-16 rounded-xl bg-secondary border border-border/50 flex items-center justify-center mb-2">
                {searchQuery ? (
                  <Search className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {searchQuery
                    ? 'No matches found'
                    : selectedCategory === 'All'
                    ? 'Your vault is empty'
                    : `No credentials in ${selectedCategory}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search query to find what you are looking for.'
                    : 'Get started by adding your first secure credential to the vault.'}
                </p>
              </div>
              
              {!searchQuery && (
                <Button onClick={() => setDialogOpen(true)} className="h-10 px-6 shadow-sm rounded-md font-medium text-sm mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Credential
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCredentials.map((credential) => (
                <CredentialCard
                  key={credential.id}
                  credential={credential}
                  onEdit={() => handleEdit(credential)}
                  onDelete={() => {
                    setCredentialToDelete(credential.id);
                    setDeleteDialogOpen(true);
                  }}
                  onToggleFavorite={() => handleToggleFavorite(credential)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <CredentialDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingCredentialData(null);
            setEditingCredentialId(null);
          }
        }}
        onSave={handleSaveCredential}
        initialData={editingCredentialData}
      />

      <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
        <DialogContent className="max-w-lg bg-card border-border shadow-lg rounded-xl">
          <PasswordGenerator />
        </DialogContent>
      </Dialog>

      <Dialog open={breachCheckerOpen} onOpenChange={setBreachCheckerOpen}>
        <DialogContent className="max-w-lg bg-card border-border shadow-lg rounded-xl">
          <BreachChecker />
        </DialogContent>
      </Dialog>

      <Dialog open={chatbotOpen} onOpenChange={setChatbotOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-card border-border shadow-lg rounded-xl">
          <AIChatbot />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border shadow-lg rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Delete Credential</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to delete this credential? This action cannot be undone and it will be permanently removed from your vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-md h-10 px-4">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCredential} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md h-10 px-4 font-medium shadow-sm">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}