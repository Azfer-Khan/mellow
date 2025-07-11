import React, { useState } from 'react';
import '../SectionStyles.css';

interface MedicalHistoryData {
  chronic_pain_illness?: boolean;
  chronic_pain_details?: string;
  current_medications?: string;
  allergies?: boolean;
  allergies_details?: string;
}

interface MedicalHistoryProps {
  data: MedicalHistoryData;
  onUpdate: (data: Partial<MedicalHistoryData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const [formData, setFormData] = useState<MedicalHistoryData>(data);

  const handleInputChange = (field: keyof MedicalHistoryData, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
  };

  const handleNext = () => {
    onUpdate(formData);
    onNext();
  };

  const handleSaveAndContinue = () => {
    onUpdate(formData);
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Medical History</h2>
        <p className="section-description">
          Please share relevant medical information that might impact your mental health care.
        </p>
      </div>

      <div className="form-content">
        <div className="form-group">
          <label htmlFor="current_medications">
            Current Medications
            <span className="optional">(Optional)</span>
          </label>
          <textarea
            id="current_medications"
            value={formData.current_medications || ''}
            onChange={(e) => handleInputChange('current_medications', e.target.value)}
            placeholder="List any medications you're currently taking, including dosages"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>
            Do you have any chronic medical conditions?
            <span className="optional">(Optional)</span>
          </label>
          <div className="radio-group">
            <div 
              className={`radio-item ${formData.chronic_pain_illness === true ? 'checked' : ''}`}
              onClick={() => handleInputChange('chronic_pain_illness', true)}
            >
              <input
                type="radio"
                checked={formData.chronic_pain_illness === true}
                onChange={() => handleInputChange('chronic_pain_illness', true)}
              />
              <label>Yes</label>
            </div>
            <div 
              className={`radio-item ${formData.chronic_pain_illness === false ? 'checked' : ''}`}
              onClick={() => handleInputChange('chronic_pain_illness', false)}
            >
              <input
                type="radio"
                checked={formData.chronic_pain_illness === false}
                onChange={() => handleInputChange('chronic_pain_illness', false)}
              />
              <label>No</label>
            </div>
          </div>
        </div>

        {formData.chronic_pain_illness === true && (
          <div className="form-group">
            <label htmlFor="chronic_pain_details">
              Please describe your medical conditions
            </label>
            <textarea
              id="chronic_pain_details"
              value={formData.chronic_pain_details || ''}
              onChange={(e) => handleInputChange('chronic_pain_details', e.target.value)}
              placeholder="Describe any chronic conditions, pain, or ongoing health issues"
              rows={3}
            />
          </div>
        )}

        <div className="form-group">
          <label>
            Do you have any allergies?
            <span className="optional">(Optional)</span>
          </label>
          <div className="radio-group">
            <div 
              className={`radio-item ${formData.allergies === true ? 'checked' : ''}`}
              onClick={() => handleInputChange('allergies', true)}
            >
              <input
                type="radio"
                checked={formData.allergies === true}
                onChange={() => handleInputChange('allergies', true)}
              />
              <label>Yes</label>
            </div>
            <div 
              className={`radio-item ${formData.allergies === false ? 'checked' : ''}`}
              onClick={() => handleInputChange('allergies', false)}
            >
              <input
                type="radio"
                checked={formData.allergies === false}
                onChange={() => handleInputChange('allergies', false)}
              />
              <label>No</label>
            </div>
          </div>
        </div>

        {formData.allergies === true && (
          <div className="form-group">
            <label htmlFor="allergies_details">
              Please list your allergies
            </label>
            <textarea
              id="allergies_details"
              value={formData.allergies_details || ''}
              onChange={(e) => handleInputChange('allergies_details', e.target.value)}
              placeholder="List any drug allergies, food allergies, or other allergic reactions"
              rows={2}
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
          Previous: Current Symptoms
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
            Next: Family History
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory; 