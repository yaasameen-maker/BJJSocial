import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Target, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BeltBadge from "@/components/BeltBadge";

interface LeaderboardEntry {
  id: string;
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
  lastUpdated: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    school: string | null;
  };
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
  page: number;
  limit: number;
  hasMore: boolean;
}

interface RankingsFilters {
  ruleset?: string;
  isGi?: boolean;
  belt?: string;
  weightClass?: string;
  ageDivision?: string;
  gender?: string;
  season?: string;
}

const Rankings = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RankingsFilters>({
    season: new Date().getFullYear().toString(),
    ruleset: 'IBJJF',
    isGi: true,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: leaderboard, isLoading } = useQuery<LeaderboardResponse>({
    queryKey: ['/api/leaderboard', { ...filters, page, limit: 20 }],
    select: (data) => data,
  });

  const handleFilterChange = (key: keyof RankingsFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-rankings-title">
              <Target className="w-8 h-8 text-primary" />
              BJJ Rankings
            </h1>
            <p className="text-muted-foreground mt-2">
              Competition rankings based on tournament performance
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6" data-testid="card-ranking-filters">
            <CardHeader>
              <CardTitle>Filter Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="season">Season</Label>
                  <Select 
                    value={filters.season || "all"} 
                    onValueChange={(value) => handleFilterChange('season', value)}
                  >
                    <SelectTrigger data-testid="select-season">
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Seasons</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ruleset">Ruleset</Label>
                  <Select 
                    value={filters.ruleset || "all"} 
                    onValueChange={(value) => handleFilterChange('ruleset', value)}
                  >
                    <SelectTrigger data-testid="select-ruleset">
                      <SelectValue placeholder="Select ruleset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rulesets</SelectItem>
                      <SelectItem value="IBJJF">IBJJF</SelectItem>
                      <SelectItem value="ADCC">ADCC</SelectItem>
                      <SelectItem value="SUB_ONLY">Submission Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="gi">Gi/No-Gi</Label>
                  <Select 
                    value={filters.isGi === undefined ? "all" : filters.isGi ? "gi" : "nogi"} 
                    onValueChange={(value) => handleFilterChange('isGi', value === "all" ? undefined : value === "gi")}
                  >
                    <SelectTrigger data-testid="select-gi">
                      <SelectValue placeholder="Gi/No-Gi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="gi">Gi</SelectItem>
                      <SelectItem value="nogi">No-Gi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="belt">Belt</Label>
                  <Select 
                    value={filters.belt || "all"} 
                    onValueChange={(value) => handleFilterChange('belt', value)}
                  >
                    <SelectTrigger data-testid="select-belt">
                      <SelectValue placeholder="Select belt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Belts</SelectItem>
                      <SelectItem value="White">White</SelectItem>
                      <SelectItem value="Blue">Blue</SelectItem>
                      <SelectItem value="Purple">Purple</SelectItem>
                      <SelectItem value="Brown">Brown</SelectItem>
                      <SelectItem value="Black">Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="weightClass">Weight Class</Label>
                  <Select 
                    value={filters.weightClass || "all"} 
                    onValueChange={(value) => handleFilterChange('weightClass', value)}
                  >
                    <SelectTrigger data-testid="select-weight-class">
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Weights</SelectItem>
                      <SelectItem value="Light Feather">Light Feather</SelectItem>
                      <SelectItem value="Feather">Feather</SelectItem>
                      <SelectItem value="Light">Light</SelectItem>
                      <SelectItem value="Middle">Middle</SelectItem>
                      <SelectItem value="Medium Heavy">Medium Heavy</SelectItem>
                      <SelectItem value="Heavy">Heavy</SelectItem>
                      <SelectItem value="Super Heavy">Super Heavy</SelectItem>
                      <SelectItem value="Ultra Heavy">Ultra Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={filters.gender || "all"} 
                    onValueChange={(value) => handleFilterChange('gender', value)}
                  >
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ageDivision">Age Division</Label>
                  <Select 
                    value={filters.ageDivision || "all"} 
                    onValueChange={(value) => handleFilterChange('ageDivision', value)}
                  >
                    <SelectTrigger data-testid="select-age-division">
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="Juvenile">Juvenile</SelectItem>
                      <SelectItem value="Adult">Adult</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Filters Display */}
        {Object.values(filters).some(value => value !== undefined) && (
          <div className="flex flex-wrap gap-2 mb-6" data-testid="current-filters">
            {Object.entries(filters).map(([key, value]) => 
              value !== undefined && (
                <Badge key={key} variant="secondary" className="capitalize">
                  {key}: {value.toString()}
                </Badge>
              )
            )}
          </div>
        )}

        {/* Rankings List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !leaderboard?.data?.length ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No Rankings Found</p>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for more competition data.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leaderboard.data.map((entry, index) => {
              const rank = (leaderboard.page - 1) * leaderboard.limit + index + 1;
              const winRate = getWinRate(entry.wins, entry.losses);
              
              return (
                <Card key={entry.id} className="hover-elevate" data-testid={`card-athlete-${entry.userId}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(rank)}
                        </div>
                        
                        {/* Athlete Info */}
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={entry.user.profileImageUrl || ""} />
                          <AvatarFallback>
                            {entry.user.firstName?.[0]}{entry.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="font-semibold text-lg" data-testid={`text-athlete-name-${entry.userId}`}>
                            {entry.user.firstName} {entry.user.lastName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BeltBadge belt={entry.belt} stripes={0} />
                            <span>{entry.weightClass}</span>
                            {entry.user.school && (
                              <>
                                <span>•</span>
                                <span>{entry.user.school}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center space-x-8 text-right">
                        <div>
                          <div className="text-2xl font-bold text-primary" data-testid={`text-points-${entry.userId}`}>
                            {entry.points}
                          </div>
                          <div className="text-xs text-muted-foreground">Points</div>
                        </div>
                        
                        <div>
                          <div className="text-lg font-semibold" data-testid={`text-record-${entry.userId}`}>
                            {entry.wins}-{entry.losses}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {winRate}% Win Rate
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-lg font-semibold text-orange-600" data-testid={`text-submissions-${entry.userId}`}>
                            {entry.submissions}
                          </div>
                          <div className="text-xs text-muted-foreground">Subs</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {leaderboard && (leaderboard.page > 1 || leaderboard.hasMore) && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              data-testid="button-previous-page"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground" data-testid="text-page-info">
              Page {page}
            </span>
            
            <Button
              variant="outline"
              disabled={!leaderboard.hasMore}
              onClick={() => setPage(p => p + 1)}
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rankings;