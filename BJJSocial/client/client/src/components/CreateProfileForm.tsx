import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Trophy } from "lucide-react";

interface CreateProfileFormProps {
  onSubmit: (profileData: any) => void;
  onCancel: () => void;
}

export default function CreateProfileForm({ onSubmit, onCancel }: CreateProfileFormProps) {
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    gender: 'male',
    belt: 'White',
    stripes: 0,
    weight: '',
    weightClass: '',
    school: '',
    instructor: '',
    yearsTraining: '',
    competitions: '',
    wins: '',
    losses: '',
    bio: '',
    location: '',
    profilePicture: null as File | null,
    documents: [] as File[]
  });

  const beltRanks = ['White', 'Blue', 'Purple', 'Brown', 'Black', 'Coral', 'Red'];
  const ageDivisions = ['Mighty Mights', 'Pee Wees', 'Juveniles', 'Adults', 'Master 1', 'Master 2', 'Master 3', 'Master 4', 'Master 5'];
  
  const weightClasses = {
    male: {
      'Rooster': '57.5 kg / 127 lbs',
      'Light Feather': '64 kg / 141 lbs',
      'Feather': '70 kg / 154 lbs',
      'Light': '76 kg / 167.5 lbs',
      'Middle': '82.3 kg / 181.5 lbs',
      'Medium Heavy': '88.3 kg / 194.5 lbs',
      'Heavy': '94.3 kg / 207.5 lbs',
      'Super Heavy': '100.5 kg / 221.5 lbs',
      'Ultra Heavy': '100.5+ kg / 221.5+ lbs'
    },
    female: {
      'Light Feather': '53.5 kg / 118 lbs',
      'Feather': '58.5 kg / 129 lbs',
      'Light': '64 kg / 141 lbs',
      'Middle': '69 kg / 152 lbs',
      'Medium Heavy': '74 kg / 163 lbs',
      'Heavy': '79.3 kg / 174.5 lbs',
      'Super Heavy': '79.3+ kg / 174.5+ lbs'
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profileData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'documents') => {
    const files = e.target.files;
    if (!files) return;
    
    if (type === 'profile') {
      setProfileData({...profileData, profilePicture: files[0]});
    } else if (type === 'documents') {
      setProfileData({...profileData, documents: [...profileData.documents, ...Array.from(files)]});
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <User className="mr-3 text-primary" size={24} />
          Create Your BJJ Profile
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b border-border pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  required
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  placeholder="City, State/Country"
                  data-testid="input-location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age Division *</Label>
                <Select value={profileData.age} onValueChange={(value) => setProfileData({...profileData, age: value})}>
                  <SelectTrigger data-testid="select-age-division">
                    <SelectValue placeholder="Select age division" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageDivisions.map(division => (
                      <SelectItem key={division} value={division}>{division}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={profileData.gender} onValueChange={(value) => setProfileData({...profileData, gender: value, weightClass: ''})}>
                  <SelectTrigger data-testid="select-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profilePicture">Profile Picture</Label>
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'profile')}
                  data-testid="input-profile-picture"
                />
              </div>
            </div>
          </div>

          {/* BJJ Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b border-border pb-2 flex items-center">
              <Trophy className="mr-2 text-primary" size={20} />
              BJJ Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="belt">Belt Rank</Label>
                <Select value={profileData.belt} onValueChange={(value) => setProfileData({...profileData, belt: value})}>
                  <SelectTrigger data-testid="select-belt-rank">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {beltRanks.map(belt => (
                      <SelectItem key={belt} value={belt}>{belt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripes">Stripes</Label>
                <Select value={profileData.stripes.toString()} onValueChange={(value) => setProfileData({...profileData, stripes: parseInt(value)})}>
                  <SelectTrigger data-testid="select-stripes">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4].map(stripes => (
                      <SelectItem key={stripes} value={stripes.toString()}>{stripes}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={profileData.weight}
                  onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
                  data-testid="input-weight"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weightClass">Weight Class</Label>
                <Select value={profileData.weightClass} onValueChange={(value) => setProfileData({...profileData, weightClass: value})}>
                  <SelectTrigger data-testid="select-weight-class">
                    <SelectValue placeholder="Select weight class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(weightClasses[profileData.gender as keyof typeof weightClasses]).map(([className, range]) => (
                      <SelectItem key={className} value={className}>{className} ({range})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School/Academy</Label>
                <Input
                  id="school"
                  type="text"
                  value={profileData.school}
                  onChange={(e) => setProfileData({...profileData, school: e.target.value})}
                  placeholder="Your BJJ school or academy"
                  data-testid="input-school"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  type="text"
                  value={profileData.instructor}
                  onChange={(e) => setProfileData({...profileData, instructor: e.target.value})}
                  placeholder="Your main instructor"
                  data-testid="input-instructor"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="yearsTraining">Years Training</Label>
                <Input
                  id="yearsTraining"
                  type="number"
                  step="0.1"
                  value={profileData.yearsTraining}
                  onChange={(e) => setProfileData({...profileData, yearsTraining: e.target.value})}
                  data-testid="input-years-training"
                />
              </div>
            </div>
          </div>

          {/* Competition Statistics */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b border-border pb-2">Competition Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="competitions">Total Competitions</Label>
                <Input
                  id="competitions"
                  type="number"
                  value={profileData.competitions}
                  onChange={(e) => setProfileData({...profileData, competitions: e.target.value})}
                  data-testid="input-competitions"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wins">Wins</Label>
                <Input
                  id="wins"
                  type="number"
                  value={profileData.wins}
                  onChange={(e) => setProfileData({...profileData, wins: e.target.value})}
                  data-testid="input-wins"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="losses">Losses</Label>
                <Input
                  id="losses"
                  type="number"
                  value={profileData.losses}
                  onChange={(e) => setProfileData({...profileData, losses: e.target.value})}
                  data-testid="input-losses"
                />
              </div>
            </div>
          </div>

          {/* Bio and Documents */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Tell us about your BJJ journey..."
                className="min-h-[120px]"
                data-testid="textarea-bio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documents">Documents (Certificates, Photos, etc.)</Label>
              <Input
                id="documents"
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e, 'documents')}
                data-testid="input-documents"
              />
              {profileData.documents.length > 0 && (
                <p className="text-sm text-muted-foreground" data-testid="text-documents-count">
                  {profileData.documents.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="button-create-profile"
            >
              Create Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}