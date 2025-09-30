import PostCard from '../PostCard';

export default function PostCardExample() {
  const mockPost = {
    id: "1",
    user: {
      name: "Carlos Mendes",
      belt: "Purple",
      stripes: 1,
      profilePicture: undefined,
      school: "Alliance BJJ"
    },
    content: "Amazing training session today! Worked on my guard game and finally hit that sweep I've been drilling for weeks. The consistency is paying off. 🥋 #BJJ #Progress #NeverGiveUp",
    type: "training",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 24,
    comments: 8,
    shares: 3,
    location: "São Paulo, Brazil",
    isLiked: false
  };

  return (
    <div className="flex justify-center p-6">
      <PostCard 
        post={mockPost}
        onLike={(id) => console.log('Liked post:', id)}
        onComment={(id) => console.log('Comment on post:', id)}
        onShare={(id) => console.log('Share post:', id)}
      />
    </div>
  );
}