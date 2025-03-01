import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { formatDistanceToNow } from 'date-fns';
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Comment {
  user_name: string;
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  author_name?: string;
}

interface PostCommentsProps {
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  isOpen: boolean;
}

const INITIAL_COMMENT_COUNT = 4;
const LOAD_MORE_COUNT = 3;

export function PostComments({ comments, onAddComment, isOpen }: PostCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleComments, setVisibleComments] = useState(INITIAL_COMMENT_COUNT);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment("");
      // Show the new comment by increasing visible count
      setVisibleComments(prev => Math.max(prev, comments.length));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    setVisibleComments(prev => Math.min(prev + LOAD_MORE_COUNT, comments.length));
  };

  // Sort comments by date, newest first
  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const displayedComments = sortedComments.slice(0, visibleComments);
  const remainingCount = sortedComments.length - visibleComments;
  const hasMoreComments = remainingCount > 0;
  
  console.log('Comments' + displayedComments);


  return (
    <div className="mt-4 border-t pt-4 space-y-4">
      <div className="space-y-4">
        {hasMoreComments && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground hover:text-primary"
            onClick={handleLoadMore}
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            Show {remainingCount} more {remainingCount === 1 ? 'comment' : 'comments'}
          </Button>
        )}
        {displayedComments.map((comment) => (
          <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <span className="font-medium text-sm">
                {comment.user_name || 'Anonymous'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm mt-1">{comment.content}</p>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <div className="flex justify-end">
          <Button 
            size="sm"
            onClick={handleSubmit} 
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Comment"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
