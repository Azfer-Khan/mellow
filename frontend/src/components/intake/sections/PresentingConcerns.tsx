import React, { useState, useEffect } from 'react';
import '../SectionStyles.css';

interface PresentingConcernsData {
  main_issues?: string;
  concern_duration?: string;
  current_severity?: string;
  therapy_goals?: string[];
}

interface PresentingConcernsProps {
  data: PresentingConcernsData;
  onUpdate: (data: Partial<PresentingConcernsData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSaveProgress?: () => void;
}

const DURATION_OPTIONS = [
  'Less than 1 month',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '1-2 years',
  '2-5 years',
  'More than 5 years',
  'On and off for years'
];

const SEVERITY_OPTIONS = [
  'Mild - Minimal impact on daily life',
  'Moderate - Some impact on daily activities',
  'Severe - Significant impact on daily functioning',
  'Crisis - Unable to function normally'
];

const COMMON_GOALS = [
  'Reduce anxiety and worry',
  'Manage depression and mood',
  'Improve relationships',
  'Better cope with stress',
  'Process trauma or difficult experiences',
  'Improve self-esteem and confidence',
  'Develop better communication skills',
  'Work through grief and loss',
  'Manage anger and emotional regulation',
  'Improve sleep and energy',
  'Address substance use concerns',
  'Cope with life transitions',
  'Improve work-life balance',
  'Develop healthy boundaries',
  'Increase motivation and focus'
];

const PresentingConcerns: React.FC<PresentingConcernsProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  onSaveProgress
}) => {
  const [formData, setFormData] = useState<PresentingConcernsData>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customGoal, setCustomGoal] = useState('');

  // Update local state when data prop changes (for auto-fill)
  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleInputChange = (field: keyof PresentingConcernsData, value: string | string[]) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleGoalToggle = (goal: string, checked: boolean) => {
    const currentGoals = formData.therapy_goals || [];
    let newGoals: string[];
    
    if (checked) {
      newGoals = [...currentGoals, goal];
    } else {
      newGoals = currentGoals.filter(g => g !== goal);
    }
    
    handleInputChange('therapy_goals', newGoals);
  };

  const addCustomGoal = () => {
    if (customGoal.trim()) {
      const currentGoals = formData.therapy_goals || [];
      const newGoals = [...currentGoals, customGoal.trim()];
      handleInputChange('therapy_goals', newGoals);
      setCustomGoal('');
    }
  };

  const removeCustomGoal = (goalToRemove: string) => {
    const currentGoals = formData.therapy_goals || [];
    const newGoals = currentGoals.filter(g => g !== goalToRemove);
    handleInputChange('therapy_goals', newGoals);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.main_issues?.trim()) {
      newErrors.main_issues = 'Please describe your main concerns';
    }

    if (!formData.concern_duration) {
      newErrors.concern_duration = 'Please select how long you\'ve been experiencing these concerns';
    }

    if (!formData.current_severity) {
      newErrors.current_severity = 'Please indicate the current severity level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate(formData);
      onNext();
    }
  };

  const handleSaveAndContinue = () => {
    if (onSaveProgress) {
      onSaveProgress();
    } else {
      onUpdate(formData);
    }
  };

  const isGoalSelected = (goal: string) => {
    return formData.therapy_goals?.includes(goal) || false;
  };

  const customGoals = formData.therapy_goals?.filter(goal => !COMMON_GOALS.includes(goal)) || [];

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Presenting Concerns</h2>
        <p className="section-description">
          Tell us about what's bringing you to therapy and what you'd like to work on together.
        </p>
      </div>

      <div className="form-content">
        <div className="form-group">
          <label htmlFor="main_issues" className="required">
            What are the main issues or concerns that have brought you to therapy?
          </label>
          <textarea
            id="main_issues"
            value={formData.main_issues || ''}
            onChange={(e) => handleInputChange('main_issues', e.target.value)}
            placeholder="Please describe the main issues, symptoms, or challenges you're experiencing. Take your time to share what feels most important..."
            rows={6}
            className={errors.main_issues ? 'error' : ''}
          />
          {errors.main_issues && <span className="error-text">{errors.main_issues}</span>}
          <small className="help-text">
            This is a safe space to share what's on your mind. Be as detailed as you feel comfortable.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="concern_duration" className="required">
            How long have you been experiencing these concerns?
          </label>
          <select
            id="concern_duration"
            value={formData.concern_duration || ''}
            onChange={(e) => handleInputChange('concern_duration', e.target.value)}
            className={errors.concern_duration ? 'error' : ''}
          >
            <option value="">Select duration</option>
            {DURATION_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.concern_duration && <span className="error-text">{errors.concern_duration}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="current_severity" className="required">
            How would you rate the current severity of these concerns?
          </label>
          <div className="radio-group">
            {SEVERITY_OPTIONS.map(option => (
              <div 
                key={option} 
                className={`radio-item ${formData.current_severity === option ? 'checked' : ''}`}
                onClick={() => handleInputChange('current_severity', option)}
              >
                <input
                  type="radio"
                  id={`severity_${option}`}
                  name="current_severity"
                  value={option}
                  checked={formData.current_severity === option}
                  onChange={() => handleInputChange('current_severity', option)}
                />
                <label htmlFor={`severity_${option}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
          {errors.current_severity && <span className="error-text">{errors.current_severity}</span>}
        </div>

        <div className="form-group">
          <label>
            What would you like to achieve through therapy?
            <span className="optional">(Optional - Select all that apply)</span>
          </label>
          <div className="info-box">
            <p>Choose the goals that resonate with you. You can always adjust these as we work together.</p>
          </div>
          
          <div className="checkbox-group">
            {COMMON_GOALS.map(goal => (
              <div 
                key={goal} 
                className={`checkbox-item ${isGoalSelected(goal) ? 'checked' : ''}`}
                onClick={() => handleGoalToggle(goal, !isGoalSelected(goal))}
              >
                <input
                  type="checkbox"
                  id={`goal_${goal}`}
                  checked={isGoalSelected(goal)}
                  onChange={() => handleGoalToggle(goal, !isGoalSelected(goal))}
                />
                <label htmlFor={`goal_${goal}`}>
                  {goal}
                </label>
              </div>
            ))}
          </div>

          <div className="custom-goal-section" style={{ marginTop: '20px' }}>
            <label htmlFor="custom_goal">Add your own goal:</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <input
                type="text"
                id="custom_goal"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Enter a specific goal that's important to you"
                onKeyPress={(e) => e.key === 'Enter' && addCustomGoal()}
              />
              <button 
                type="button" 
                onClick={addCustomGoal}
                className="nav-button primary"
                style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
              >
                Add Goal
              </button>
            </div>
          </div>

          {customGoals.length > 0 && (
            <div className="custom-goals-list" style={{ marginTop: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Your Custom Goals:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customGoals.map(goal => (
                  <div 
                    key={goal} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'var(--primary-light, rgba(var(--primary-rgb, 59, 130, 246), 0.1))',
                      border: '1px solid var(--primary-color)',
                      borderRadius: '6px'
                    }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{goal}</span>
                    <button 
                      type="button"
                      onClick={() => removeCustomGoal(goal)}
                      style={{ 
                        background: 'none',
                        border: 'none',
                        color: '#e53e3e',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0 4px'
                      }}
                      title="Remove goal"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section-navigation">
        <button 
          type="button" 
          className="nav-button secondary"
          onClick={onPrevious}
        >
          Previous: Client Information
        </button>
        
        <div className="nav-buttons-right">
          <button 
            type="button" 
            className="nav-button secondary"
            onClick={handleSaveAndContinue}
          >
            Save & Continue Later
          </button>
          
          <button 
            type="button" 
            className="nav-button primary"
            onClick={handleNext}
          >
            Next: Mental Health History
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentingConcerns; 