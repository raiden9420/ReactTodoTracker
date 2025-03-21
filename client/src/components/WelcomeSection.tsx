function WelcomeSection({ username, progress, avatar }: { username: string, progress: number, avatar?: string }) {
  return (
    <div className="flex items-center gap-4 p-6 bg-card rounded-lg">
      <Avatar className="h-16 w-16">
        <AvatarImage src={avatar} />
        <AvatarFallback>
          {username?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-2xl font-semibold">Welcome back, {username}!</h2>
      </div>
    </div>
  );
}