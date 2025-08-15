import React, { useState } from 'react';
import { DollarSign, AlertTriangle, Info, Home, CheckCircle, Shield } from 'lucide-react';
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  return <div className="relative inline-block">
      <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} onClick={() => setIsVisible(!isVisible)} className="cursor-help">
        {children}
      </div>
      {isVisible && <div className="absolute z-10 w-64 px-3 py-2 text-sm text-left text-white bg-gray-800 rounded-md shadow-lg -left-28 bottom-full mb-2">
          {content}
          <div className="absolute w-3 h-3 rotate-45 bg-gray-800 -bottom-1 left-1/2 transform -translate-x-1/2"></div>
        </div>}
    </div>;
};
interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}
const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 40,
  strokeWidth = 4,
  color = '#10B981',
  bgColor = '#E5E7EB'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = percentage * circumference / 100;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={bgColor} strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference - dash} strokeLinecap="round" />
    </svg>;
};
export const DashboardMetrics: React.FC = () => {
  return <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      
    </div>;
};