import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function BreachChecker() {
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ breached: boolean; count?: number } | null>(null);

  const checkBreach = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setChecking(true);
    setResult(null);

    try {
      // Using Have I Been Pwned API
      const response = await fetch(
        `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
        {
          headers: {
            'User-Agent': 'SecureVault',
          },
        }
      );

      if (response.status === 404) {
        // Not breached
        setResult({ breached: false });
        toast.success('Good news! This email has not been found in any breaches.');
      } else if (response.ok) {
        // Breached
        const breaches = await response.json();
        setResult({ breached: true, count: breaches.length });
        toast.warning(`This email was found in ${breaches.length} breach${breaches.length > 1 ? 'es' : ''}`);
      } else {
        throw new Error('Failed to check breach status');
      }
    } catch (error) {
      console.error('Breach check error:', error);
      toast.error('Failed to check breach status. Please try again later.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Breach Checker
        </CardTitle>
        <CardDescription>
          Check if your email has been compromised in a data breach
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkBreach()}
          />
          <Button onClick={checkBreach} disabled={checking}>
            {checking ? 'Checking...' : 'Check'}
          </Button>
        </div>

        {result && (
          <Alert variant={result.breached ? 'destructive' : 'default'}>
            {result.breached ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {result.breached ? (
                <>
                  <strong>Warning:</strong> This email was found in {result.count} data breach{result.count! > 1 ? 'es' : ''}.
                  {' '}We recommend changing your passwords immediately.
                </>
              ) : (
                <>
                  <strong>All Clear:</strong> This email has not been found in any known data breaches.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• This service is powered by Have I Been Pwned</p>
          <p>• Your email is checked against millions of breached accounts</p>
          <p>• No data is stored or logged during the check</p>
        </div>
      </CardContent>
    </Card>
  );
}