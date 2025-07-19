import React, { useState, useEffect } from 'react';
import '../SectionStyles.css';

interface MentalHealthHistoryData {
  prior_counselling?: boolean;
  prior_counselling_helpful?: number;
  prior_counselling_details?: string;
  psychiatric_hospitalization?: boolean;
  psychiatric_hospitalization_details?: string;
  current_self_harm_thoughts?: boolean;
  current_self_harm_details?: string;
  suicide_attempt_history?: boolean;
  suicide_attempt_details?: string;
  violence_history?: boolean;
  violence_details?: string;
  previous_diagnoses?: boolean;
  previous_diagnoses_details?: string;
}

interface MentalHealthHistoryProps {
  data: MentalHealthHistoryData;
  onUpdate: (data: Partial<MentalHealthHistoryData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSaveProgress?: () => void;
}

const MentalHealthHistory: React.FC<MentalHealthHistoryProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  onSaveProgress
}) => {
  const [formData, setFormData] = useState<MentalHealthHistoryData>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update local state when data prop changes (for auto-fill)
  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleInputChange = (field: keyof MentalHealthHistoryData, value: string | number | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check for required safety questions
    if (formData.current_self_harm_thoughts === undefined) {
      newErrors.current_self_harm_thoughts = 'Please answer this safety question';
    }

    if (formData.suicide_attempt_history === undefined) {
      newErrors.suicide_attempt_history = 'Please answer this safety question';
    }

    if (formData.violence_history === undefined) {
      newErrors.violence_history = 'Please answer this safety question';
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

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Mental Health & Treatment History</h2>
        <p className="section-description">
          This section helps us understand your mental health background and any previous treatment experiences.
        </p>
      </div>

      <div className="warning-box">
        <h4>Important Information</h4>
        <p>
          Some questions in this section relate to safety. Please answer honestly - this information 
          helps us provide the best care and ensure your wellbeing.
        </p>
      </div>

      <div className="form-content">
        {/* Prior Counselling */}
        <div className="form-group">
          <label>
            Have you ever received counseling, therapy, or psychiatric treatment before?
            <span className="optional">(Optional)</span>
          </label>
          <div className="radio-group">
            <div 
              className={`radio-item ${formData.prior_counselling === true ? 'checked' : ''}`}
              onClick={() => handleInputChange('prior_counselling', true)}
            >
              <input
                type="radio"
                id="prior_counselling_yes"
                name="prior_counselling"
                checked={formData.prior_counselling === true}
                onChange={() => handleInputChange('prior_counselling', true)}
              />
              <label htmlFor="prior_counselling_yes">Yes</label>
            </div>
            <div 
              className={`radio-item ${formData.prior_counselling === false ? 'checked' : ''}`}
              onClick={() => handleInputChange('prior_counselling', false)}
            >
              <input
                type="radio"
                id="prior_counselling_no"
                name="prior_counselling"
                checked={formData.prior_counselling === false}
                onChange={() => handleInputChange('prior_counselling', false)}
              />
              <label htmlFor="prior_counselling_no">No</label>
            </div>
          </div>
        </div>

        {formData.prior_counselling === true && (
          <>
            <div className="form-group">
              <label htmlFor="prior_counselling_helpful">
                How helpful was your previous therapy/counseling experience?
              </label>
              <div className="scale-input">
                <span>Not helpful</span>
                <input
                  type="range"
                  id="prior_counselling_helpful"
                  min="1"
                  max="5"
                  value={formData.prior_counselling_helpful || 3}
                  onChange={(e) => handleInputChange('prior_counselling_helpful', parseInt(e.target.value))}
                />
                <span>Very helpful</span>
                <div className="scale-value">{formData.prior_counselling_helpful || 3}</div>
              </div>
              <div className="scale-labels">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prior_counselling_details">
                Please provide details about your previous therapy experience
              </label>
              <textarea
                id="prior_counselling_details"
                value={formData.prior_counselling_details || ''}
                onChange={(e) => handleInputChange('prior_counselling_details', e.target.value)}
                placeholder="When was it? What type of therapy? What worked well or didn't work? Any diagnoses given?"
                rows={4}
              />
            </div>
          </>
        )}

        {/* Psychiatric Hospitalization */}
        <div className="form-group">
          <label>
            Have you ever been hospitalized for psychiatric reasons?
            <span className="optional">(Optional)</span>
          </label>
          <div className="radio-group">
            <div 
              className={`radio-item ${formData.psychiatric_hospitalization === true ? 'checked' : ''}`}
              onClick={() => handleInputChange('psychiatric_hospitalization', true)}
            >
              <input
                type="radio"
                id="psychiatric_hospitalization_yes"
                name="psychiatric_hospitalization"
                checked={formData.psychiatric_hospitalization === true}
                onChange={() => handleInputChange('psychiatric_hospitalization', true)}
              />
              <label htmlFor="psychiatric_hospitalization_yes">Yes</label>
            </div>
            <div 
              className={`radio-item ${formData.psychiatric_hospitalization === false ? 'checked' : ''}`}
              onClick={() => handleInputChange('psychiatric_hospitalization', false)}
            >
              <input
                type="radio"
                id="psychiatric_hospitalization_no"
                name="psychiatric_hospitalization"
                checked={formData.psychiatric_hospitalization === false}
                onChange={() => handleInputChange('psychiatric_hospitalization', false)}
              />
              <label htmlFor="psychiatric_hospitalization_no">No</label>
            </div>
          </div>
        </div>

        {formData.psychiatric_hospitalization === true && (
          <div className="form-group">
            <label htmlFor="psychiatric_hospitalization_details">
              Please provide details about your hospitalization(s)
            </label>
            <textarea
              id="psychiatric_hospitalization_details"
              value={formData.psychiatric_hospitalization_details || ''}
              onChange={(e) => handleInputChange('psychiatric_hospitalization_details', e.target.value)}
              placeholder="When? How long? Reason for hospitalization?"
              rows={3}
            />
          </div>
        )}

        {/* Previous Diagnoses */}
        <div className="form-group">
          <label>
            Have you ever been diagnosed with a mental health condition?
            <span className="optional">(Optional)</span>
          </label>
          <div className="radio-group">
            <div 
              className={`radio-item ${formData.previous_diagnoses === true ? 'checked' : ''}`}
              onClick={() => handleInputChange('previous_diagnoses', true)}
            >
              <input
                type="radio"
                id="previous_diagnoses_yes"
                name="previous_diagnoses"
                checked={formData.previous_diagnoses === true}
                onChange={() => handleInputChange('previous_diagnoses', true)}
              />
              <label htmlFor="previous_diagnoses_yes">Yes</label>
            </div>
            <div 
              className={`radio-item ${formData.previous_diagnoses === false ? 'checked' : ''}`}
              onClick={() => handleInputChange('previous_diagnoses', false)}
            >
              <input
                type="radio"
                id="previous_diagnoses_no"
                name="previous_diagnoses"
                checked={formData.previous_diagnoses === false}
                onChange={() => handleInputChange('previous_diagnoses', false)}
              />
              <label htmlFor="previous_diagnoses_no">No</label>
            </div>
          </div>
        </div>

        {formData.previous_diagnoses === true && (
          <div className="form-group">
            <label htmlFor="previous_diagnoses_details">
              What diagnoses have you received?
            </label>
            <textarea
              id="previous_diagnoses_details"
              value={formData.previous_diagnoses_details || ''}
              onChange={(e) => handleInputChange('previous_diagnoses_details', e.target.value)}
              placeholder="List any mental health diagnoses you've received, when they were given, and by whom"
              rows={3}
            />
          </div>
        )}

        {/* Safety Questions */}
        <div className="warning-box sensitive">
          <h4>Safety Assessment</h4>
          <p>
            The following questions help us ensure your safety and provide appropriate care. 
            Please answer honestly - this information is confidential and helps us help you.
          </p>
        </div>

        <div className="form-group">
          <label className="required">
            Are you currently having thoughts of harming yourself?
          </label>
          <div className="radio-group">
            <div 
              className={`radio-item ${formData.current_self_harm_thoughts === true ? 'checked' : ''}`}
              onClick={() => handleInputChange('current_self_harm_thoughts', true)}
            >
              <input
                type="radio"
                id="current_self_harm_thoughts_yes"
                name="current_self_harm_thoughts"
                checked={formData.current_self_harm_thoughts === true}
                onChange={() => handleInputChange('current_self_harm_thoughts', true)}
              />
              <label htmlFor="current_self_harm_thoughts_yes">Yes</label>
            </div>
            <div 
              className={`radio-item ${formData.current_self_harm_thoughts === false ? 'checked' : ''}`}
              onClick={() => handleInputChange('current_self_harm_thoughts', false)}
            >
              <input
                type="radio"
                id="current_self_harm_thoughts_no"
                name="current_self_harm_thoughts"
                checked={formData.current_self_harm_thoughts === false}
                onChange={() => handleInputChange('current_self_harm_thoughts', false)}
              />
              <label htmlFor="current_self_harm_thoughts_no">No</label>
            </div>
          </div>
          {errors.current_self_harm_thoughts && <span className="error-text">{errors.current_self_harm_thoughts}</span>}
        </div>

        {formData.current_self_harm_thoughts === true && (
          <div className="form-group">
            <div className="warning-box sensitive">
              <h4>Immediate Support</h4>
              <p>
                If you're in immediate danger, please call 911 or go to your nearest emergency room.
                Crisis hotlines: 988 (Suicide & Crisis Lifeline) or text "HELLO" to 741741
              </p>
            </div>
            <label htmlFor="current_self_harm_details">
              Please describe these thoughts (optional, but helpful for us to understand)
            </label>
            <textarea
              id="current_self_harm_details"
              value={formData.current_self_harm_details || ''}
              onChange={(e) => handleInputChange('current_self_harm_details', e.target.value)}
              placeholder="You can share as much or as little as you're comfortable with"
              rows={3}
            />
          </div>
        )}

        <div className="form-group">
          <label className="required">
            Have you ever attempted suicide?
          </label>
          <div className="radio-group">
            <div 
              className={`radio-item ${formData.suicide_attempt_history === true ? 'checked' : ''}`}
              onClick={() => handleInputChange('suicide_attempt_history', true)}
            >
              <input
                type="radio"
                id="suicide_attempt_history_yes"
                name="suicide_attempt_history"
                checked={formData.suicide_attempt_history === true}
                onChange={() => handleInputChange('suicide_attempt_history', true)}
              />
              <label htmlFor="suicide_attempt_history_yes">Yes</label>
            </div>
            <div 
              className={`radio-item ${formData.suicide_attempt_history === false ? 'checked' : ''}`}
              onClick={() => handleInputChange('suicide_attempt_history', false)}
            >
              <input
                type="radio"
                id="suicide_attempt_history_no"
                name="suicide_attempt_history"
                checked={formData.suicide_attempt_history === false}
                onChange={() => handleInputChange('suicide_attempt_history', false)}
              />
              <label htmlFor="suicide_attempt_history_no">No</label>
            </div>
          </div>
          {errors.suicide_attempt_history && <span className="error-text">{errors.suicide_attempt_history}</span>}
        </div>

        {formData.suicide_attempt_history === true && (
          <div className="form-group">
            <label htmlFor="suicide_attempt_details">
              Please provide details if you're comfortable sharing
            </label>
            <textarea
              id="suicide_attempt_details"
              value={formData.suicide_attempt_details || ''}
              onChange={(e) => handleInputChange('suicide_attempt_details', e.target.value)}
              placeholder="When? What happened? Did you receive treatment? (Share only what feels safe)"
              rows={3}
            />
          </div>
        )}

        <div className="form-group">
          <label className="required">
            Have you ever been violent toward others or have concerns about being violent?
          </label>
          <div className="radio-group">
            <div 
              className={`radio-item ${formData.violence_history === true ? 'checked' : ''}`}
              onClick={() => handleInputChange('violence_history', true)}
            >
              <input
                type="radio"
                id="violence_history_yes"
                name="violence_history"
                checked={formData.violence_history === true}
                onChange={() => handleInputChange('violence_history', true)}
              />
              <label htmlFor="violence_history_yes">Yes</label>
            </div>
            <div 
              className={`radio-item ${formData.violence_history === false ? 'checked' : ''}`}
              onClick={() => handleInputChange('violence_history', false)}
            >
              <input
                type="radio"
                id="violence_history_no"
                name="violence_history"
                checked={formData.violence_history === false}
                onChange={() => handleInputChange('violence_history', false)}
              />
              <label htmlFor="violence_history_no">No</label>
            </div>
          </div>
          {errors.violence_history && <span className="error-text">{errors.violence_history}</span>}
        </div>

        {formData.violence_history === true && (
          <div className="form-group">
            <label htmlFor="violence_details">
              Please provide details
            </label>
            <textarea
              id="violence_details"
              value={formData.violence_details || ''}
              onChange={(e) => handleInputChange('violence_details', e.target.value)}
              placeholder="Please describe the circumstances and any treatment received"
              rows={3}
            />
          </div>
        )}
      </div>

      <div className="section-navigation">
        <button 
          type="button" 
          className="nav-button secondary"
          onClick={onPrevious}
        >
          Previous: Presenting Concerns
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
            Next: Current Symptoms
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthHistory; 