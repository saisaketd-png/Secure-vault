-- Create articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Security',
  author TEXT NOT NULL DEFAULT 'Security Team',
  image_url TEXT,
  read_time INTEGER NOT NULL DEFAULT 5,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access)
CREATE POLICY "Anyone can view published articles"
  ON public.articles
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert articles"
  ON public.articles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
  ON public.articles
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete articles"
  ON public.articles
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample articles about privacy and security
INSERT INTO public.articles (title, slug, summary, content, category, read_time) VALUES
(
  'Why Privacy and Data Security Matter in 2025',
  'why-privacy-and-data-security-matter-2025',
  'Understanding the critical importance of protecting your personal data in an increasingly digital world.',
  E'# Why Privacy and Data Security Matter in 2025\n\nIn today''s interconnected digital landscape, privacy and data security have become more critical than ever. Every day, we share countless pieces of personal information online—from social media posts to financial transactions.\n\n## The Digital Footprint\n\nYour digital footprint is the trail of data you leave behind when using the internet. This includes:\n\n- Browsing history and search queries\n- Social media activity and interactions\n- Online purchases and payment information\n- Location data from mobile devices\n- Email communications\n\n## Why It Matters\n\n**Identity Theft**: Cybercriminals can use your personal information to steal your identity, open fraudulent accounts, or make unauthorized purchases.\n\n**Financial Loss**: Data breaches can lead to direct financial losses through stolen credit card information or fraudulent transactions.\n\n**Privacy Invasion**: Without proper security measures, your private conversations, photos, and personal details can be exposed.\n\n**Reputation Damage**: Leaked personal information can damage your professional and personal reputation.\n\n## Taking Control\n\nProtecting your data starts with awareness and implementing strong security practices:\n\n1. Use unique, strong passwords for each account\n2. Enable two-factor authentication wherever possible\n3. Regularly update your software and devices\n4. Be cautious about what you share online\n5. Use encryption tools for sensitive data\n\nRemember: Your data is valuable. Treat it with the care it deserves.',
  'Privacy',
  8
),
(
  '10 Essential Cybersecurity Tips for 2025',
  '10-essential-cybersecurity-tips-2025',
  'Practical tips to protect yourself from cyber threats and keep your digital life secure.',
  E'# 10 Essential Cybersecurity Tips for 2025\n\nStaying safe online doesn''t have to be complicated. Follow these essential cybersecurity practices to protect yourself from common threats.\n\n## 1. Use Strong, Unique Passwords\n\nCreate passwords that are at least 12 characters long and include a mix of uppercase, lowercase, numbers, and symbols. Never reuse passwords across different accounts.\n\n## 2. Enable Two-Factor Authentication (2FA)\n\n2FA adds an extra layer of security by requiring a second form of verification beyond your password. Use authenticator apps rather than SMS when possible.\n\n## 3. Keep Software Updated\n\nRegularly update your operating system, browsers, and applications. Updates often include critical security patches.\n\n## 4. Be Wary of Phishing Attempts\n\nDon''t click suspicious links in emails or messages. Verify the sender''s identity before sharing sensitive information.\n\n## 5. Use a Password Manager\n\nPassword managers like this vault help you generate and store strong passwords securely. You only need to remember one master password.\n\n## 6. Secure Your Home Network\n\nChange your router''s default password, use WPA3 encryption, and consider setting up a guest network for visitors.\n\n## 7. Back Up Your Data Regularly\n\nMaintain regular backups of important files. Use both cloud storage and physical backups for redundancy.\n\n## 8. Use a VPN on Public Wi-Fi\n\nPublic Wi-Fi networks are often unsecured. Use a Virtual Private Network (VPN) to encrypt your internet traffic.\n\n## 9. Review App Permissions\n\nRegularly audit the permissions granted to apps on your devices. Revoke access to data that apps don''t need.\n\n## 10. Monitor Your Accounts\n\nRegularly check your financial accounts and credit reports for suspicious activity. Set up alerts for unusual transactions.\n\n## Stay Vigilant\n\nCybersecurity is an ongoing process, not a one-time task. Stay informed about new threats and adapt your security practices accordingly.',
  'Security',
  6
),
(
  'Understanding Password Security: Best Practices',
  'understanding-password-security-best-practices',
  'Learn how to create and manage strong passwords that protect your digital accounts effectively.',
  E'# Understanding Password Security: Best Practices\n\nPasswords are the first line of defense for your online accounts. Understanding how to create and manage them properly is crucial for your digital security.\n\n## The Anatomy of a Strong Password\n\nA strong password should be:\n\n- **Long**: At least 12-16 characters\n- **Complex**: Mix of uppercase, lowercase, numbers, and symbols\n- **Unique**: Different for every account\n- **Unpredictable**: Not based on personal information\n\n## Common Password Mistakes\n\n### Using Personal Information\nAvoid using names, birthdays, or other easily discoverable information. Attackers can find this information on social media.\n\n### Password Reuse\nUsing the same password across multiple accounts means one breach compromises all your accounts.\n\n### Simple Patterns\nPatterns like "123456" or "qwerty" are among the first combinations attackers try.\n\n### Short Passwords\nEven complex passwords can be cracked quickly if they''re too short.\n\n## Creating Strong Passwords\n\n### Passphrase Method\nUse a memorable phrase and modify it:\n"I love coffee in the morning!" → "1L0v3C0ff33!ntM0rn!ng"\n\n### Random Generation\nUse a password manager to generate truly random passwords like: "k$9mP#xR2@vN7pQ!"\n\n## Password Management\n\n### Use a Password Manager\nPassword managers:\n- Generate strong, unique passwords\n- Store them securely with encryption\n- Auto-fill credentials on websites\n- Sync across devices\n\n### Enable Two-Factor Authentication\n2FA adds a critical second layer of security. Even if your password is compromised, attackers can''t access your account without the second factor.\n\n### Regular Password Updates\nChange passwords if:\n- A service reports a data breach\n- You suspect account compromise\n- You shared the password with someone\n- The password is weak or reused\n\n## Password Security Checklist\n\n✓ Use unique passwords for each account\n✓ Make passwords at least 12 characters long\n✓ Include various character types\n✓ Avoid personal information\n✓ Use a password manager\n✓ Enable 2FA everywhere possible\n✓ Never share passwords\n✓ Update passwords after breaches\n\n## Conclusion\n\nStrong password practices are fundamental to cybersecurity. By following these guidelines and using tools like password managers, you can significantly improve your online security posture.',
  'Security',
  7
),
(
  'What to Do After a Data Breach',
  'what-to-do-after-data-breach',
  'Step-by-step guide on how to protect yourself and minimize damage after your data has been compromised.',
  E'# What to Do After a Data Breach\n\nDiscovering that your personal data has been compromised in a breach can be alarming. Here''s what you should do immediately to protect yourself.\n\n## Immediate Actions\n\n### 1. Confirm the Breach\nVerify that the breach is legitimate by:\n- Checking the company''s official website or social media\n- Looking for announcements from trusted news sources\n- Visiting haveibeenpwned.com to see if your email was affected\n\n### 2. Change Your Password Immediately\nIf the breached service stores passwords:\n- Create a new, strong, unique password\n- Change passwords on any other accounts where you reused the same password\n- Use this opportunity to implement a password manager\n\n### 3. Enable Two-Factor Authentication\nIf you haven''t already, enable 2FA on the affected account and all other important accounts.\n\n## Assess the Damage\n\n### What Information Was Exposed?\nDifferent types of data require different responses:\n\n**Email Addresses**: Expect increased spam and phishing attempts\n**Passwords**: Change immediately on all affected accounts\n**Credit Card Information**: Contact your bank and monitor for fraudulent charges\n**Social Security Number**: Consider a credit freeze and identity theft protection\n**Medical Information**: Contact healthcare providers and monitor insurance statements\n\n## Protect Your Accounts\n\n### Review Account Activity\nCheck for:\n- Unauthorized logins\n- Changes to account settings\n- Suspicious transactions\n- New devices or applications connected to your account\n\n### Update Security Questions\nIf security questions were exposed, change them to use false but memorable answers.\n\n### Monitor Your Credit\n- Check your credit reports from all three bureaus\n- Set up fraud alerts\n- Consider a credit freeze if sensitive information was exposed\n- Watch for new accounts opened in your name\n\n## Long-Term Protection\n\n### Stay Vigilant for Phishing\nBreaches are often followed by targeted phishing campaigns. Be extra cautious of:\n- Emails asking you to "verify" your information\n- Messages creating urgency or fear\n- Links in unexpected emails or texts\n\n### Document Everything\nKeep records of:\n- When you learned about the breach\n- What data was exposed\n- Actions you took\n- Communications with the breached company\n\n### Consider Credit Monitoring\nMany companies offer free credit monitoring after breaches. Take advantage of these services.\n\n## Prevention for the Future\n\n- Use unique passwords for every account\n- Enable 2FA wherever available\n- Regularly check haveibeenpwned.com\n- Use a password manager\n- Limit the personal information you share online\n- Keep important documents encrypted\n\n## When to Seek Help\n\nConsider professional help if:\n- You notice fraudulent financial activity\n- Someone has stolen your identity\n- You''re unsure how to secure your accounts\n- The breach exposed highly sensitive information\n\nRemember: While you can''t prevent all breaches, you can minimize their impact through quick action and good security practices.',
  'Privacy',
  9
);
