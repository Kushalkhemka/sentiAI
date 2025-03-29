
import React, { useState } from 'react';
import { UserProfile } from '@/types/chat';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  initialProfile?: Partial<UserProfile>;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile = {}
}) => {
  const [name, setName] = useState(initialProfile.name || '');
  const [gender, setGender] = useState<string>(initialProfile.gender || '');
  const [age, setAge] = useState<string>(initialProfile.age?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profile: UserProfile = {
      name: name || undefined,
      gender: gender || undefined,
      age: age ? parseInt(age) : undefined,
      createdAt: initialProfile.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    onSave(profile);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Profile</DialogTitle>
          <DialogDescription>
            Share some details about yourself to help personalize your chat experience.
            This information is stored locally and helps provide more tailored support.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="0"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age (optional)"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileForm;
