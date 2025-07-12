import React, { useState } from 'react';

interface TraumaHistoryProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSaveProgress?: () => void;
}

const TraumaHistory: React.FC<TraumaHistoryProps> = ({ data, onUpdate, onNext, onPrevious, onSaveProgress }) => {
  const [formData, setFormData] = useState(data);

  const handleNext = () => {
    onUpdate(formData);
    onNext();
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Trauma History</h2>
        <p className="section-description">Information about traumatic experiences (optional and confidential).</p>
      </div>
      <div className="form-content">
        <div className="warning-box sensitive">
          <h4>Sensitive Content</h4>
          <p>This section asks about potentially difficult experiences. You can skip any questions that feel too difficult to answer right now.</p>
        </div>
        <div className="info-box">
          <p>This section is under development. Click Next to continue.</p>
        </div>
      </div>
      <div className="section-navigation">
        <button type="button" className="nav-button secondary" onClick={onPrevious}>
          Previous: Psychosocial
        </button>
        <div className="nav-buttons-right">
          <button type="button" className="nav-button secondary" onClick={() => onSaveProgress ? onSaveProgress() : onUpdate(formData)}>
            Save & Continue Later
          </button>
          <button type="button" className="nav-button primary" onClick={handleNext}>
            Next: Therapy Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default TraumaHistory; 