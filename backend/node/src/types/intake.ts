// TypeScript interfaces for Client Intake Form system
// These interfaces match the database schema and form structure

export interface ClientIntakeForm {
  id: number;
  user_id: number;
  
  // Section 1: Client Identification
  full_name?: string;
  preferred_name?: string;
  pronouns?: string;
  date_of_birth?: Date;
  gender_identity?: GenderIdentity;
  gender_self_describe?: string;
  marital_status?: string;
  occupation_school?: string;
  primary_language?: string;
  religion_spirituality?: string;
  
  // Section 2: Presenting Concerns
  main_issues?: string;
  concern_duration?: ConcernDuration;
  current_severity?: SeverityLevel;
  therapy_goals?: string[];
  
  // Section 3: Mental Health & Treatment History
  prior_counselling?: boolean;
  prior_counselling_helpful?: number; // 1-5 scale
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
  current_symptoms?: CurrentSymptom[];
  current_symptoms_other?: string;
  
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
  family_mental_health?: YesNoUnknown;
  family_mental_health_details?: string;
  family_substance_abuse?: YesNoUnknown;
  family_substance_abuse_details?: string;
  
  // Section 7: Substance Use
  substance_use?: SubstanceUseData;
  
  // Section 8: Psychosocial Snapshot
  living_situation?: LivingSituation;
  living_situation_other?: string;
  relationship_quality?: RelationshipQuality;
  adequate_social_support?: YesNoUnsure;
  in_romantic_relationship?: boolean;
  romantic_relationship_duration?: string;
  romantic_relationship_quality?: RelationshipQuality;
  family_structure_support?: string;
  social_network_friendships?: string;
  work_school_stress?: string;
  sleep_details?: string;
  exercise_hobbies?: string;
  
  // Section 9: Trauma History
  experienced_trauma?: TraumaResponse;
  trauma_types?: TraumaType[];
  trauma_ages?: string;
  trauma_details?: string;
  
  // Section 10: Therapy Preferences
  preferred_therapy_approach?: string;
  
  // Administrative fields
  completed_at?: Date;
  is_complete: boolean;
  section_progress: SectionProgress;
  created_at: Date;
  updated_at: Date;
}

export interface CreateIntakeFormRequest {
  // Section 1: Client Identification
  full_name?: string;
  preferred_name?: string;
  pronouns?: string;
  date_of_birth?: string; // Will be converted to Date
  gender_identity?: GenderIdentity;
  gender_self_describe?: string;
  marital_status?: string;
  occupation_school?: string;
  primary_language?: string;
  religion_spirituality?: string;
  
  // Section 2: Presenting Concerns
  main_issues?: string;
  concern_duration?: ConcernDuration;
  current_severity?: SeverityLevel;
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
  current_symptoms?: CurrentSymptom[];
  current_symptoms_other?: string;
  
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
  family_mental_health?: YesNoUnknown;
  family_mental_health_details?: string;
  family_substance_abuse?: YesNoUnknown;
  family_substance_abuse_details?: string;
  
  // Section 7: Substance Use
  substance_use?: SubstanceUseData;
  
  // Section 8: Psychosocial Snapshot
  living_situation?: LivingSituation;
  living_situation_other?: string;
  relationship_quality?: RelationshipQuality;
  adequate_social_support?: YesNoUnsure;
  in_romantic_relationship?: boolean;
  romantic_relationship_duration?: string;
  romantic_relationship_quality?: RelationshipQuality;
  family_structure_support?: string;
  social_network_friendships?: string;
  work_school_stress?: string;
  sleep_details?: string;
  exercise_hobbies?: string;
  
  // Section 9: Trauma History
  experienced_trauma?: TraumaResponse;
  trauma_types?: TraumaType[];
  trauma_ages?: string;
  trauma_details?: string;
  
  // Section 10: Therapy Preferences
  preferred_therapy_approach?: string;
}

export interface UpdateIntakeFormRequest extends Partial<CreateIntakeFormRequest> {
  section_name?: string; // Which section is being updated
}

// Enums and type definitions
export type GenderIdentity = 'Female' | 'Male' | 'Non-binary' | 'Self-describe';

export type ConcernDuration = '<1 month' | '1-6 months' | '6-12 months' | '>1 year';

export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe' | 'Crisis';

export type YesNoUnknown = 'Yes' | 'No' | 'Unknown';

export type YesNoUnsure = 'Yes' | 'No' | 'Unsure';

export type TraumaResponse = 'Yes' | 'No' | 'Prefer not to answer';

