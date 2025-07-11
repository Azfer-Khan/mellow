import React, { useState } from 'react';

interface SubstanceUseProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSaveProgress?: () => void;
}

const SubstanceUse: React.FC<SubstanceUseProps> = ({ data, onUpdate, onNext, onPrevious, onSaveProgress }) => {
  const [formData, setFormData] = useState(data);

  const handleNext = () => {
    onUpdate(formData);
    onNext();
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Substance Use</h2>
        <p className="section-description">Information about current and past substance use.</p>
      </div>
      <div className="form-content">
        <div className="info-box">
          <p>This section is under development. Click Next to continue.</p>
        </div>
      </div>
      <div className="section-navigation">
        <button type="button" className="nav-button secondary" onClick={onPrevious}>
          Previous: Family History
        </button>
        <div className="nav-buttons-right">
          <button type="button" className="nav-button secondary" onClick={() => onSaveProgress ? onSaveProgress() : onUpdate(formData)}>
            Save & Continue Later
          </button>
          <button type="button" className="nav-button primary" onClick={handleNext}>
            Next: Psychosocial
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubstanceUse; 