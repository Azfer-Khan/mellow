import React from 'react';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick?: (step: number) => void;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick
}) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const handleStepClick = (step: number) => {
    // Only allow navigation to previous steps or current step
    if (step <= currentStep && onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <div className="progress-indicator">
      <div className="progress-header">
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="step-counter">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      <div className="steps-list">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isClickable = stepNumber <= currentStep && onStepClick;

          return (
            <div
              key={stepNumber}
              className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isClickable ? 'clickable' : ''}`}
              onClick={() => handleStepClick(stepNumber)}
            >
              <div className="step-number">
                {isCompleted ? (
                  <svg 
                    className="checkmark" 
                    viewBox="0 0 16 16" 
                    fill="currentColor"
                  >
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <div className="step-title">{title}</div>
            </div>
          );
        })}
      </div>

      <div className="progress-summary">
        <div className="progress-text">
          {currentStep === totalSteps ? 'Complete your intake form' : `Complete Section ${currentStep}`}
        </div>
        <div className="progress-percentage">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator; 