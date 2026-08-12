import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, Globe, Pencil, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { EncryptionService } from '@/lib/encryption';
import { useAuth } from '@/contexts/AuthContext';

interface CredentialCardProps {
  credential: {
    id: string;
    title: string;
    website_url?: string | null;
    username?: string | null;
    encrypted_password: string;
    notes?: string | null;
    category: string;
    is_favorite: boolean;
    updated_at: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export function CredentialCard({ credential, onEdit, onDelete, onToggleFavorite }: CredentialCardProps) {
  const { masterPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null);

  const handleShowPassword = async () => {
    if (!masterPassword) {
      toast.error('Master password not available');
      return;
    }

    if (!showPassword) {
      try {
        const decrypted = await EncryptionService.decrypt(credential.encrypted_password, masterPassword);
        setDecryptedPassword(decrypted);
        setShowPassword(true);
      } catch (error) {
        toast.error('Failed to decrypt password');
      }
    } else {
      setShowPassword(false);
      setDecryptedPassword(null);
    }
  };

  const handleCopyUsername = async () => {
    if (credential.username) {
      await navigator.clipboard.writeText(credential.username);
      toast.success('Username copied');
    }
  };

  const handleCopyPassword = async () => {
    if (!masterPassword) {
      toast.error('Master password not available');
      return;
    }

    try {
      const decrypted = await EncryptionService.decrypt(credential.encrypted_password, masterPassword);
      await navigator.clipboard.writeText(decrypted);
      toast.success('Password copied');
    } catch (error) {
      toast.error('Failed to copy password');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'less than a minute ago';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card className="group hover:border-border/80 transition-colors bg-card shadow-sm border border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center border border-border/50">
              <Globe className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 overflow-hidden">
              <CardTitle className="text-base font-semibold truncate tracking-tight">{credential.title}</CardTitle>
              {credential.website_url && (
                <CardDescription className="text-xs truncate mt-0.5">{credential.website_url}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Star className={`h-4 w-4 transition-colors ${credential.is_favorite ? 'fill-warning text-warning hover:text-warning' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {credential.username && (
          <div className="flex items-center justify-between group/field">
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Username</p>
              <p className="font-mono text-sm truncate text-foreground">{credential.username}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyUsername}
              className="h-8 w-8 opacity-0 group-hover/field:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between group/field">
          <div className="flex-1 overflow-hidden">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Password</p>
            <p className="font-mono text-sm truncate text-foreground">
              {showPassword ? decryptedPassword : '••••••••••••'}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShowPassword}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyPassword}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {credential.notes && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Notes</p>
            <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">{credential.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/40">
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary font-medium rounded-md px-2">
            {credential.category}
          </Badge>
          <p className="text-xs text-muted-foreground">
            Modified {formatDate(credential.updated_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}