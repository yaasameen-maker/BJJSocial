import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, FileText, Trophy, Users, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { User } from "@shared/schema";

interface CreatePostProps {
  currentUser?: User;
  onCreatePost: (post: {
    content: string;
    type: string;
    images?: File[];
  }) => void;
}

export default function CreatePost({ currentUser, onCreatePost }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("general");
  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = () => {
    if (content.trim() || images.length > 0) {
      onCreatePost({
        content: content.trim(),
        type: postType,
        images
      });
      
      // Reset form
      setContent("");
      setPostType("general");
      setImages([]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const postTypes = [
    { value: "general", label: "General", icon: Users },
    { value: "training", label: "Training Update", icon: Trophy },
    { value: "competition", label: "Competition", icon: Trophy },
    { value: "technique", label: "Technique Share", icon: FileText },
    { value: "check-in", label: "Gym Check-in", icon: MapPin },
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* User Avatar */}
          <Avatar className="w-10 h-10">
            <AvatarImage src={currentUser?.profileImageUrl || undefined} />
            <AvatarFallback>
              {((currentUser?.firstName || '') + (currentUser?.lastName || '')).slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            {/* Post Type Selector */}
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger className="w-48" data-testid="select-post-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {postTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center">
                      <type.icon className="w-4 h-4 mr-2" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Content Input */}
            <Textarea
              placeholder="What's on your mind? Share your BJJ journey..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              data-testid="textarea-post-content"
            />

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="text-sm text-muted-foreground" data-testid="text-images-selected">
                {images.length} image(s) selected
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                {/* Photo/Video Upload */}
                <label className="flex items-center cursor-pointer text-muted-foreground hover:text-primary transition-colors">
                  <Camera className="w-5 h-5 mr-2" />
                  <span className="text-sm">Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    data-testid="input-upload-images"
                  />
                </label>

                {/* Document Upload */}
                <label className="flex items-center cursor-pointer text-muted-foreground hover:text-primary transition-colors">
                  <FileText className="w-5 h-5 mr-2" />
                  <span className="text-sm">Document</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    data-testid="input-upload-document"
                  />
                </label>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={!content.trim() && images.length === 0}
                data-testid="button-create-post"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}