
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HappinessRecord, MoodJourneyData, Sentiment } from '@/types/chat';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, addDays, parseISO } from 'date-fns';

interface MoodJourneyProps {
  records: HappinessRecord[];
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

const MoodJourney: React.FC<MoodJourneyProps> = ({ records }) => {
  const [activeTab, setActiveTab] = useState("week");
  const [chartData, setChartData] = useState<MoodJourneyData>({ period: "week", data: [] });

  useEffect(() => {
    generateChartData(activeTab);
  }, [activeTab, records]);

  const generateChartData = (period: string) => {
    const today = new Date();
    let data = [];
    
    // Ensure we have records, even if empty
    const recordsToUse = records.length > 0 ? records : [createEmptyRecord()];
    
    if (period === "day") {
      // Last 24 hours with 4-hour intervals
      for (let i = 0; i < 6; i++) {
        const hour = today.getHours() - (5 - i) * 4;
        const time = new Date(today);
        time.setHours(hour, 0, 0, 0);
        const timeStr = format(time, "ha");
        
        // Find records from this time period
        const todayStr = format(today, "yyyy-MM-dd");
        const dayRecords = recordsToUse.filter(r => r.date === todayStr);
        
        const value = dayRecords.length > 0 ? dayRecords[0].averageSentiment : 0;
        let sentiment: Sentiment = "neutral";
        
        if (value > 0.5) sentiment = "positive";
        else if (value > 0.2) sentiment = "hopeful";
        else if (value > -0.2) sentiment = "neutral";
        else if (value > -0.5) sentiment = "anxious";
        else sentiment = "negative";
        
        data.push({ label: timeStr, value, sentiment });
      }
    } else if (period === "week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, "EEE");
        const dateKey = format(date, "yyyy-MM-dd");
        
        const dayRecord = recordsToUse.find(r => r.date === dateKey);
        const value = dayRecord ? dayRecord.averageSentiment : 0;
        
        let sentiment: Sentiment = "neutral";
        if (value > 0.5) sentiment = "positive";
        else if (value > 0.2) sentiment = "hopeful";
        else if (value > -0.2) sentiment = "neutral";
        else if (value > -0.5) sentiment = "anxious";
        else sentiment = "negative";
        
        data.push({ label: dateStr, value, sentiment });
      }
    } else if (period === "month") {
      // Last 4 weeks
      for (let i = 0; i < 4; i++) {
        const startDate = subDays(today, i * 7 + 6);
        const endDate = subDays(today, i * 7);
        const weekLabel = `${format(startDate, "MMM d")}-${format(endDate, "d")}`;
        
        // Calculate average for the week
        let weekTotal = 0;
        let count = 0;
        
        for (let j = 0; j < 7; j++) {
          const date = subDays(endDate, j);
          const dateKey = format(date, "yyyy-MM-dd");
          const dayRecord = recordsToUse.find(r => r.date === dateKey);
          
          if (dayRecord) {
            weekTotal += dayRecord.averageSentiment;
            count++;
          }
        }
        
        const value = count > 0 ? weekTotal / count : 0;
        
        let sentiment: Sentiment = "neutral";
        if (value > 0.5) sentiment = "positive";
        else if (value > 0.2) sentiment = "hopeful";
        else if (value > -0.2) sentiment = "neutral";
        else if (value > -0.5) sentiment = "anxious";
        else sentiment = "negative";
        
        data.push({ label: weekLabel, value, sentiment });
      }
      
      // Reverse to show chronological order
      data = data.reverse();
    }
    
    setChartData({ period, data });
  };

  const getSentimentColor = (value: number) => {
    if (value >= 0.5) return "#4ade80"; // Green
    if (value >= 0.2) return "#60a5fa"; // Blue
    if (value >= -0.2) return "#a78bfa"; // Purple
    if (value >= -0.5) return "#fbbf24"; // Yellow
    return "#f87171"; // Red
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      let sentiment = "Neutral";
      
      if (value >= 0.5) sentiment = "Positive";
      else if (value >= 0.2) sentiment = "Hopeful";
      else if (value >= -0.2) sentiment = "Neutral";
      else if (value >= -0.5) sentiment = "Concerned";
      else sentiment = "Negative";
      
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">Mood: {sentiment}</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full bg-background border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Mood Journey</CardTitle>
        <CardDescription>
          Visualizing your emotional patterns over time
        </CardDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis 
              domain={[-1, 1]} 
              ticks={[-1, -0.5, 0, 0.5, 1]}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (value === 1) return "😊";
                if (value === 0.5) return "🙂";
                if (value === 0) return "😐";
                if (value === -0.5) return "🙁";
                if (value === -1) return "😢";
                return "";
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="var(--primary)" 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 text-center">
          <div className="text-sm text-muted-foreground">
            {chartData.data.length > 0 ? (
              <>Your mood has been predominantly 
                <span className="font-medium text-foreground"> 
                  {chartData.data[chartData.data.length - 1].value > 0.2 
                    ? "positive" 
                    : chartData.data[chartData.data.length - 1].value < -0.2 
                      ? "concerned" 
                      : "neutral"
                  }
                </span> recently.
              </>
            ) : (
              "Start chatting to track your mood patterns."
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to create an empty record for today
function createEmptyRecord(): HappinessRecord {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  return {
    date: todayStr,
    averageSentiment: 0, // Neutral
    sentimentCounts: { "neutral": 1 } as Record<Sentiment, number>
  };
}

export default MoodJourney;
