import { BookOpen, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CourseLinkProps {
  href: string;
  title: string;
  description: string;
  isFavorite?: boolean;
  onToggleFavorite?: (event: React.MouseEvent) => void;
}

export function CourseLink({ 
  href, 
  title, 
  description, 
  isFavorite = false,
  onToggleFavorite 
}: CourseLinkProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={800}>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent group transition-colors">
            <Link
              href={href}
              className="flex items-center text-sm"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              <span>{title}</span>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite?.(e);
              }}
              className={cn(
                isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                "transition-all",
                "hover:scale-110 transform duration-200",
                "focus:outline-none",
                "rounded-full p-1"
              )}
            >
              <Star 
                className={cn(
                  "h-4 w-4",
                  isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"
                )}
              />
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px]">
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
