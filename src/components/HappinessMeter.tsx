
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HappinessRecord, Sentiment } from '@/types/chat';
import { 
  Smile, 
  Frown, 
  Calendar 
} from "lucide-react";
import { format, subDays, addDays, startOfDay } from 'date-fns';

interface HappinessMeterProps {
  records: HappinessRecord[];
  days?: number; // Number of days to show
}

const sentimentValueMap: Record<Sentiment, number> = {
  "positive": 1,
  "hopeful": 0.7,
  "calm": 0.5,
  "neutral": 0,
  "anxious": -0.3,
  "overwhelmed": -0.5,
  "frustrated": -0.6,
  "confused": -0.3,
  "fearful": -0.7,
  "negative": -0.8,
  "depressed": -1,
  "suppressed": -0.4,
  "urgent": -0.9
};

// Function to get color based on sentiment value
const getMoodColor = (value: number): string => {
  if (value >= 0.7) return 'bg-green-500'; // Very positive - bright green
  if (value >= 0.3) return 'bg-green-400'; // Positive - green
  if (value >= 0.1) return 'bg-lime-400';  // Slightly positive - lime
  if (value > -0.1) return 'bg-yellow-400'; // Neutral - yellow
  if (value > -0.3) return 'bg-amber-400';  // Slightly negative - amber
  if (value > -0.6) return 'bg-orange-500'; // Negative - orange
  return 'bg-red-500';  // Very negative - red
}

const HappinessMeter: React.FC<HappinessMeterProps> = ({ records, days = 7 }) => {
  // Ensure we have records, even if empty
  const recordsToUse = records.length > 0 ? records : [createEmptyRecord()];
  
  // Get the last 'days' number of days
  const today = startOfDay(new Date());
  const dateLabels = Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - i - 1);
    return format(date, 'yyyy-MM-dd');
  });
  
  // Map records to the date labels
  const moodData = dateLabels.map(dateLabel => {
    const record = recordsToUse.find(r => r.date === dateLabel);
    return record ? record.averageSentiment : 0;  // Default to 0 if no record
  });
  
  // Calculate the current day's happiness score
  const todayRecord = recordsToUse.find(r => r.date === format(today, 'yyyy-MM-dd'));
  const currentHappiness = todayRecord ? todayRecord.averageSentiment : 0;
  
  // Calculate trend (is happiness improving or declining?)
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (moodData.length >= 2) {
    const nonNullData = moodData.filter(d => d !== null) as number[];
    if (nonNullData.length >= 2) {
      const latest = nonNullData[nonNullData.length - 1];
      const previous = nonNullData[nonNullData.length - 2];
      if (latest > previous) {
        trend = 'improving';
      } else if (latest < previous) {
        trend = 'declining';
      }
    }
  }
  
  return (
    <Card className="w-full bg-white border-border dark:bg-slate-900">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Happiness Meter</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Your mood trend over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {format(subDays(today, days - 1), 'MMM d')}
          </span>
          <span className="text-sm text-muted-foreground">
            {format(today, 'MMM d')}
          </span>
        </div>
        
        {/* Mood chart with improved colors */}
        <div className="flex h-16 items-end gap-1 mb-4">
          {moodData.map((mood, index) => {
            const value = mood === null ? 0 : mood;
            const height = Math.max(5, Math.abs(value) * 100); // Ensure at least 5% height for visibility
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center"
              >
                <div 
                  className={`w-full rounded-t-sm ${getMoodColor(value)}`} 
                  style={{ height: `${height}%` }}
                />
                <div className="w-full h-1 bg-border" />
              </div>
            );
          })}
        </div>
        
        {/* Current mood */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {currentHappiness >= 0 ? (
              <Smile className="h-5 w-5 text-green-500" />
            ) : (
              <Frown className="h-5 w-5 text-orange-500" />
            )}
            <span className="font-medium">
              {currentHappiness >= 0.5 ? 'Happy' : 
               currentHappiness >= 0.2 ? 'Good' :
               currentHappiness > -0.2 ? 'Neutral' :
               currentHappiness > -0.5 ? 'Concerned' : 'Low'}
            </span>
          </div>
          <div className={`text-sm px-2 py-1 rounded-full ${
            trend === 'improving' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
            trend === 'declining' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
          }`}>
            {trend === 'improving' ? 'Improving' : 
             trend === 'declining' ? 'Declining' : 'Stable'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to create an empty record for today
function createEmptyRecord(): HappinessRecord {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  return {
    date: todayStr,
    averageSentiment: 0, // Neutral
    sentimentCounts: { "neutral": 1 } as Record<Sentiment, number>
  };
}

export default HappinessMeter;
