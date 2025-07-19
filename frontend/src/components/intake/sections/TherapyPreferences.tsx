import React, { useState, useEffect } from 'react';

interface TherapyPreferencesProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  isCompleting: boolean;
  onSaveProgress?: () => void;
}

const TherapyPreferences: React.FC<TherapyPreferencesProps> = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  onComplete, 
  isCompleting,
  onSaveProgress 
}) => {
  const [formData, setFormData] = useState(data);

  // Update local state when data prop changes (for auto-fill)
  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleComplete = () => {
    onUpdate(formData);
    onComplete();
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Therapy Preferences</h2>
        <p className="section-description">
          Tell us about your preferences for therapy to help us provide the best care.
        </p>
      </div>

      <div className="form-content">
        <div className="info-box">
          <p>This section is under development. You can complete your intake form now.</p>
        </div>

        <div className="completion-section" style={{ marginTop: '30px' }}>
          <div className="info-box">
            <h4 style={{ margin: '0 0 10px 0' }}>🎉 You're Ready to Complete Your Intake!</h4>
            <p style={{ margin: '0' }}>
              Thank you for taking the time to provide this important information. 
              Your responses help us understand your needs and provide personalized care.
            </p>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>What happens next?</h4>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <li>Your intake information will be securely saved</li>
              <li>Our clinical team will review your responses</li>
              <li>You'll be matched with an appropriate therapist</li>
              <li>You can start using the chat feature for therapy sessions</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="section-navigation">
        <button 
          type="button" 
          className="nav-button secondary"
          onClick={onPrevious}
          disabled={isCompleting}
        >
          Previous: Trauma History
        </button>
        
        <div className="nav-buttons-right">
          <button 
            type="button" 
            className="nav-button secondary"
            onClick={() => onSaveProgress ? onSaveProgress() : onUpdate(formData)}
            disabled={isCompleting}
          >
            Save & Continue Later
          </button>
          
          <button 
            type="button" 
            className={`nav-button primary ${isCompleting ? 'loading' : ''}`}
            onClick={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? 'Completing...' : 'Complete Intake Form'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapyPreferences; 