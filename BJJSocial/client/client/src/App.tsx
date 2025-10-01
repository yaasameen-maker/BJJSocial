
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Switch, Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@shared/schema";
import { exportCommunityProfiles } from "@/lib/htmlExporter";

// Components
import HeroSection from "./components/HeroSection";
import Navigation from "./components/Navigation";
import ProfileCard from "./components/ProfileCard";
import EnhancedProfileCard from "./components/EnhancedProfileCard";
import CreateProfileForm from "./components/CreateProfileForm";
import Feed from "./components/Feed";
import Rankings from "./pages/Rankings";
import Search from "./pages/Search";

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  
  // Mock users for the prototype  //todo: remove mock functionality
  const [mockUsers] = useState<User[]>([
    {
      id: "1",
      email: "alex.silva@email.com",
      firstName: "Alex",
      lastName: "Silva",
      profileImageUrl: null,
      belt: "Blue",
      stripes: 2,
      weight: "170 lbs",
      weightClass: "Medium Heavy",
      school: "Gracie Barra",
      instructor: "Professor Carlos",
      yearsTraining: "3.5",
      competitions: 8,
      wins: 12,
      losses: 4,
      bio: "Passionate about BJJ and always looking to improve. Training consistently since 2020 and loving every moment on the mats.",
      location: "São Paulo, Brazil",
      ageDivision: "Adult",
      gender: "Male",
      followersCount: 156,
      followingCount: 89,
      postsCount: 23,
      createdAt: new Date("2020-03-15"),
      updatedAt: new Date("2020-03-15")
    },
    {
      id: "2",
      email: "maria.santos@email.com", 
      firstName: "Maria",
      lastName: "Santos",
      profileImageUrl: null,
      belt: "Purple",
      stripes: 1,
      weight: "125 lbs",
      weightClass: "Light",
      school: "Alliance BJJ",
      instructor: "Professor Ana",
      yearsTraining: "5.2",
      competitions: 15,
      wins: 22,
      losses: 8,
      bio: "Former dancer turned BJJ enthusiast. Love the technical aspects and problem-solving nature of jiu-jitsu.",
      location: "Rio de Janeiro, Brazil",
      ageDivision: "Adult",
      gender: "Female",
      followersCount: 234,
      followingCount: 145,
      postsCount: 41,
      createdAt: new Date("2018-08-10"),
      updatedAt: new Date("2018-08-10")
    }
  ]);

  const handleCreateProfile = async (profileData: any) => {
    try {
      // Update user profile with BJJ data
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (response.ok) {
        navigate('/home');
        // Refetch user data
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogin = () => {
    // Redirect to Replit Auth
    window.location.href = '/api/login';
  };

  const handleGetStarted = () => {
    navigate('/create-profile');
  };

  const handleNavigate = (view: string) => {
    navigate(`/${view}`);
  };

  const handleShowProfile = () => {
    navigate('/profile');
  };

  const handleExportCommunity = () => {
    exportCommunityProfiles(mockUsers, {
      title: 'BJJ Community Profiles',
      theme: 'light'
    });
  };

  // Helper function to check if we're on a protected route
  const isProtectedRoute = () => {
    return ['/home', '/profile'].includes(location);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation - shown on all views except landing and create-profile */}
      {location !== '/' && location !== '/create-profile' && (
        <div className="sticky top-0 z-50">
          <Navigation 
            currentUser={user}
            currentView={location.slice(1) || 'home'}
            onNavigate={handleNavigate}
            onShowProfile={handleShowProfile}
          />
        </div>
      )}
      
      {/* Theme Toggle - floating button */}
      {location !== '/' && (
        <div className="fixed bottom-6 right-6 z-40">
          <ThemeToggle />
        </div>
      )}
      
      {/* Main Content with Routes */}
      <main>
        <Switch>
          <Route path="/" component={() => (
            <HeroSection 
              onGetStarted={handleGetStarted}
              onLogin={handleLogin}
            />
          )} />
          
          <Route path="/create-profile" component={() => (
            <div className="min-h-screen bg-background py-8">
              <CreateProfileForm 
                onSubmit={handleCreateProfile}
                onCancel={() => navigate('/')}
              />
            </div>
          )} />
          
          <Route path="/home" component={() => (
            <div className="min-h-screen bg-background">
              <Feed currentUser={user} />
            </div>
          )} />
          
          <Route path="/profile" component={() => (
            user ? (
              <div className="min-h-screen bg-background py-8">
                <div className="max-w-4xl mx-auto px-4">
                  <div className="flex justify-center">
                    <EnhancedProfileCard 
                      user={user}
                      isOwnProfile={true}
                      onEdit={() => console.log('Edit profile clicked')}
                    />
                  </div>
                </div>
              </div>
            ) : <div>Please log in to view your profile</div>
          )} />
          
          <Route path="/community" component={() => (
            <div className="min-h-screen bg-background py-8">
              <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold">Community</h1>
                  <Button 
                    variant="outline" 
                    onClick={handleExportCommunity}
                    data-testid="button-export-community"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Profiles
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockUsers.map(user => (
                    <ProfileCard 
                      key={user.id}
                      user={user}
                      isOwnProfile={false}
                      onFollow={() => console.log('Follow clicked for', `${user.firstName} ${user.lastName}`)}
                      onMessage={() => console.log('Message clicked for', `${user.firstName} ${user.lastName}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )} />
          
          <Route path="/competitions" component={() => (
            <div className="min-h-screen bg-background py-8">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h1 className="text-3xl font-bold mb-4">Competitions</h1>
                <p className="text-muted-foreground">Competition features coming soon!</p>
              </div>
            </div>
          )} />
          
          <Route path="/rankings" component={() => (
            <Rankings />
          )} />
          
          <Route path="/search" component={Search} />
          
          {/* Default route - redirect to landing */}
          <Route component={() => (
            <HeroSection 
              onGetStarted={handleGetStarted}
              onLogin={handleLogin}
            />
          )} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="bjj-connect-theme">
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
