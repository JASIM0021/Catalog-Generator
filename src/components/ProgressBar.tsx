import React from 'react';
import { Check } from 'lucide-react';
import { StepProps } from '../types';

interface ProgressBarProps {
  steps: StepProps[];
  currentStep: string;
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep, progress }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-100 text-green-600 ring-2 ring-green-200' 
                    : isActive 
                    ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200' 
                    : 'bg-slate-100 text-slate-400'
                  }
                `}>
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4 transition-all duration-300
                  ${index < currentIndex ? 'bg-green-300' : 'bg-slate-200'}
                `} />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;