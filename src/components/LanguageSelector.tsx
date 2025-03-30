
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage
}) => {
  return (
    <div className="w-full">
      <Select value={selectedLanguage} onValueChange={onSelectLanguage}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent className="bg-background border-border">
          <SelectGroup>
            <SelectLabel>Common</SelectLabel>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español (Spanish)</SelectItem>
            <SelectItem value="fr">Français (French)</SelectItem>
            <SelectItem value="de">Deutsch (German)</SelectItem>
            <SelectItem value="zh">中文 (Chinese)</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Other Languages</SelectLabel>
            <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
            <SelectItem value="ar">العربية (Arabic)</SelectItem>
            <SelectItem value="pt">Português (Portuguese)</SelectItem>
            <SelectItem value="ru">Русский (Russian)</SelectItem>
            <SelectItem value="ja">日本語 (Japanese)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
