export const formatTime = (seconds: number): string => {
  if (seconds < 0) seconds = 0;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const parseDuration = (input: string): number => {
  if (!input || typeof input !== 'string') return 0;
  
  // Remove any whitespace
  input = input.trim();
  
  // Parse formats like "1:30", "90", "1:30:45"
  const parts = input.split(':').map(part => {
    const num = parseInt(part, 10);
    return isNaN(num) ? 0 : num;
  });
  
  if (parts.length === 1) {
    // Just minutes (convert to seconds)
    return Math.max(0, parts[0] * 60);
  } else if (parts.length === 2) {
    // Minutes:Seconds
    return Math.max(0, (parts[0] * 60) + parts[1]);
  } else if (parts.length === 3) {
    // Hours:Minutes:Seconds
    return Math.max(0, (parts[0] * 3600) + (parts[1] * 60) + parts[2]);
  }
  
  return 0;
};

export const getProgressPercentage = (remaining: number, total: number): number => {
  if (total === 0) return 0;
  if (remaining < 0) remaining = 0;
  return Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const getCategoryColor = (category: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};