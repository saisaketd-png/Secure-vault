import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EncryptionService, calculatePasswordStrength } from '@/lib/encryption';
import { VaultSidebar } from '@/components/VaultSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShieldAlert, ShieldCheck, Shield, AlertTriangle, AlertCircle, KeyRound, Globe, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface HealthCredential {
  id: string;
  title: string;
  username: string | null;
  website_url: string | null;
  passwordStr: string;
  strength: { score: number; label: string; color: string };
  isReused: boolean;
}

export default function VaultHealth() {
  const { user, masterPassword } = useAuth();
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<HealthCredential[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (user && masterPassword) {
      fetchAndAnalyzeCredentials();
    }
  }, [user, masterPassword]);

  const fetchAndAnalyzeCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('id, title, username, website_url, encrypted_password');

      if (error) throw error;
      if (!data) return;

      const analyzed: HealthCredential[] = [];
      const passwordCounts: Record<string, number> = {};

      for (const item of data) {
        try {
          const passwordStr = await EncryptionService.decrypt(item.encrypted_password, masterPassword!);
          const strength = calculatePasswordStrength(passwordStr);
          
          if (!passwordCounts[passwordStr]) {
            passwordCounts[passwordStr] = 0;
          }
          passwordCounts[passwordStr]++;

          analyzed.push({
            id: item.id,
            title: item.title,
            username: item.username,
            website_url: item.website_url,
            passwordStr,
            strength,
            isReused: false
          });
        } catch (err) {
          console.error('Failed to decrypt a credential for health check');
        }
      }

      // Mark reused
      let weakCount = 0;
      let reusedCount = 0;

      analyzed.forEach(item => {
        if (passwordCounts[item.passwordStr] > 1) {
          item.isReused = true;
          reusedCount++;
        }
        if (item.strength.score < 60) {
          weakCount++;
        }
      });

      setCredentials(analyzed);

      // Calculate score
      if (analyzed.length === 0) {
        setScore(100);
      } else {
        // 100 base score.
        // Deduct 20 points for each reused password (max 50 points deduction)
        // Deduct 10 points for each weak password (max 50 points deduction)
        let deduction = Math.min(50, (reusedCount / analyzed.length) * 100) + Math.min(50, (weakCount / analyzed.length) * 100);
        setScore(Math.max(0, Math.round(100 - deduction)));
      }

    } catch (error) {
      toast.error('Failed to run health check');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const weakPasswords = credentials.filter(c => c.strength.score < 60);
  const reusedPasswords = credentials.filter(c => c.isReused);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 z-10 bg-card border-r border-border">
        <VaultSidebar isHealthVault={true} />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-secondary/20 relative">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        
        <div className="max-w-5xl mx-auto space-y-8 p-8 relative z-10">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight">Security Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive health analysis of your encrypted vault.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse h-32 bg-muted/50 border-0" />
              ))}
            </div>
          ) : (
            <>
              {/* Top Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="backdrop-blur-xl bg-card/40 border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Overall Security Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-3">
                      <span className={`text-4xl font-bold tracking-tight ${score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-destructive'}`}>
                        {score}
                      </span>
                      <span className="text-muted-foreground mb-1">/ 100</span>
                    </div>
                    <Progress value={score} className="h-2 mt-4" indicatorClassName={score >= 80 ? 'bg-success' : score >= 60 ? 'bg-warning' : 'bg-destructive'} />
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-card/40 border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Weak Passwords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${weakPasswords.length === 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {weakPasswords.length === 0 ? <ShieldCheck className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                      </div>
                      <div>
                        <span className="text-3xl font-bold tracking-tight">{weakPasswords.length}</span>
                        <p className="text-sm text-muted-foreground">Require attention</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-card/40 border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-warning/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Reused Passwords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${reusedPasswords.length === 0 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {reusedPasswords.length === 0 ? <ShieldCheck className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                      </div>
                      <div>
                        <span className="text-3xl font-bold tracking-tight">{reusedPasswords.length}</span>
                        <p className="text-sm text-muted-foreground">Compromising security</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detail Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                {/* Weak Passwords Panel */}
                <Card className="backdrop-blur-xl bg-card/40 border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-destructive" />
                      Weak Credentials
                    </CardTitle>
                    <CardDescription>Passwords that are easily guessable or too short.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {weakPasswords.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-success/50" />
                        <p>No weak passwords found.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {weakPasswords.map(cred => (
                          <div key={cred.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-border/50">
                            <div className="flex items-center gap-3">
                              <div className="bg-background rounded-md p-2 shadow-sm border border-border/50">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{cred.title}</p>
                                <p className="text-xs text-muted-foreground">{cred.username || 'No username'}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-0">
                              {cred.strength.label}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reused Passwords Panel */}
                <Card className="backdrop-blur-xl bg-card/40 border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-warning" />
                      Reused Across Sites
                    </CardTitle>
                    <CardDescription>Identical passwords used for multiple accounts.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reusedPasswords.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-success/50" />
                        <p>All passwords are unique.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {reusedPasswords.map(cred => (
                          <div key={cred.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-border/50">
                            <div className="flex items-center gap-3">
                              <div className="bg-background rounded-md p-2 shadow-sm border border-border/50">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{cred.title}</p>
                                <p className="text-xs text-muted-foreground">Reused Password</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-warning/10 text-warning border-0">
                              Warning
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
