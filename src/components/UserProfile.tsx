
import React, { useState } from 'react';
import { UserPreferences } from '@/types/chat';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences
}) => {
  const [gender, setGender] = useState<string>(preferences.gender || 'prefer-not-to-say');
  const [ageGroup, setAgeGroup] = useState<string>(preferences.ageGroup || 'prefer-not-to-say');

  const handleSave = () => {
    onUpdatePreferences({
      gender: gender as UserPreferences['gender'],
      ageGroup: ageGroup as UserPreferences['ageGroup']
    });
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Profile</DialogTitle>
          <DialogDescription>
            This information helps us personalize your experience.
            It's completely optional and stored only on your device.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">
              Gender
            </Label>
            <Select 
              value={gender} 
              onValueChange={setGender}
            >
              <SelectTrigger className="col-span-3">
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="age" className="text-right">
              Age Group
            </Label>
            <Select 
              value={ageGroup} 
              onValueChange={setAgeGroup}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-18">Under 18</SelectItem>
                <SelectItem value="18-24">18-24</SelectItem>
                <SelectItem value="25-34">25-34</SelectItem>
                <SelectItem value="35-44">35-44</SelectItem>
                <SelectItem value="45-54">45-54</SelectItem>
                <SelectItem value="55+">55 and above</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
