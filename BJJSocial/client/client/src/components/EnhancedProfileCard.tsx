import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Trophy, Medal, Users, Edit3, User as UserIcon, Download, Target, Award, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import BeltBadge from "./BeltBadge";
import { User } from "@shared/schema";
import { exportUserProfile } from "@/lib/htmlExporter";

interface UserStats {
  points: number;
  submissions: number;
  wins: number;
  losses: number;
}

interface UserMatch {
  id: string;
  competitorAId: string;
  competitorBId: string;
  winnerId: string | null;
  method: string | null;
  submissionType: string | null;
  resultFinal: boolean;
  awardedWinnerPts: number;
  awardedLoserPts: number;
  competitorA: User;
  competitorB: User;
  winner?: User;
  tournament: {
    id: string;
    name: string;
    date: string;
    ruleset: string;
    isGi: boolean;
  };
}

interface UserRanking {
  userId: string;
  season: string;
  ruleset: string;
  isGi: boolean;
  belt: string;
  weightClass: string;
  ageDivision: string;
  gender: string;
  points: number;
  submissions: number;
  wins: number;
  losses: number;
  rank?: number;
}

interface EnhancedProfileCardProps {
  user: User;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
}

export default function EnhancedProfileCard({ user, isOwnProfile = false, onEdit, onFollow, onMessage }: EnhancedProfileCardProps) {
  const currentSeason = new Date().getFullYear().toString();
  
  // Fetch user tournament stats
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: [`/api/users/${user.id}/stats`, { season: currentSeason }],
    enabled: !!user.id,
  });

  // Fetch user recent matches
  const { data: userMatches = [], isLoading: matchesLoading } = useQuery<UserMatch[]>({
    queryKey: [`/api/users/${user.id}/matches`, { limit: 5 }],
    enabled: !!user.id,
  });

  // Fetch user's current rankings across divisions using dedicated endpoint
  const { data: leaderboardData, isLoading: rankingsLoading } = useQuery({
    queryKey: [`/api/users/${user.id}/leaderboard`, { season: currentSeason }],
    enabled: !!user.id,
  });

  const winRate = userStats ? 
    userStats.wins + userStats.losses > 0 ? 
      Math.round((userStats.wins / (userStats.wins + userStats.losses)) * 100) : 0
    : user.wins && user.losses ? 
      Math.round((user.wins / (user.wins + user.losses)) * 100) : 0;

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

  const getMatchResult = (match: UserMatch, userId: string) => {
    const isUserA = match.competitorAId === userId;
    const isWinner = match.winnerId === userId;
    const isDraw = !match.winnerId && match.method === 'DRAW';
    
    if (isDraw) return { result: 'Draw', color: 'text-yellow-600' };
    if (isWinner) return { result: 'Win', color: 'text-green-600' };
    return { result: 'Loss', color: 'text-red-600' };
  };

  const getMethodDisplay = (method: string | null, submissionType: string | null) => {
    if (method === 'SUBMISSION' && submissionType) {
      return `${submissionType.toLowerCase().replace('_', ' ')} sub`;
    }
    return method?.toLowerCase().replace('_', ' ') || 'unknown';
  };

  return (
    <Card className="w-full max-w-2xl">
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
        {/* Enhanced Stats Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="rankings" data-testid="tab-rankings">Rankings</TabsTrigger>
            <TabsTrigger value="matches" data-testid="tab-matches">Matches</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-primary" data-testid={`text-tournament-points-${user.id}`}>
                  {statsLoading ? <Skeleton className="h-6 w-8" /> : (userStats?.points || 0)}
                </div>
                <div className="text-xs text-muted-foreground">Tournament Points</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600" data-testid={`text-tournament-record-${user.id}`}>
                  {statsLoading ? <Skeleton className="h-6 w-12" /> : `${userStats?.wins || 0}-${userStats?.losses || 0}`}
                </div>
                <div className="text-xs text-muted-foreground">{winRate}% Win Rate</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-600" data-testid={`text-submissions-${user.id}`}>
                  {statsLoading ? <Skeleton className="h-6 w-8" /> : (userStats?.submissions || 0)}
                </div>
                <div className="text-xs text-muted-foreground">Submissions</div>
              </div>
              <div>
                <div className="text-xl font-bold text-foreground" data-testid={`text-competitions-${user.id}`}>
                  {user.competitions || 0}
                </div>
                <div className="text-xs text-muted-foreground">Competitions</div>
              </div>
            </div>

            {/* Social Stats */}
            <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t">
              <div>
                <div className="text-lg font-bold text-foreground" data-testid={`text-followers-${user.id}`}>
                  {user.followersCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground" data-testid={`text-following-${user.id}`}>
                  {user.followingCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground" data-testid={`text-posts-${user.id}`}>
                  {user.postsCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>

            {/* BJJ Info */}
            <div className="space-y-3 pt-4 border-t">
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
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground" data-testid={`text-bio-${user.id}`}>
                  {user.bio}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rankings" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Target className="w-4 h-4" />
              <span>Current season rankings</span>
            </div>
            
            {rankingsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : leaderboardData && leaderboardData.length > 0 ? (
              <div className="space-y-3">
                {leaderboardData.map((ranking: UserRanking, index: number) => (
                  <Card key={`${ranking.ruleset}-${ranking.isGi}-${ranking.belt}`} className="p-3" data-testid={`card-ranking-${ranking.ruleset}-${ranking.isGi ? 'gi' : 'nogi'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">#{ranking.rank}</div>
                          <div className="text-xs text-muted-foreground">Rank</div>
                        </div>
                        <div>
                          <div className="font-medium">{ranking.ruleset} • {ranking.isGi ? 'Gi' : 'No-Gi'}</div>
                          <div className="text-sm text-muted-foreground">{ranking.belt} • {ranking.weightClass}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary" data-testid={`text-division-points-${ranking.ruleset}-${ranking.isGi ? 'gi' : 'nogi'}`}>
                          {ranking.points}
                        </div>
                        <div className="text-xs text-muted-foreground">Points</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No ranking data available for this season</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="matches" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="w-4 h-4" />
              <span>Recent match history</span>
            </div>
            
            {matchesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : userMatches.length > 0 ? (
              <div className="space-y-3">
                {userMatches.map((match) => {
                  const matchResult = getMatchResult(match, user.id);
                  const opponent = match.competitorAId === user.id ? match.competitorB : match.competitorA;
                  
                  return (
                    <Card key={match.id} className="p-3" data-testid={`card-match-${match.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={matchResult.result === 'Win' ? 'default' : matchResult.result === 'Loss' ? 'destructive' : 'secondary'}>
                            {matchResult.result}
                          </Badge>
                          <div>
                            <div className="font-medium">vs {opponent.firstName} {opponent.lastName}</div>
                            <div className="text-sm text-muted-foreground">
                              {getMethodDisplay(match.method, match.submissionType)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{match.tournament.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(match.tournament.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Medal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No match history available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
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