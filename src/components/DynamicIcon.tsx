import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = '', size = 24, color }) => {
  // Find icon component by name
  const IconComponent = (Icons as Record<string, React.ElementType>)[name] || Icons.Wrench;

  return <IconComponent className={className} size={size} color={color} />;
};
