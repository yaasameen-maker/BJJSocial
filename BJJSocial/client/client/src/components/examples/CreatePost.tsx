import CreatePost from '../CreatePost';

export default function CreatePostExample() {
  const mockUser = {
    name: "Alex Silva",
    profilePicture: undefined
  };

  return (
    <div className="flex justify-center p-6">
      <CreatePost 
        currentUser={mockUser}
        onCreatePost={(post) => console.log('Post created:', post)}
      />
    </div>
  );
}