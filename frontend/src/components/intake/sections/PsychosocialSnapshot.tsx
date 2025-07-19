import React, { useState, useEffect } from 'react';

interface PsychosocialSnapshotProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSaveProgress?: () => void;
}

const PsychosocialSnapshot: React.FC<PsychosocialSnapshotProps> = ({ data, onUpdate, onNext, onPrevious, onSaveProgress }) => {
  const [formData, setFormData] = useState(data);

  // Update local state when data prop changes (for auto-fill)
  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleNext = () => {
    onUpdate(formData);
    onNext();
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Psychosocial Snapshot</h2>
        <p className="section-description">Information about your social support and life situation.</p>
      </div>
      <div className="form-content">
        <div className="info-box">
          <p>This section is under development. Click Next to continue.</p>
        </div>
      </div>
      <div className="section-navigation">
        <button type="button" className="nav-button secondary" onClick={onPrevious}>
          Previous: Substance Use
        </button>
        <div className="nav-buttons-right">
          <button type="button" className="nav-button secondary" onClick={() => onSaveProgress ? onSaveProgress() : onUpdate(formData)}>
            Save & Continue Later
          </button>
          <button type="button" className="nav-button primary" onClick={handleNext}>
            Next: Trauma History
          </button>
        </div>
      </div>
    </div>
  );
};

export default PsychosocialSnapshot; 