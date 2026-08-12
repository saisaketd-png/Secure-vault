import { calculatePasswordStrength } from '@/lib/encryption';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { score, label, color } = calculatePasswordStrength(password);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password Strength:</span>
        <span className={`font-medium ${
          label === 'Weak' ? 'text-destructive' :
          label === 'Fair' ? 'text-warning' :
          label === 'Good' ? 'text-info' :
          'text-success'
        }`}>
          {label}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}