import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between px-2 sm:px-4 py-3 sm:py-4 max-w-full overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-4">
          <Skeleton className="h-8 sm:h-12 w-32 sm:w-40" />
        </div>
        <nav className="flex gap-2 sm:gap-4">
          <Skeleton className="h-10 w-20 hidden sm:block" />
          <Skeleton className="h-10 w-24 hidden sm:block" />
          <Skeleton className="h-10 w-24 hidden sm:block" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </nav>
      </div>
    </header>
  );
}

