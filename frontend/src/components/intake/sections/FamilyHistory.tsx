import React, { useState } from 'react';
import '../SectionStyles.css';

interface FamilyHistoryData {
  family_mental_health?: string;
  family_mental_health_details?: string;
  family_substance_abuse?: string;
  family_substance_abuse_details?: string;
}

interface FamilyHistoryProps {
  data: FamilyHistoryData;
  onUpdate: (data: Partial<FamilyHistoryData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSaveProgress?: () => void;
}

const FamilyHistory: React.FC<FamilyHistoryProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  onSaveProgress
}) => {
  const [formData, setFormData] = useState<FamilyHistoryData>(data);

  const handleInputChange = (field: keyof FamilyHistoryData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
  };

  const handleNext = () => {
    onUpdate(formData);
    onNext();
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
        <h2>Family History</h2>
        <p className="section-description">
          Information about your family's mental health and substance use history.
        </p>
      </div>

      <div className="form-content">
        <div className="form-group">
          <label>
            Is there a history of mental health issues in your family?
            <span className="optional">(Optional)</span>
          </label>
          <div className="radio-group">
            <div 
              className={`radio-item ${formData.family_mental_health === 'Yes' ? 'checked' : ''}`}
              onClick={() => handleInputChange('family_mental_health', 'Yes')}
            >
              <input
                type="radio"
                checked={formData.family_mental_health === 'Yes'}
                onChange={() => handleInputChange('family_mental_health', 'Yes')}
              />
              <label>Yes</label>
            </div>
            <div 
              className={`radio-item ${formData.family_mental_health === 'No' ? 'checked' : ''}`}
              onClick={() => handleInputChange('family_mental_health', 'No')}
            >
              <input
                type="radio"
                checked={formData.family_mental_health === 'No'}
                onChange={() => handleInputChange('family_mental_health', 'No')}
              />
              <label>No</label>
            </div>
            <div 
              className={`radio-item ${formData.family_mental_health === 'Unknown' ? 'checked' : ''}`}
              onClick={() => handleInputChange('family_mental_health', 'Unknown')}
            >
              <input
                type="radio"
                checked={formData.family_mental_health === 'Unknown'}
                onChange={() => handleInputChange('family_mental_health', 'Unknown')}
              />
              <label>Unknown</label>
            </div>
          </div>
        </div>

        {formData.family_mental_health === 'Yes' && (
          <div className="form-group">
            <label htmlFor="family_mental_health_details">
              Please provide details
            </label>
            <textarea
              id="family_mental_health_details"
              value={formData.family_mental_health_details || ''}
              onChange={(e) => handleInputChange('family_mental_health_details', e.target.value)}
              placeholder="Which family members? What conditions? Any treatments?"
              rows={3}
            />
          </div>
        )}

        <div className="form-group">
          <label>
            Is there a history of substance abuse in your family?
            <span className="optional">(Optional)</span>
          </label>
          <div className="radio-group">
            <div 
              className={`radio-item ${formData.family_substance_abuse === 'Yes' ? 'checked' : ''}`}
              onClick={() => handleInputChange('family_substance_abuse', 'Yes')}
            >
              <input
                type="radio"
                checked={formData.family_substance_abuse === 'Yes'}
                onChange={() => handleInputChange('family_substance_abuse', 'Yes')}
              />
              <label>Yes</label>
            </div>
            <div 
              className={`radio-item ${formData.family_substance_abuse === 'No' ? 'checked' : ''}`}
              onClick={() => handleInputChange('family_substance_abuse', 'No')}
            >
              <input
                type="radio"
                checked={formData.family_substance_abuse === 'No'}
                onChange={() => handleInputChange('family_substance_abuse', 'No')}
              />
              <label>No</label>
            </div>
            <div 
              className={`radio-item ${formData.family_substance_abuse === 'Unknown' ? 'checked' : ''}`}
              onClick={() => handleInputChange('family_substance_abuse', 'Unknown')}
            >
              <input
                type="radio"
                checked={formData.family_substance_abuse === 'Unknown'}
                onChange={() => handleInputChange('family_substance_abuse', 'Unknown')}
              />
              <label>Unknown</label>
            </div>
          </div>
        </div>

        {formData.family_substance_abuse === 'Yes' && (
          <div className="form-group">
            <label htmlFor="family_substance_abuse_details">
              Please provide details
            </label>
            <textarea
              id="family_substance_abuse_details"
              value={formData.family_substance_abuse_details || ''}
              onChange={(e) => handleInputChange('family_substance_abuse_details', e.target.value)}
              placeholder="Which family members? What substances? Any treatment history?"
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
          Previous: Medical History
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
            Next: Substance Use
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyHistory; 