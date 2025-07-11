import React, { useState } from 'react';
import '../SectionStyles.css';

interface ClientIdentificationData {
  full_name?: string;
  preferred_name?: string;
  pronouns?: string;
  date_of_birth?: string;
  gender_identity?: string;
  gender_self_describe?: string;
  marital_status?: string;
  occupation_school?: string;
  primary_language?: string;
  religion_spirituality?: string;
}

interface ClientIdentificationProps {
  data: ClientIdentificationData;
  onUpdate: (data: Partial<ClientIdentificationData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
  onSaveProgress?: () => void;
}

const GENDER_OPTIONS = [
  'Female',
  'Male',
  'Non-binary',
  'Transgender female',
  'Transgender male',
  'Genderfluid',
  'Agender',
  'Self-describe',
  'Prefer not to answer'
];

const MARITAL_STATUS_OPTIONS = [
  'Single',
  'In a relationship',
  'Married',
  'Common-law/Civil union',
  'Separated',
  'Divorced',
  'Widowed',
  'Prefer not to answer'
];

const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'Mandarin',
  'Arabic',
  'Hindi',
  'Portuguese',
  'Russian',
  'Japanese',
  'German',
  'Other'
];

const ClientIdentification: React.FC<ClientIdentificationProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  onSaveProgress
}) => {
  const [formData, setFormData] = useState<ClientIdentificationData>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ClientIdentificationData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18 || age > 120) {
        newErrors.date_of_birth = 'Please enter a valid date of birth (must be 18+ years old)';
      }
    }

    if (!formData.gender_identity) {
      newErrors.gender_identity = 'Gender identity selection is required';
    }

    if (formData.gender_identity === 'Self-describe' && !formData.gender_self_describe?.trim()) {
      newErrors.gender_self_describe = 'Please describe your gender identity';
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
    // Save current data even if validation fails
    if (onSaveProgress) {
      onSaveProgress();
    } else {
      onUpdate(formData);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Client Identification</h2>
        <p className="section-description">
          Please provide your basic personal information. This helps us create your profile and personalize your care.
        </p>
      </div>

      <div className="form-content">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="full_name" className="required">
              Full Legal Name
            </label>
            <input
              type="text"
              id="full_name"
              value={formData.full_name || ''}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full legal name"
              className={errors.full_name ? 'error' : ''}
            />
            {errors.full_name && <span className="error-text">{errors.full_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="preferred_name">
              Preferred Name
              <span className="optional">(Optional)</span>
            </label>
            <input
              type="text"
              id="preferred_name"
              value={formData.preferred_name || ''}
              onChange={(e) => handleInputChange('preferred_name', e.target.value)}
              placeholder="Name you'd like us to use"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pronouns">
              Pronouns
              <span className="optional">(Optional)</span>
            </label>
            <input
              type="text"
              id="pronouns"
              value={formData.pronouns || ''}
              onChange={(e) => handleInputChange('pronouns', e.target.value)}
              placeholder="e.g., she/her, he/him, they/them"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_of_birth" className="required">
              Date of Birth
            </label>
            <input
              type="date"
              id="date_of_birth"
              value={formData.date_of_birth || ''}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              className={errors.date_of_birth ? 'error' : ''}
            />
            {errors.date_of_birth && <span className="error-text">{errors.date_of_birth}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="gender_identity" className="required">
            Gender Identity
          </label>
          <select
            id="gender_identity"
            value={formData.gender_identity || ''}
            onChange={(e) => handleInputChange('gender_identity', e.target.value)}
            className={errors.gender_identity ? 'error' : ''}
          >
            <option value="">Select your gender identity</option>
            {GENDER_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.gender_identity && <span className="error-text">{errors.gender_identity}</span>}
        </div>

        {formData.gender_identity === 'Self-describe' && (
          <div className="form-group">
            <label htmlFor="gender_self_describe" className="required">
              Please describe your gender identity
            </label>
            <input
              type="text"
              id="gender_self_describe"
              value={formData.gender_self_describe || ''}
              onChange={(e) => handleInputChange('gender_self_describe', e.target.value)}
              placeholder="Describe your gender identity"
              className={errors.gender_self_describe ? 'error' : ''}
            />
            {errors.gender_self_describe && <span className="error-text">{errors.gender_self_describe}</span>}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="marital_status">
              Marital Status
              <span className="optional">(Optional)</span>
            </label>
            <select
              id="marital_status"
              value={formData.marital_status || ''}
              onChange={(e) => handleInputChange('marital_status', e.target.value)}
            >
              <option value="">Select marital status</option>
              {MARITAL_STATUS_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="primary_language">
              Primary Language
              <span className="optional">(Optional)</span>
            </label>
            <select
              id="primary_language"
              value={formData.primary_language || ''}
              onChange={(e) => handleInputChange('primary_language', e.target.value)}
            >
              <option value="">Select primary language</option>
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="occupation_school">
            Occupation/School
            <span className="optional">(Optional)</span>
          </label>
          <input
            type="text"
            id="occupation_school"
            value={formData.occupation_school || ''}
            onChange={(e) => handleInputChange('occupation_school', e.target.value)}
            placeholder="Your current job, school, or main activity"
          />
        </div>

        <div className="form-group">
          <label htmlFor="religion_spirituality">
            Religion/Spirituality
            <span className="optional">(Optional)</span>
          </label>
          <input
            type="text"
            id="religion_spirituality"
            value={formData.religion_spirituality || ''}
            onChange={(e) => handleInputChange('religion_spirituality', e.target.value)}
            placeholder="Your religious or spiritual beliefs, if any"
          />
          <small className="help-text">
            This helps us understand your cultural background and values.
          </small>
        </div>
      </div>

      <div className="section-navigation">
        {onPrevious && (
          <button 
            type="button" 
            className="nav-button secondary"
            onClick={onPrevious}
          >
            Previous
          </button>
        )}
        
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
            Next: Presenting Concerns
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientIdentification; 