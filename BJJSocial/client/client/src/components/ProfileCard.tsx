import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Trophy, Medal, Users, Edit3, User as UserIcon, Download } from "lucide-react";
import BeltBadge from "./BeltBadge";
import { User } from "@shared/schema";
import { exportUserProfile } from "@/lib/htmlExporter";

interface ProfileCardProps {
  user: User;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
}

export default function ProfileCard({ user, isOwnProfile = false, onEdit, onFollow, onMessage }: ProfileCardProps) {
  const winRate = user.wins && user.losses 
    ? Math.round((user.wins / (user.wins + user.losses)) * 100) 
    : null;

  const handleExportProfile = () => {
    exportUserProfile(user, { 
      title: `${user.firstName || 'Unknown'} ${user.lastName || 'User'} - BJJ Profile`,
      theme: 'light' 
    });
  };

  const getBeltColor = (belt: string) => {
    const colors = {
      White: 'border-gray-300',
      Blue: 'border-blue-500',
      Purple: 'border-purple-500',
      Brown: 'border-yellow-600',
      Black: 'border-gray-900',
      Coral: 'border-red-500',
      Red: 'border-red-600'
    };
    return colors[belt as keyof typeof colors] || colors.White;
  };

  return (
    <Card className="w-full max-w-md">
      {/* Profile Header with Gradient */}
      <div className="relative">
        <div className="h-20 bg-gradient-to-r from-primary/20 to-primary/40 rounded-t-lg" />
        <CardHeader className="relative -mt-10 text-center">
          <Avatar className={`w-20 h-20 mx-auto border-4 ${getBeltColor(user.belt || 'White')} bg-background`}>
            <AvatarImage src={user.profileImageUrl || undefined} />
            <AvatarFallback>
              <UserIcon className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="mt-4">
            <h2 className="text-xl font-bold" data-testid={`text-profile-name-${user.id}`}>
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex items-center justify-center mt-2">
              <BeltBadge belt={user.belt || 'White'} stripes={user.stripes || 0} />
            </div>
            
            {user.location && (
              <div className="flex items-center justify-center mt-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm" data-testid={`text-location-${user.id}`}>{user.location}</span>
              </div>
            )}
          </div>
        </CardHeader>
      </div>

      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground" data-testid={`text-followers-${user.id}`}>
              {user.followersCount || 0}
            </div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground" data-testid={`text-following-${user.id}`}>
              {user.followingCount || 0}
            </div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground" data-testid={`text-posts-${user.id}`}>
              {user.postsCount || 0}
            </div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
        </div>

        {/* BJJ Info */}
        <div className="space-y-3">
          {user.school && (
            <div className="flex items-center text-sm">
              <Trophy className="w-4 h-4 mr-3 text-muted-foreground" />
              <span data-testid={`text-school-${user.id}`}>{user.school}</span>
            </div>
          )}
          
          {user.yearsTraining && (
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
              <span data-testid={`text-years-training-${user.id}`}>{user.yearsTraining} years training</span>
            </div>
          )}
          
          {(user.competitions || user.wins || user.losses) && (
            <div className="flex items-center text-sm">
              <Medal className="w-4 h-4 mr-3 text-muted-foreground" />
              <span data-testid={`text-competition-stats-${user.id}`}>
                {user.competitions || 0} competitions
                {winRate && ` • ${winRate}% win rate`}
              </span>
            </div>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground" data-testid={`text-bio-${user.id}`}>
              {user.bio}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isOwnProfile ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={onEdit}
                data-testid="button-edit-profile"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportProfile}
                data-testid="button-export-profile"
              >
                <Download className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                className="flex-1" 
                onClick={onFollow}
                data-testid={`button-follow-${user.id}`}
              >
                <Users className="w-4 h-4 mr-2" />
                Follow
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={onMessage}
                data-testid={`button-message-${user.id}`}
              >
                Message
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportProfile}
                data-testid={`button-export-profile-${user.id}`}
              >
                <Download className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}