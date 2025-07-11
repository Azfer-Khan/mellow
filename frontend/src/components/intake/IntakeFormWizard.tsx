import React, { useState, useEffect } from 'react';
import ClientIdentification from './sections/ClientIdentification';
import PresentingConcerns from './sections/PresentingConcerns';
import MentalHealthHistory from './sections/MentalHealthHistory';
import CurrentSymptoms from './sections/CurrentSymptoms';
import MedicalHistory from './sections/MedicalHistory';
import FamilyHistory from './sections/FamilyHistory';
import SubstanceUse from './sections/SubstanceUse';
import PsychosocialSnapshot from './sections/PsychosocialSnapshot';
import TraumaHistory from './sections/TraumaHistory';
import TherapyPreferences from './sections/TherapyPreferences';
import ProgressIndicator from './ProgressIndicator';
import './IntakeFormWizard.css';
import config from '../../config';

interface IntakeFormData {
  // Section 1: Client Identification
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

  // Section 2: Presenting Concerns
  main_issues?: string;
  concern_duration?: string;
  current_severity?: string;
  therapy_goals?: string[];

  // Section 3: Mental Health & Treatment History
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

  // Section 4: Current Symptoms
  current_symptoms?: string[];

  // Section 5: Medical History
  chronic_pain_illness?: boolean;
  chronic_pain_details?: string;
  neurological_conditions?: boolean;
  neurological_details?: string;
  allergies?: boolean;
  allergies_details?: string;
  pregnancy_postpartum?: boolean;
  pregnancy_details?: string;
  other_medical_issues?: boolean;
  other_medical_details?: string;
  current_medications?: string;

  // Section 6: Family History
  family_mental_health?: string;
  family_mental_health_details?: string;
  family_substance_abuse?: string;
  family_substance_abuse_details?: string;

  // Section 7: Substance Use
  substance_use?: {
    alcohol?: { current: string; frequency?: string; amount?: string };
    nicotine?: { current: string; type?: string; amount?: string };
    cannabis?: { current: string; frequency?: string; method?: string };
    prescription_misuse?: { current: string; details?: string };
    other_substances?: { current: string; details?: string };
  };

  // Section 8: Psychosocial Snapshot
  living_situation?: string;
  living_situation_other?: string;
  relationship_quality?: string;
  adequate_social_support?: string;
  in_romantic_relationship?: boolean;
  romantic_relationship_duration?: string;
  romantic_relationship_quality?: string;
  family_structure_support?: string;
  social_network_friendships?: string;
  work_school_stress?: string;
  sleep_details?: string;
  exercise_hobbies?: string;

  // Section 9: Trauma History
  experienced_trauma?: string;
  trauma_types?: string[];
  trauma_ages?: string;
  trauma_details?: string;

  // Section 10: Therapy Preferences
  preferred_therapy_approach?: string;
}

interface IntakeFormWizardProps {
  onComplete: () => void;
  onCancel?: () => void;
}

const TOTAL_STEPS = 10;

const STEP_TITLES = [
  'Client Identification',
  'Presenting Concerns',
  'Mental Health History',
  'Current Symptoms',
  'Medical History',
  'Family History',
  'Substance Use',
  'Psychosocial Snapshot',
  'Trauma History',
  'Therapy Preferences'
];

