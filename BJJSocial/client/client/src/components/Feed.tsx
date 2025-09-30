import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface FeedProps {
  currentUser?: User;
}

export default function Feed({ currentUser }: FeedProps) {
  const { toast } = useToast();
  
  // Fetch posts from API
  const { data: posts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/posts"],
  });
  
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; type: string }) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate posts to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to like post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });
  
  // Unlike post mutation
  const unlikePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to unlike post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleCreatePost = (newPost: any) => {
    createPostMutation.mutate({
      content: newPost.content,
      type: newPost.type || "general"
    });
  };

  const handleLike = (postId: string) => {
    const post = (posts as any[]).find((p: any) => p.id === postId);
    if (post?.isLiked) {
      unlikePostMutation.mutate(postId);
    } else {
      likePostMutation.mutate(postId);
    }
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {currentUser && (
        <CreatePost currentUser={currentUser} onCreatePost={handleCreatePost} />
      )}
      
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No posts yet. {currentUser ? "Be the first to share something!" : "Log in to start sharing your BJJ journey!"}
            </p>
          </div>
        ) : (
          (posts as any[]).map((post: any) => (
            <PostCard 
              key={post.id}
              post={{
                ...post,
                // Convert user data to expected format for PostCard
                user: {
                  name: `${post.user?.firstName || ""} ${post.user?.lastName || ""}`.trim() || "Anonymous",
                  belt: post.user?.belt || "White",
                  stripes: post.user?.stripes || 0,
                  profilePicture: post.user?.profileImageUrl,
                  school: post.user?.school || "Unknown"
                },
                timestamp: new Date(post.createdAt)
              }}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
            />
          ))
        )}
      </div>
    </div>
  );
}