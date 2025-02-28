import { BookOpen } from 'lucide-react';
import Link from 'next/link';
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
}

export function CourseLink({ href, title, description }: CourseLinkProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className="flex items-center p-2 rounded-md hover:bg-accent text-sm transition-colors"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            <span>{title}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px]">
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
