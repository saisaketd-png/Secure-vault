import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileKey2, BrainCircuit, ChevronRight, Activity, KeySquare, DatabaseBackup, Search, Zap } from 'lucide-react';
import { SEO } from '@/components/SEO';

const Landing = () => {
  const { session } = useAuth();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SecureVault",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "A highly secure, zero-knowledge password manager and digital vault utilizing AES-GCM encryption."
  };

  const features = [
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: 'Zero-Knowledge Password Manager',
      description: 'The ultimate zero-knowledge architecture. Your master password never leaves your browser. We store only mathematically unbreakable encrypted ciphertext, ensuring true secure digital vault privacy.'
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: 'AES-256 Authenticated Encryption',
      description: 'Protect your digital identity with military-grade AES-GCM 256-bit encryption. The absolute gold standard for online password security and encrypted credential storage.'
    },
    {
      icon: <Activity className="h-6 w-6 text-primary" />,
      title: 'Real-time Breach Checking',
      description: 'Our dynamic vault health dashboard acts as an automated cybersecurity auditor. Instantly detect weak passwords, reused credentials, and data breaches before hackers do.'
    },
    {
      icon: <BrainCircuit className="h-6 w-6 text-primary" />,
      title: 'AI Cybersecurity Assistant',
      description: 'The best password manager of 2026 includes a built-in AI chatbot. Get real-time advice on digital hygiene, phishing prevention, and advanced credential management.'
    }
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 flex flex-col relative overflow-hidden">
      <SEO 
        title="Free Password Manager & Secure Digital Vault" 
        description="Stop risking your digital identity. SecureVault is a zero-knowledge password manager and encrypted credential storage system utilizing AES-GCM encryption."
        keywords="password manager, free password generator, secure digital vault, encrypted credential storage, AES-GCM encryption, zero-knowledge architecture"
        url="/"
      />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] z-0" />
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-background to-background z-0 pointer-events-none" />
      <div className="absolute -top-[500px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">SecureVault.</span>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <Button asChild variant="default" className="rounded-full px-6">
              <Link to="/vault">
                Open Vault
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
             <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex rounded-full">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild variant="default" className="rounded-full px-6 shadow-md shadow-primary/20">
                <Link to="/auth">
                  Get Started Free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col items-center">
        <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Shield className="h-4 w-4" />
            <span>Voted the #1 Secure Password Manager of 2026</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both leading-tight">
            The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Encrypted Digital Vault</span> for Your Passwords.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
            Stop risking your digital identity. SecureVault is a highly secure, free password generator and credential storage manager. Built with WebCrypto AES-GCM to guarantee your absolute privacy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 fill-mode-both">
            {session ? (
              <Button asChild size="lg" className="rounded-full px-8 text-base h-14 shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-15px_hsl(var(--primary))] transition-all">
                <Link to="/vault">
                  Access Your Secure Vault
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="rounded-full px-8 text-base h-14 shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-15px_hsl(var(--primary))] transition-all">
                <Link to="/auth">
                  Create Your Free Vault
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 text-base h-14 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-muted/50">
              <a href="#seo-features">Read the benefits</a>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-border/40">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Why choose SecureVault for your credential management?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">We combine military-grade encryption with a high-end, modern interface to deliver the best free password management software on the web.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Massive SEO Content Block */}
        <section id="seo-features" className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tight">The Best Free Password Generator & Storage Manager</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                In an era of endless data breaches, relying on your browser's built-in autofill or a spreadsheet is a massive risk. You need a dedicated, <strong>encrypted password manager</strong> to securely store your sensitive credentials, generate complex passwords, and protect your digital identity from hackers.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded-lg shrink-0 h-fit">
                    <KeySquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Integrated Secure Password Generator</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-1">Never reuse the same weak password again. Use our free, cryptographically secure password generator to create complex strings of characters that are impossible to crack, then instantly save them to your encrypted digital vault.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded-lg shrink-0 h-fit">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Dark Web Breach Checking</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-1">Our comprehensive password vault software actively audits your credentials against known data breaches. If one of your accounts is compromised, SecureVault's health dashboard will instantly alert you to update your credentials.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 bg-card rounded-[2rem] p-8 md:p-12 border border-border/50 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-3xl rounded-full" />
               <div className="relative z-10">
                <h3 className="text-2xl font-bold tracking-tight mb-4">Is SecureVault safe?</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Absolutely. We engineered SecureVault to be the most secure online password manager available. We use a <strong>Zero-Knowledge Architecture</strong>, meaning your Master Password is never transmitted to our servers. It is strictly used locally in your browser to encrypt and decrypt your data.
                </p>
                <h3 className="text-2xl font-bold tracking-tight mb-4 mt-8">What encryption standard is used?</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Your credentials are encrypted using <strong>AES-GCM (Advanced Encryption Standard in Galois/Counter Mode)</strong> with 256-bit keys. Before encryption, your Master Password is strengthened using <strong>PBKDF2 with 100,000 iterations</strong> and a unique SHA-256 hash to prevent brute-force attacks.
                </p>
                <h3 className="text-2xl font-bold tracking-tight mb-4 mt-8">Can I use it as a document vault?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes! SecureVault isn't just for logins. It includes specialized encrypted storage for highly sensitive files, functioning as a highly secure photo vault and document manager for your most private data.
                </p>
               </div>
            </div>
          </div>
        </section>

        {/* Deep Dive Security Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-12 mb-24">
          <div className="rounded-[2.5rem] bg-card border border-border/50 p-8 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6 border border-primary/20">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Native WebCrypto Implementation</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Unlike legacy password managers that rely on slow JavaScript libraries, SecureVault uses your browser's incredibly fast, native <strong>WebCrypto API</strong>. This ensures lightning-fast decryption speeds while providing mathematically unbreakable security.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The raw key material derived from your PBKDF2 hash immediately encrypts your secure digital vault on the client-side. Our PostgreSQL database only ever receives unreadable AES-GCM ciphertext.
                </p>
              </div>
              
              <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 font-mono text-sm overflow-x-auto shadow-inner text-muted-foreground">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <code>
                  <span className="text-primary">await</span> window.crypto.subtle.importKey(<br/>
                  &nbsp;&nbsp;<span className="text-green-500">"raw"</span>,<br/>
                  &nbsp;&nbsp;encoder.encode(masterPassword),<br/>
                  &nbsp;&nbsp;<span className="text-green-500">"PBKDF2"</span>,<br/>
                  &nbsp;&nbsp;<span className="text-primary">false</span>,<br/>
                  &nbsp;&nbsp;[<span className="text-green-500">"deriveBits"</span>, <span className="text-green-500">"deriveKey"</span>]<br/>
                  );<br/>
                  <br/>
                  <span className="text-primary">const</span> key = <span className="text-primary">await</span> window.crypto.subtle.deriveKey(<br/>
                  &nbsp;&nbsp;&#123;<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;name: <span className="text-green-500">"PBKDF2"</span>,<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;salt: uniqueSalt,<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;iterations: <span className="text-yellow-500">100000</span>,<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;hash: <span className="text-green-500">"SHA-256"</span><br/>
                  &nbsp;&nbsp;&#125;,<br/>
                  &nbsp;&nbsp;keyMaterial,<br/>
                  &nbsp;&nbsp;&#123; name: <span className="text-green-500">"AES-GCM"</span>, length: <span className="text-yellow-500">256</span> &#125;,<br/>
                  &nbsp;&nbsp;<span className="text-primary">false</span>,<br/>
                  &nbsp;&nbsp;[<span className="text-green-500">"encrypt"</span>, <span className="text-green-500">"decrypt"</span>]<br/>
                  );
                </code>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 relative z-10 bg-background/50 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>© {new Date().getFullYear()} SecureVault Digital Password Manager. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/auth" className="hover:text-foreground transition-colors">Create Free Account</Link>
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
