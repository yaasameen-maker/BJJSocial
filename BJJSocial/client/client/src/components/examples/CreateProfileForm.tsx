import CreateProfileForm from '../CreateProfileForm';

export default function CreateProfileFormExample() {
  return (
    <div className="p-6">
      <CreateProfileForm 
        onSubmit={(data) => console.log('Profile created:', data)}
        onCancel={() => console.log('Profile creation cancelled')}
      />
    </div>
  );
}