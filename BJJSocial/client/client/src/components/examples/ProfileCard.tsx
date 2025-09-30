import ProfileCard from '../ProfileCard';

export default function ProfileCardExample() {
  const mockUser = {
    id: "1",
    name: "Alex Silva",
    belt: "Blue",
    stripes: 2,
    location: "São Paulo, Brazil",
    school: "Gracie Barra",
    yearsTraining: "3.5",
    competitions: 8,
    wins: 12,
    losses: 4,
    followers: 156,
    following: 89,
    posts: 23,
    bio: "Passionate about BJJ and always looking to improve. Training consistently since 2020 and loving every moment on the mats.",
    joinDate: "2020-03-15"
  };

  return (
    <div className="flex justify-center p-6">
      <ProfileCard 
        user={mockUser}
        isOwnProfile={true}
        onEdit={() => console.log('Edit profile clicked')}
        onFollow={() => console.log('Follow clicked')}
        onMessage={() => console.log('Message clicked')}
      />
    </div>
  );
}