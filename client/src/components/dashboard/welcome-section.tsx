
import { User } from '@/lib/types';

type WelcomeSectionProps = {
  user?: User;
};

export function WelcomeSection({ user }: WelcomeSectionProps) {
  return (
    <div className="flex items-center gap-4 p-6 bg-card rounded-lg">
      <div>
        <h2 className="text-2xl font-semibold">
          Welcome back, {user?.name || 'User'}!
        </h2>
      </div>
    </div>
  );
}
