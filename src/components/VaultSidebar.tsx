import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Grid, 
  Star, 
  Globe, 
  Briefcase, 
  Wallet, 
  Mail, 
  Gamepad2, 
  ShoppingBag, 
  User,
  RefreshCw,
  Shield,
  Image as ImageIcon,
  Users,
  Plane,
  Calendar,
  FileText,
  BookOpen,
  ShieldCheck
} from 'lucide-react';

interface VaultSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts: Record<string, number>;
  onGeneratorClick?: () => void;
  onBreachCheckerClick?: () => void;
  isPhotoVault?: boolean;
  isDocumentVault?: boolean;
}

const credentialCategoryIcons: Record<string, React.ReactNode> = {
  'All': <Grid className="h-4 w-4" />,
  'Favorites': <Star className="h-4 w-4" />,
  'Social': <Globe className="h-4 w-4" />,
  'Work': <Briefcase className="h-4 w-4" />,
  'Finance': <Wallet className="h-4 w-4" />,
  'Email': <Mail className="h-4 w-4" />,
  'Gaming': <Gamepad2 className="h-4 w-4" />,
  'Shopping': <ShoppingBag className="h-4 w-4" />,
  'Personal': <User className="h-4 w-4" />,
};

const photoCategoryIcons: Record<string, React.ReactNode> = {
  'All': <Grid className="h-4 w-4" />,
  'Favorites': <Star className="h-4 w-4" />,
  'Personal': <User className="h-4 w-4" />,
  'Family': <Users className="h-4 w-4" />,
  'Work': <Briefcase className="h-4 w-4" />,
  'Travel': <Plane className="h-4 w-4" />,
  'Events': <Calendar className="h-4 w-4" />,
  'Documents': <FileText className="h-4 w-4" />,
};

const documentCategoryIcons: Record<string, React.ReactNode> = {
  'All': <Grid className="h-4 w-4" />,
  'Favorites': <Star className="h-4 w-4" />,
  'Personal': <User className="h-4 w-4" />,
  'Work': <Briefcase className="h-4 w-4" />,
  'Financial': <Wallet className="h-4 w-4" />,
  'Legal': <Shield className="h-4 w-4" />,
  'Medical': <FileText className="h-4 w-4" />,
  'Education': <FileText className="h-4 w-4" />,
  'Other': <FileText className="h-4 w-4" />,
};

const credentialCategories = ['All', 'Favorites', 'Social', 'Work', 'Finance', 'Email', 'Gaming', 'Shopping', 'Personal'];
const photoCategories = ['All', 'Favorites', 'Personal', 'Family', 'Work', 'Travel', 'Events', 'Documents'];
const documentCategories = ['All', 'Favorites', 'Personal', 'Work', 'Financial', 'Legal', 'Medical', 'Education', 'Other'];

export function VaultSidebar({ 
  selectedCategory, 
  onCategoryChange, 
  categoryCounts,
  onGeneratorClick,
  onBreachCheckerClick,
  isPhotoVault = false,
  isDocumentVault = false
}: VaultSidebarProps) {
  const navigate = useNavigate();
  const categories = isDocumentVault ? documentCategories : isPhotoVault ? photoCategories : credentialCategories;
  const categoryIcons = isDocumentVault ? documentCategoryIcons : isPhotoVault ? photoCategoryIcons : credentialCategoryIcons;

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-primary text-primary-foreground flex items-center justify-center">
            <Lock className="h-3 w-3" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground tracking-tight">
              {isDocumentVault ? 'DocumentVault.' : isPhotoVault ? 'PhotoVault.' : 'SecureVault.'}
            </h1>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">
              {categoryCounts.All || 0} {isDocumentVault ? 'document' : isPhotoVault ? 'photo' : 'credential'}{(categoryCounts.All || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-6 py-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">
              Categories
            </p>
            <div className="space-y-[2px]">
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <Button
                    key={category}
                    variant="ghost"
                    className={`w-full justify-start gap-3 rounded-md h-9 px-3 group ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-foreground/70 hover:bg-secondary/80 hover:text-foreground'
                    }`}
                    onClick={() => onCategoryChange(category)}
                  >
                    <div className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}>
                      {categoryIcons[category]}
                    </div>
                    <span className="flex-1 text-left text-sm">{category}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {categoryCounts[category] || 0}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">
              Navigation
            </p>
            <div className="space-y-[2px]">
              {isDocumentVault ? (
                <>
                  <NavButton icon={<Lock />} label="Password Vault" onClick={() => navigate('/vault')} />
                  <NavButton icon={<ImageIcon />} label="Photo Vault" onClick={() => navigate('/photos')} />
                </>
              ) : isPhotoVault ? (
                <>
                  <NavButton icon={<Lock />} label="Password Vault" onClick={() => navigate('/vault')} />
                  <NavButton icon={<FileText />} label="Document Vault" onClick={() => navigate('/documents')} />
                </>
              ) : (
                <>
                  <NavButton icon={<ImageIcon />} label="Photo Vault" onClick={() => navigate('/photos')} />
                  <NavButton icon={<FileText />} label="Document Vault" onClick={() => navigate('/documents')} />
                  <NavButton icon={<BookOpen />} label="Security Articles" onClick={() => navigate('/articles')} />
                  <NavButton icon={<RefreshCw />} label="Generator" onClick={onGeneratorClick} />
                  <NavButton icon={<Shield />} label="Check Breach" onClick={onBreachCheckerClick} />
                </>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function NavButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 rounded-md h-9 px-3 text-foreground/70 hover:bg-secondary/80 hover:text-foreground group"
      onClick={onClick}
    >
      <div className="text-muted-foreground group-hover:text-foreground h-4 w-4">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}