export type LivingSituation = 'Alone' | 'With spouse/partner' | 'With family' | 'With roommates' | 'Other';

export type RelationshipQuality = 'Very satisfied' | 'Satisfied' | 'Neutral' | 'Unsatisfied' | 'Very unsatisfied';

export type CurrentSymptom = 
  | 'Sadness/Depression'
  | 'Anxiety/Worry'
  | 'Panic Attacks'
  | 'Mood Swings'
  | 'Anger/Irritability'
  | 'Sleep Problems'
  | 'Appetite Changes'
  | 'Concentration Issues'
  | 'Memory Problems'
  | 'Fatigue'
  | 'Social Withdrawal'
  | 'Relationship Problems'
  | 'Work/School Problems'
  | 'Substance Use'
  | 'Eating Issues'
  | 'Trauma/PTSD'
  | 'Obsessive Thoughts'
  | 'Compulsive Behaviors'
  | 'Hallucinations'
  | 'Suicidal Thoughts'
  | 'Self-Harm'
  | 'Other';

export type TraumaType = 
  | 'Physical abuse'
  | 'Sexual abuse'
  | 'Emotional abuse'
  | 'Neglect'
  | 'Domestic violence'
  | 'Combat trauma'
  | 'Accident'
  | 'Natural disaster'
  | 'Loss of loved one'
  | 'Medical trauma'
  | 'Bullying'
  | 'Discrimination'
  | 'Other';

export interface SubstanceUseData {
  alcohol: SubstanceUseItem;
  nicotine: SubstanceUseItem;
  cannabis: SubstanceUseItem;
  prescription_misuse: SubstanceUseItem;
  other: SubstanceUseItem;
}

export interface SubstanceUseItem {
  status: 'never' | 'past' | 'current';
  details: string;
}

export interface SectionProgress {
  client_identification: boolean;
  presenting_concerns: boolean;
  mental_health_history: boolean;
  current_symptoms: boolean;
  medical_history: boolean;
  family_history: boolean;
  substance_use: boolean;
  psychosocial_snapshot: boolean;
  trauma_history: boolean;
  therapy_preferences: boolean;
  [key: string]: boolean; // Index signature to allow string key access
}

// Screening Modules
export interface ScreeningModule {
  id: number;
  intake_form_id: number;
  user_id: number;
  module_type: ScreeningModuleType;
  responses: { [key: string]: any };
  score?: number;
  severity_level?: string;
  completed_at: Date;
  created_at: Date;
}

export type ScreeningModuleType = 
  | 'PHQ-9'        // Depression severity
  | 'GAD-7'        // Generalized anxiety
  | 'PC-PTSD-5'    // Post-traumatic stress
  | 'AUDIT-C'      // Alcohol use patterns
  | 'DAST-10'      // Drug use screening
  | 'C-SSRS'       // Suicidality risk
  | 'ASRS-v1.1'    // Adult ADHD traits
  | 'MDQ'          // Bipolar spectrum indicators
  | 'ISI'          // Insomnia severity
  | 'SCOFF'        // Eating-disorder risk
  | 'OCI-R'        // Obsessive-compulsive symptoms
  | 'K10'          // Overall psychological distress
  | 'WHODAS-2.0'   // Functional impairment snapshot
  | 'DASS-21'      // Depression, anxiety & stress profile
  | 'NODS-CLiP';   // Gambling behaviour screen

export interface CreateScreeningModuleRequest {
  module_type: ScreeningModuleType;
  responses: { [key: string]: any };
}

export interface ScreeningModuleResponse {
  module: ScreeningModule;
  interpretation: string;
  recommendations: string[];
}

// API Response types
export interface IntakeFormResponse {
  intake_form: ClientIntakeForm;
  completion_percentage: number;
  recommended_modules: ScreeningModuleType[];
}

export interface IntakeFormListResponse {
  intake_forms: ClientIntakeForm[];
  total: number;
  page: number;
  limit: number;
}

export interface IntakeFormProgress {
  user_id: number;
  completion_percentage: number;
  completed_sections: string[];
  pending_sections: string[];
  recommended_modules: ScreeningModuleType[];
}

// Validation schemas (for use with validation libraries)
export interface IntakeFormValidation {
  section: string;
  field: string;
  message: string;
  required: boolean;
}

export interface IntakeFormSection {
  id: string;
  title: string;
  description: string;
  fields: IntakeFormField[];
  required: boolean;
}

export interface IntakeFormField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  label: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  sensitive?: boolean; // For trauma/sensitive content
  conditional?: {
    dependsOn: string;
    value: any;
  };
} 