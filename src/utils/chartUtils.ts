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
  value: number;
}

// Generate SVG path for curved line
export const generatePath = (data: ChartDataPoint[], width: number, height: number): string => {
  const maxValue = 10;
  const stepX = width / (data.length - 1);
  
  let path = '';
  
  data.forEach((point, index) => {
    const x = index * stepX;
    const y = height - (point.value / maxValue) * height;
    
    if (index === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  });
  
  return path;
};

// Generate filled path for area chart
export const generateFilledPath = (data: ChartDataPoint[], width: number, height: number): string => {
  const maxValue = 10;
  const stepX = width / (data.length - 1);
  
  if (data.length === 0) return '';
  
  let path = `M 0 ${height}`;
  
  data.forEach((point, index) => {
    const x = index * stepX;
    const y = height - (point.value / maxValue) * height;
    path += ` L ${x} ${y}`;
  });
  
  const lastX = (data.length - 1) * stepX;
  path += ` L ${lastX} ${height} Z`;
  
  return path;
};

// Calculate insights from mood data
export const calculateInsights = (data: ChartDataPoint[], period: string) => {
  const validData = data.filter(point => point.value > 0);
  
  if (validData.length === 0) {
    return {
      overall: `No mood data available for this ${period.toLowerCase()}.`,
      best: 'No data to analyze.',
      challenging: 'No data to analyze.'
    };
  }
  
  const average = validData.reduce((sum, point) => sum + point.value, 0) / validData.length;
  const bestPoint = validData.reduce((best, current) => 
    current.value > best.value ? current : best
  );
  const worstPoint = validData.reduce((worst, current) => 
    current.value < worst.value ? current : worst
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