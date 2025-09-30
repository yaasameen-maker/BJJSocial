import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Trophy, MapPin, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BeltBadge from "./BeltBadge";

interface PostCardProps {
  post: {
    id: string;
    user: {
      name: string;
      belt: string;
      stripes?: number;
      profilePicture?: string;
      school?: string;
    };
    content: string;
    type: string;
    timestamp: Date | string;
    likes: number;
    comments: number;
    shares: number;
    images?: string[];
    location?: string;
    isLiked?: boolean;
  };
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

export default function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(post.id);
  };

  const formatTimeAgo = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getPostTypeInfo = (type: string) => {
    const types = {
      general: { label: "General", color: "bg-secondary" },
      training: { label: "Training", color: "bg-blue-100 text-blue-800" },
      competition: { label: "Competition", color: "bg-yellow-100 text-yellow-800" },
      technique: { label: "Technique", color: "bg-green-100 text-green-800" },
      "check-in": { label: "Check-in", color: "bg-purple-100 text-purple-800" },
    };
    return types[type as keyof typeof types] || types.general;
  };

  const postTypeInfo = getPostTypeInfo(post.type);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.user.profilePicture} />
              <AvatarFallback>
                {post.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm" data-testid={`text-post-author-${post.id}`}>
                  {post.user.name}
                </h3>
                <BeltBadge belt={post.user.belt} stripes={post.user.stripes} size="sm" />
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`text-xs ${postTypeInfo.color}`}>
                  {postTypeInfo.label}
                </Badge>
                {post.user.school && (
                  <span className="text-xs text-muted-foreground" data-testid={`text-post-school-${post.id}`}>
                    at {post.user.school}
                  </span>
                )}
                {post.location && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span data-testid={`text-post-location-${post.id}`}>{post.location}</span>
                  </div>
                )}
              </div>
              
              <span className="text-xs text-muted-foreground" data-testid={`text-post-time-${post.id}`}>
                {formatTimeAgo(post.timestamp)}
              </span>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Content */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed" data-testid={`text-post-content-${post.id}`}>
            {post.content}
          </p>
        </div>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <div className={`grid ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1`}>
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-square bg-muted">
                  <img 
                    src={image} 
                    alt={`Post image ${index + 1}`}
                    className="w-full h-full object-cover"
                    data-testid={`img-post-${post.id}-${index}`}
                  />
                  {index === 3 && post.images!.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        +{post.images!.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`hover-elevate ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              data-testid={`button-like-${post.id}`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes + (isLiked && !post.isLiked ? 1 : 0)}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment(post.id)}
              className="text-muted-foreground hover-elevate"
              data-testid={`button-comment-${post.id}`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span>{post.comments}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(post.id)}
              className="text-muted-foreground hover-elevate"
              data-testid={`button-share-${post.id}`}
            >
              <Share2 className="w-4 h-4 mr-2" />
              <span>{post.shares}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}