const IntakeFormWizard: React.FC<IntakeFormWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IntakeFormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [intakeId, setIntakeId] = useState<number | null>(null);

  // Initialize intake form on component mount
  useEffect(() => {
    initializeIntakeForm();
  }, []);

  const initializeIntakeForm = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // First, check if user already has an intake form
      const checkResponse = await fetch(`${config.apiUrl}/intake`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (checkResponse.ok) {
        const existingData = await checkResponse.json();
        if (existingData.intake) {
          setFormData(existingData.intake);
          setIntakeId(existingData.intake.id);
          console.log('Found existing intake form:', existingData.intake.id);
          // If form is already complete, redirect
          if (existingData.intake_form.is_complete) {
            onComplete();
            return;
          }
        } else {
          console.error('No intake form in response:', existingData);
          // setError('Invalid response from server');
        }
      } else if (checkResponse.status === 404) {
        // No existing intake form, create a new one
        console.log('No existing intake form found, creating new one...');
        const startResponse = await fetch(`${config.apiUrl}/intake/start`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (startResponse.ok) {
          const newIntake = await startResponse.json();
          setIntakeId(newIntake.intake.id);
          console.log('Created new intake form:', newIntake.intake.id);
        } else {
          const errorData = await startResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to create intake form:', errorData);
          setError(errorData.error || 'Failed to initialize intake form');
        }
      } else {
        const errorData = await checkResponse.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to check intake status:', errorData);
        setError(errorData.error || 'Failed to check intake status');
      }
    } catch (error) {
      console.error('Error initializing intake form:', error);
      setError('Network error. Please try again.');
    }
  };

  const saveProgress = async (updatedData: Partial<IntakeFormData>) => {
    if (!intakeId) {
      console.error('No intake ID available for saving');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`${config.apiUrl}/intake`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error saving progress:', errorData);
        setError(errorData.error || `Failed to save progress (${response.status})`);
        return;
      }

      // Success - clear any previous errors
      setError('');
      console.log('Progress saved successfully');
    } catch (error) {
      console.error('Error saving progress:', error);
      setError('Network error while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = async (stepData: Partial<IntakeFormData>) => {
    console.log('Updating form data:', stepData);
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);
    await saveProgress(stepData);
  };

  const goToNextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setCurrentStep(step);
    }
  };

  const completeIntakeForm = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/intake/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onComplete();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to complete intake form');
      }
    } catch (error) {
      console.error('Error completing intake form:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndExit = async () => {
    console.log('Saving and exiting with current form data:', formData);
    
    try {
      // Save current form data before exiting
      await saveProgress(formData);
      
      // Show success message briefly
      setError('');
      console.log('Progress saved successfully before exit');
      
      // Exit the form
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error saving before exit:', error);
      setError('Failed to save progress. Please try again.');
    }
  };

  const saveCurrentProgress = async () => {
    console.log('Saving current progress with complete form data:', formData);
    await saveProgress(formData);
  };

  const renderCurrentStep = () => {
    const stepProps = {
      data: formData,
      onUpdate: updateFormData,
      onNext: goToNextStep,
      onPrevious: goToPreviousStep,
      onSaveProgress: saveCurrentProgress,
    };

    switch (currentStep) {
      case 1:
        return <ClientIdentification {...stepProps} />;
      case 2:
        return <PresentingConcerns {...stepProps} />;
      case 3:
        return <MentalHealthHistory {...stepProps} />;
      case 4:
        return <CurrentSymptoms {...stepProps} />;
      case 5:
        return <MedicalHistory {...stepProps} />;
      case 6:
        return <FamilyHistory {...stepProps} />;
      case 7:
        return <SubstanceUse {...stepProps} />;
      case 8:
        return <PsychosocialSnapshot {...stepProps} />;
      case 9:
        return <TraumaHistory {...stepProps} />;
      case 10:
        return (
          <TherapyPreferences 
            {...stepProps} 
            onComplete={completeIntakeForm}
            isCompleting={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="intake-form-wizard">
      <div className="wizard-header">
        <h1>Client Intake Form</h1>
        <p className="wizard-subtitle">
          This information helps us provide you with the best possible care. 
          All information is confidential and secure.
        </p>
        {isSaving && <div className="saving-indicator">Saving...</div>}
      </div>

      <ProgressIndicator 
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        stepTitles={STEP_TITLES}
        onStepClick={goToStep}
      />

      {error && <div className="error-message">{error}</div>}

      <div className="wizard-content">
        {renderCurrentStep()}
      </div>

      {onCancel && (
        <div className="wizard-footer">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={handleSaveAndExit}
            disabled={isLoading}
          >
            Save & Exit
          </button>
          <div className="wizard-info">
            <small>Your progress is automatically saved as you go.</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntakeFormWizard; 