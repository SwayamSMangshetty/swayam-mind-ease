export const moodValues: { [key: string]: number } = {
  'happy': 9,
  'neutral': 6,
  'sad': 3,
  'angry': 2,
  'overwhelmed': 1,
  'excited': 10,
  'anxious': 4,
  'calm': 7
};

export interface ChartDataPoint {
  label: string;
  value: number | null;
  day?: string;
}

// Generate rolling 7-day data ending today
export const generateRolling7DayData = (moodEntries: any[]): ChartDataPoint[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: ChartDataPoint[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - i);
    const dayName = days[targetDate.getDay()];
    
    // Find mood entries for this specific day
    const dayEntries = moodEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return entryDate.toDateString() === targetDate.toDateString();
    });
    
    let value: number;
    if (dayEntries.length > 0) {
      // Calculate average mood for the day
      const sum = dayEntries.reduce((acc, entry) => acc + (moodValues[entry.mood] || 6), 0);
      value = sum / dayEntries.length;
    } else {
      // Default to neutral if no mood entry
      value = 6; // neutral
    }
    
    result.push({
      label: dayName,
      day: dayName,
      value: value
    });
  }
  
  return result;
};

// Generate SVG path for curved line, handling null values
export const generatePath = (data: ChartDataPoint[], width: number, height: number): string => {
  const maxValue = 10;
  const stepX = width / (data.length - 1);
  
  let path = '';
  
  data.forEach((point, index) => {
    const x = index * stepX;
    const y = height - ((point.value !== null ? point.value : 6) / maxValue) * height;
    
    if (index === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  });
  
  return path;
};

// Generate filled path for area chart, handling null values
export const generateFilledPath = (data: ChartDataPoint[], width: number, height: number): string => {
  const maxValue = 10;
  const stepX = width / (data.length - 1);
  
  if (data.length === 0) return '';
  
  let path = `M 0 ${height}`;
  
  data.forEach((point, index) => {
    const x = index * stepX;
    const y = height - ((point.value !== null ? point.value : 6) / maxValue) * height;
    path += ` L ${x} ${y}`;
  });
  
  const lastX = (data.length - 1) * stepX;
  path += ` L ${lastX} ${height} Z`;
  
  return path;
};

// Calculate insights from mood data
export const calculateInsights = (data: ChartDataPoint[], period: string) => {
  const validData = data.filter(point => point.value !== null);
  
  if (validData.length === 0) {
    return {
      overall: `No mood data available for this ${period.toLowerCase()}.`,
      best: 'No data to analyze.',
      challenging: 'No data to analyze.'
    };
  }
  
  const average = validData.reduce((sum, point) => sum + point.value!, 0) / validData.length;
  const bestPoint = validData.reduce((best, current) => 
    current.value! > best.value! ? current : best
  );
  const worstPoint = validData.reduce((worst, current) => 
    current.value! < worst.value! ? current : worst
  );
  
  let overallMessage = '';
  if (average >= 7) {
    overallMessage = `Your mood has been consistently positive this ${period.toLowerCase()}.`;
  } else if (average >= 5) {
    overallMessage = `Your mood has been moderate this ${period.toLowerCase()}.`;
  } else {
    overallMessage = `Your mood has been challenging this ${period.toLowerCase()}.`;
  }
  
  return {
    overall: overallMessage,
    best: `Your mood was highest ${bestPoint.label.toLowerCase()}.`,
    challenging: `Your mood was lowest ${worstPoint.label.toLowerCase()}.`
  };
};