import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const predefinedQuestions = [
  { label: 'How do I create a strong password?', value: 'strong_password' },
  { label: 'What is two-factor authentication?', value: '2fa' },
  { label: 'How often should I change my passwords?', value: 'password_frequency' },
  { label: 'What should I do if my account is breached?', value: 'breach_action' },
];

const responses: Record<string, string> = {
  strong_password: 'A strong password should be at least 12 characters long and include a mix of uppercase and lowercase letters, numbers, and special symbols. Avoid using personal information, common words, or predictable patterns. Use our Password Generator to create secure passwords!',
  '2fa': 'Two-factor authentication (2FA) adds an extra layer of security by requiring two forms of verification: something you know (password) and something you have (like a phone or security key). Enable 2FA on all accounts that support it for maximum security.',
  password_frequency: 'Change your passwords every 3-6 months, or immediately if you suspect a breach. For critical accounts (email, banking), consider changing them more frequently. However, using unique, strong passwords is more important than frequent changes.',
  breach_action: 'If your account is breached: 1) Change your password immediately, 2) Enable 2FA if available, 3) Check for unauthorized activity, 4) Update passwords on any accounts where you reused the same password, 5) Monitor your accounts for suspicious activity.',
};

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your security assistant. Choose a question below or ask me anything about password security!',
    },
  ]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');

  const handleQuestionSelect = (questionValue: string) => {
    const question = predefinedQuestions.find(q => q.value === questionValue);
    if (!question) return;

    const userMessage: Message = { role: 'user', content: question.label };
    const assistantMessage: Message = { role: 'assistant', content: responses[questionValue] };

    setMessages([...messages, userMessage, assistantMessage]);
    setSelectedQuestion('');
    toast.success('Response generated');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Security Assistant
        </CardTitle>
        <CardDescription>Get help with password security questions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-2 border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Quick Questions:</p>
          <div className="grid grid-cols-1 gap-2">
            {predefinedQuestions.map((question) => (
              <Button
                key={question.value}
                variant="outline"
                size="sm"
                onClick={() => handleQuestionSelect(question.value)}
                className="justify-start text-left h-auto py-2 px-3"
              >
                <Send className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-xs">{question.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}