export const moodValues: { [key: string]: number } = {
  'happy': 3,  // Top of chart
  'neutral': 2,
  'angry': 1,
  'sad': 0     // Bottom of chart
};

export interface ChartDataPoint {
  label: string;
  value: number;
  day?: string;
}

// Generate SVG path for curved line
export const generatePath = (data: ChartDataPoint[], width: number, height: number): string => {
  if (!data || data.length === 0) return '';
  
  const maxValue = 3;
  const minValue = 0;
  const stepX = width / (data.length - 1);
  
  let path = '';
  
  data.forEach((point, index) => {
    const x = index * stepX;
    // Map mood value to Y coordinate (flip Y axis so Happy is at top)
    const y = height - ((point.value - minValue) / (maxValue - minValue)) * height;
    
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
  if (!data || data.length === 0) return '';
  
  const maxValue = 3;
  const minValue = 0;
  const stepX = width / (data.length - 1);
  
  let path = `M 0 ${height}`;
  
  data.forEach((point, index) => {
    const x = index * stepX;
    // Map mood value to Y coordinate (flip Y axis so Happy is at top)  
    const y = height - ((point.value - minValue) / (maxValue - minValue)) * height;
    path += ` L ${x} ${y}`;
  });
  
  const lastX = (data.length - 1) * stepX;
  path += ` L ${lastX} ${height} Z`;
  
  return path;
};

// Calculate insights from mood data
export const calculateInsights = (data: ChartDataPoint[], period: string) => {
  const validData = data.filter(point => point.value !== 2);
  
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
  if (average >= 2.5) {
    overallMessage = `Your mood has been consistently positive this ${period.toLowerCase()}.`;
  } else if (average >= 1.5) {
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