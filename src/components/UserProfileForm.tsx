
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { UserProfile } from '@/types/chat';

interface UserProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile
}) => {
  const [name, setName] = useState(initialProfile?.name || "");
  const [gender, setGender] = useState<string>(initialProfile?.gender || "");
  const [age, setAge] = useState<number | undefined>(initialProfile?.age);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProfile: UserProfile = {
      ...(initialProfile || { createdAt: new Date() }),
      name: name || undefined,
      gender: gender || undefined,
      age: age,
      updatedAt: new Date()
    };
    
    onSave(updatedProfile);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Profile</DialogTitle>
          <DialogDescription>
            Share some details about yourself to help personalize your 
            chat experience. This information is stored locally and helps
            provide more tailored support.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
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
              min={1}
              max={120}
              value={age || ''}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              placeholder="Enter your age"
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileForm;
