import React, { useState } from 'react';
import '../SectionStyles.css';

interface CurrentSymptomsData {
  current_symptoms?: string[];
}

interface CurrentSymptomsProps {
  data: CurrentSymptomsData;
  onUpdate: (data: Partial<CurrentSymptomsData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const SYMPTOM_CATEGORIES = {
  'Mood & Emotional': [
    'Feeling sad or depressed',
    'Feeling hopeless',
    'Mood swings',
    'Feeling numb or empty',
    'Irritability or anger',
    'Feeling overwhelmed',
    'Guilt or shame',
    'Loss of interest in activities'
  ],
  'Anxiety & Stress': [
    'Excessive worry',
    'Panic attacks',
    'Social anxiety',
    'Specific phobias',
    'Feeling restless',
    'Racing thoughts',
    'Feeling on edge',
    'Avoidance behaviors'
  ],
  'Physical Symptoms': [
    'Fatigue or low energy',
    'Sleep difficulties',
    'Changes in appetite',
    'Headaches',
    'Muscle tension',
    'Digestive issues',
    'Heart racing',
    'Shortness of breath'
  ],
  'Cognitive & Concentration': [
    'Difficulty concentrating',
    'Memory problems',
    'Indecisiveness',
    'Racing thoughts',
    'Negative self-talk',
    'Confusion',
    'Difficulty problem-solving',
    'Mind going blank'
  ],
  'Behavioral Changes': [
    'Social withdrawal',
    'Procrastination',
    'Increased substance use',
    'Compulsive behaviors',
    'Changes in activity level',
    'Difficulty completing tasks',
    'Avoiding responsibilities',
    'Risk-taking behaviors'
  ],
  'Trauma-Related': [
    'Flashbacks or intrusive memories',
    'Nightmares',
    'Feeling detached from others',
    'Hypervigilance',
    'Easily startled',
    'Feeling unsafe',
    'Emotional numbness',
    'Avoiding reminders of trauma'
  ]
};

const CurrentSymptoms: React.FC<CurrentSymptomsProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const [formData, setFormData] = useState<CurrentSymptomsData>(data);

  const handleSymptomToggle = (symptom: string, checked: boolean) => {
    const currentSymptoms = formData.current_symptoms || [];
    let newSymptoms: string[];
    
    if (checked) {
      newSymptoms = [...currentSymptoms, symptom];
    } else {
      newSymptoms = currentSymptoms.filter(s => s !== symptom);
    }
    
    const newData = { current_symptoms: newSymptoms };
    setFormData(newData);
  };

  const isSymptomSelected = (symptom: string) => {
    return formData.current_symptoms?.includes(symptom) || false;
  };

  const handleNext = () => {
    onUpdate(formData);
    onNext();
  };

  const handleSaveAndContinue = () => {
    onUpdate(formData);
  };

  const selectedCount = formData.current_symptoms?.length || 0;

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Current Symptoms</h2>
        <p className="section-description">
          Please check all symptoms you're currently experiencing. This helps us understand your present situation.
        </p>
      </div>

      <div className="info-box">
        <p>
          <strong>Selected: {selectedCount} symptoms</strong><br/>
          Don't worry about selecting too many or too few - just check what feels true for you right now.
        </p>
      </div>

      <div className="form-content">
        {Object.entries(SYMPTOM_CATEGORIES).map(([category, symptoms]) => (
          <div key={category} className="symptom-category" style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1.1rem', 
              marginBottom: '15px',
              borderBottom: '2px solid var(--border-color)',
              paddingBottom: '8px'
            }}>
              {category}
            </h3>
            
            <div className="checkbox-group">
              {symptoms.map(symptom => (
                <div 
                  key={symptom} 
                  className={`checkbox-item ${isSymptomSelected(symptom) ? 'checked' : ''}`}
                  onClick={() => handleSymptomToggle(symptom, !isSymptomSelected(symptom))}
                >
                  <input
                    type="checkbox"
                    id={`symptom_${symptom}`}
                    checked={isSymptomSelected(symptom)}
                    onChange={() => handleSymptomToggle(symptom, !isSymptomSelected(symptom))}
                  />
                  <label htmlFor={`symptom_${symptom}`}>
                    {symptom}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        {selectedCount > 0 && (
          <div className="selected-symptoms-summary" style={{ marginTop: '30px' }}>
            <div className="info-box">
              <h4 style={{ margin: '0 0 10px 0' }}>Your Selected Symptoms ({selectedCount}):</h4>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px',
                fontSize: '0.85rem'
              }}>
                {formData.current_symptoms?.map(symptom => (
                  <span 
                    key={symptom}
                    style={{
                      background: 'var(--primary-color)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginTop: '30px' }}>
          <label>
            Additional Information
            <span className="optional">(Optional)</span>
          </label>
          <textarea
            placeholder="Is there anything else about your current symptoms that would be helpful for us to know? Any patterns, triggers, or timing you've noticed?"
            rows={4}
            style={{ width: '100%' }}
          />
          <small className="help-text">
            For example: "My anxiety is worse in the mornings" or "I feel more depressed on weekends"
          </small>
        </div>
      </div>

      <div className="section-navigation">
        <button 
          type="button" 
          className="nav-button secondary"
          onClick={onPrevious}
        >
          Previous: Mental Health History
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
            Next: Medical History
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentSymptoms; 