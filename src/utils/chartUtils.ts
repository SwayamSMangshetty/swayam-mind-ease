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
}

// Generate SVG path for curved line, handling null values
export const generatePath = (data: ChartDataPoint[], width: number, height: number): string => {
  const maxValue = 10;
  const stepX = width / (data.length - 1);
  
  let path = '';
  let lastValidPoint: { x: number; y: number } | null = null;
  
  data.forEach((point, index) => {
    const x = index * stepX;
    
    if (point.value === null) {
      // Skip null values - this breaks the line
      lastValidPoint = null;
      return;
    }
    
    const y = height - (point.value / maxValue) * height;
    
    if (lastValidPoint === null) {
      // Start new path segment
      path += `M ${x} ${y}`;
    } else {
      // Create smooth curves using quadratic bezier curves
      const cpX = lastValidPoint.x + (x - lastValidPoint.x) / 2;
      const cpY = (lastValidPoint.y + y) / 2;
      path += ` Q ${cpX} ${lastValidPoint.y} ${x} ${y}`;
    }
    
    lastValidPoint = { x, y };
  });
  
  return path;
};

// Generate filled path for area chart, handling null values
export const generateFilledPath = (data: ChartDataPoint[], width: number, height: number): string => {
  const maxValue = 10;
  const stepX = width / (data.length - 1);
  
  let path = '';
  let segments: string[] = [];
  let currentSegment = '';
  let segmentStartX = 0;
  
  data.forEach((point, index) => {
    const x = index * stepX;
    
    if (point.value === null) {
      // End current segment if it exists
      if (currentSegment) {
        currentSegment += ` L ${data[index - 1] ? (index - 1) * stepX : segmentStartX} ${height} L ${segmentStartX} ${height} Z`;
        segments.push(currentSegment);
        currentSegment = '';
      }
      return;
    }
    
    const y = height - (point.value / maxValue) * height;
    
    if (currentSegment === '') {
      // Start new segment
      currentSegment = `M ${x} ${y}`;
      segmentStartX = x;
    } else {
      // Continue segment with smooth curve
      const prevIndex = index - 1;
      const prevX = prevIndex * stepX;
      const prevY = height - ((data[prevIndex]?.value || 0) / maxValue) * height;
      const cpX = prevX + (x - prevX) / 2;
      const cpY = (prevY + y) / 2;
      currentSegment += ` Q ${cpX} ${prevY} ${x} ${y}`;
    }
  });
  
  // Close final segment
  if (currentSegment) {
    const lastValidIndex = data.findLastIndex(point => point.value !== null);
    const lastX = lastValidIndex * stepX;
    currentSegment += ` L ${lastX} ${height} L ${segmentStartX} ${height} Z`;
    segments.push(currentSegment);
  }
  
  return segments.join(' ');
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