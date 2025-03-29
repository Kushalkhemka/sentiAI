
import React, { useEffect, useState } from 'react';
import { HappinessData, Message, Sentiment } from '@/types/chat';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown, MinusIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface HappinessMeterProps {
  messages: Message[];
}

const sentimentScores: Record<Sentiment, number> = {
  "positive": 90,
  "hopeful": 75,
  "calm": 70,
  "neutral": 50,
  "confused": 40,
  "frustrated": 35,
  "anxious": 30,
  "overwhelmed": 25,
  "suppressed": 20,
  "fearful": 15,
  "negative": 10,
  "depressed": 5,
  "urgent": 1
};

const HappinessMeter: React.FC<HappinessMeterProps> = ({ messages }) => {
  const [happinessData, setHappinessData] = useState<HappinessData>({
    dailyMoods: [],
    weeklyAverage: 50,
    trend: "stable"
  });

  useEffect(() => {
    // Only process if we have user messages
    const userMessages = messages.filter(m => m.sender === "user");
    if (userMessages.length === 0) return;

    // Group messages by day
    const messagesByDay = userMessages.reduce((acc, message) => {
      const date = new Date(message.timestamp).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(message);
      return acc;
    }, {} as Record<string, Message[]>);

    // Calculate sentiment score for each day
    const dailyMoods = Object.entries(messagesByDay).map(([date, msgs]) => {
      // Get average sentiment score
      const sentiments = msgs
        .filter(m => m.sentiment)
        .map(m => m.sentiment as Sentiment);
      
      if (sentiments.length === 0) return null;
      
      // Get most frequent sentiment
      const sentimentCounts = sentiments.reduce((acc, sentiment) => {
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      let dominantSentiment: Sentiment = "neutral";
      let maxCount = 0;
      
      for (const [sentiment, count] of Object.entries(sentimentCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantSentiment = sentiment as Sentiment;
        }
      }
      
      return {
        date,
        sentiment: dominantSentiment,
        confidence: maxCount / sentiments.length
      };
    }).filter(Boolean) as any[];

    // Sort by date
    dailyMoods.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate weekly average
    const recentMoods = dailyMoods.slice(-7); // Last 7 days
    const averageScore = recentMoods.length > 0 
      ? recentMoods.reduce((sum, mood) => sum + sentimentScores[mood.sentiment], 0) / recentMoods.length 
      : 50;
    
    // Calculate trend
    let trend: "improving" | "declining" | "stable" = "stable";
    if (recentMoods.length >= 3) {
      const firstHalf = recentMoods.slice(0, Math.floor(recentMoods.length / 2));
      const secondHalf = recentMoods.slice(Math.floor(recentMoods.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, mood) => sum + sentimentScores[mood.sentiment], 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, mood) => sum + sentimentScores[mood.sentiment], 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 5) trend = "improving";
      else if (firstAvg > secondAvg + 5) trend = "declining";
    }

    setHappinessData({
      dailyMoods,
      weeklyAverage: averageScore,
      trend
    });
  }, [messages]);

  const getTrendIcon = () => {
    switch (happinessData.trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMoodLabel = (score: number) => {
    if (score > 75) return "Great";
    if (score > 60) return "Good";
    if (score > 45) return "Neutral";
    if (score > 30) return "Low";
    return "Very Low";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md">Mood Tracker</CardTitle>
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className="text-xs">{happinessData.trend}</span>
          </div>
        </div>
        <CardDescription>Based on your conversations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {getMoodLabel(happinessData.weeklyAverage)}
            </span>
            <span className="text-xs text-muted-foreground">7-day average</span>
          </div>
          <Progress value={happinessData.weeklyAverage} className="h-2" />
          
          {happinessData.dailyMoods.length > 0 && (
            <div className="grid grid-cols-7 gap-1 mt-3">
              {happinessData.dailyMoods.slice(-7).map((mood, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{
                      backgroundColor: `hsl(${Math.min(sentimentScores[mood.sentiment] * 1.2, 120)}, 70%, 50%)`
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {new Date(mood.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HappinessMeter;
