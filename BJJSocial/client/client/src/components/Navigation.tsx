import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Users, Trophy, Search, Bell, User, Settings, Menu, X, Target } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserType } from "@shared/schema";

interface NavigationProps {
  currentUser?: UserType;
  currentView: string;
  onNavigate: (view: string) => void;
  onShowProfile: () => void;
}

export default function Navigation({ currentUser, currentView, onNavigate, onShowProfile }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'rankings', label: 'Rankings', icon: Target },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'search', label: 'Search', icon: Search },
  ];

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
    <nav className="bg-card border-b border-card-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')}
              className="text-2xl font-bold text-foreground"
              data-testid="button-logo"
            >
              BJJ Connect
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "secondary" : "ghost"}
                onClick={() => onNavigate(item.id)}
                className="flex items-center space-x-2"
                data-testid={`button-nav-${item.id}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Button variant="ghost" size="icon" data-testid="button-notifications">
                  <Bell className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-settings">
                  <Settings className="w-5 h-5" />
                </Button>
                <button
                  onClick={onShowProfile}
                  className="flex items-center space-x-2"
                  data-testid="button-profile"
                >
                  <Avatar className={`w-8 h-8 border-2 ${getBeltColor(currentUser.belt || 'White')}`}>
                    <AvatarImage src={currentUser.profileImageUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {((currentUser.firstName || '') + (currentUser.lastName || '')).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">{currentUser.firstName} {currentUser.lastName}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => onNavigate('login')} data-testid="button-signin">
                  Sign In
                </Button>
                <Button onClick={() => onNavigate('register')} data-testid="button-signup">
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-card-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "secondary" : "ghost"}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                  data-testid={`button-mobile-nav-${item.id}`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}