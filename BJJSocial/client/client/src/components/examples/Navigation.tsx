import Navigation from '../Navigation';

export default function NavigationExample() {
  const mockUser = {
    name: "Alex Silva",
    belt: "Blue",
    profilePicture: undefined
  };

  return (
    <Navigation 
      currentUser={mockUser}
      currentView="home"
      onNavigate={(view) => console.log('Navigate to:', view)}
      onShowProfile={() => console.log('Show profile clicked')}
    />
  );
}