-- Client Intake Forms Database Schema
-- This script creates tables for storing comprehensive client intake information
-- for the Mellow therapy application

-- Create main client intake forms table
CREATE TABLE IF NOT EXISTS client_intake_forms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Section 1: Client Identification
    full_name VARCHAR(200),
    preferred_name VARCHAR(100),
    pronouns VARCHAR(50),
    date_of_birth DATE,
    gender_identity VARCHAR(50), -- 'Female', 'Male', 'Non-binary', 'Self-describe'
    gender_self_describe VARCHAR(100),
    marital_status VARCHAR(100),
    occupation_school VARCHAR(200),
    primary_language VARCHAR(50),
    religion_spirituality VARCHAR(100),
    
    -- Section 2: Presenting Concerns
    main_issues TEXT,
    concern_duration VARCHAR(20), -- '<1 month', '1-6 months', '6-12 months', '>1 year'
    current_severity VARCHAR(20), -- 'Mild', 'Moderate', 'Severe', 'Crisis'
    therapy_goals TEXT[], -- Array of up to 3 goals
    
    -- Section 3: Mental Health & Treatment History
    prior_counselling BOOLEAN,
    prior_counselling_helpful INTEGER, -- 1-5 scale
    prior_counselling_details TEXT,
    psychiatric_hospitalization BOOLEAN,
    psychiatric_hospitalization_details TEXT,
    current_self_harm_thoughts BOOLEAN,
    current_self_harm_details TEXT,
    suicide_attempt_history BOOLEAN,
    suicide_attempt_details TEXT,
    violence_history BOOLEAN,
    violence_details TEXT,
    previous_diagnoses BOOLEAN,
    previous_diagnoses_details TEXT,
    
    -- Section 4: Current Symptoms (stored as JSON array for checkboxes)
    current_symptoms JSONB DEFAULT '[]'::jsonb,
    current_symptoms_other TEXT, -- For "Other" option details
    
    -- Section 5: Medical History
    chronic_pain_illness BOOLEAN DEFAULT FALSE,
    chronic_pain_details TEXT,
    neurological_conditions BOOLEAN DEFAULT FALSE,
    neurological_details TEXT,
    allergies BOOLEAN DEFAULT FALSE,
    allergies_details TEXT,
    pregnancy_postpartum BOOLEAN DEFAULT FALSE,
    pregnancy_details TEXT,
    other_medical_issues BOOLEAN DEFAULT FALSE,
    other_medical_details TEXT,
    current_medications TEXT,
    
    -- Section 6: Family History
    family_mental_health VARCHAR(20), -- 'Yes', 'No', 'Unknown'
    family_mental_health_details TEXT,
    family_substance_abuse VARCHAR(20), -- 'Yes', 'No', 'Unknown'
    family_substance_abuse_details TEXT,
    
    -- Section 7: Substance Use (stored as JSON for structured data)
    substance_use JSONB DEFAULT '{
        "alcohol": {"status": "never", "details": ""},
        "nicotine": {"status": "never", "details": ""},
        "cannabis": {"status": "never", "details": ""},
        "prescription_misuse": {"status": "never", "details": ""},
        "other": {"status": "never", "details": ""}
    }'::jsonb,
    
    -- Section 8: Psychosocial Snapshot
    living_situation VARCHAR(50), -- 'Alone', 'With spouse/partner', 'With family', 'With roommates', 'Other'
    living_situation_other VARCHAR(200),
    relationship_quality VARCHAR(30), -- 'Very satisfied', 'Satisfied', 'Neutral', 'Unsatisfied', 'Very unsatisfied'
    adequate_social_support VARCHAR(10), -- 'Yes', 'No', 'Unsure'
    in_romantic_relationship BOOLEAN,
    romantic_relationship_duration VARCHAR(100),
    romantic_relationship_quality VARCHAR(30),
    family_structure_support TEXT,
    social_network_friendships TEXT,
    work_school_stress TEXT,
    sleep_details TEXT,
    exercise_hobbies TEXT,
    
    -- Section 9: Trauma History
    experienced_trauma VARCHAR(30), -- 'Yes', 'No', 'Prefer not to answer'
    trauma_types JSONB DEFAULT '[]'::jsonb, -- Array of trauma types
    trauma_ages TEXT,
    trauma_details TEXT,
    
    -- Section 10: Therapy Preferences
    preferred_therapy_approach TEXT,
    
    -- Administrative fields
    completed_at TIMESTAMP WITH TIME ZONE,
    is_complete BOOLEAN DEFAULT FALSE,
    section_progress JSONB DEFAULT '{
        "client_identification": false,
        "presenting_concerns": false,
        "mental_health_history": false,
        "current_symptoms": false,
        "medical_history": false,
        "family_history": false,
        "substance_use": false,
        "psychosocial_snapshot": false,
        "trauma_history": false,
        "therapy_preferences": false
    }'::jsonb, -- Track completion of each section
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_intake_forms_user_id ON client_intake_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_completed ON client_intake_forms(is_complete);
CREATE INDEX IF NOT EXISTS idx_intake_forms_created_at ON client_intake_forms(created_at);

-- Create additional screening modules table
CREATE TABLE IF NOT EXISTS intake_screening_modules (
    id SERIAL PRIMARY KEY,
    intake_form_id INTEGER NOT NULL REFERENCES client_intake_forms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_type VARCHAR(20) NOT NULL, -- 'PHQ-9', 'GAD-7', 'PC-PTSD-5', 'AUDIT-C', etc.
    responses JSONB NOT NULL, -- Store all question responses
    score INTEGER, -- Calculated score for the module
    severity_level VARCHAR(20), -- 'Minimal', 'Mild', 'Moderate', 'Severe', etc.
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one module per type per intake form
    UNIQUE(intake_form_id, module_type)
);

-- Create indexes for screening modules
CREATE INDEX IF NOT EXISTS idx_screening_modules_intake_id ON intake_screening_modules(intake_form_id);
CREATE INDEX IF NOT EXISTS idx_screening_modules_user_id ON intake_screening_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_screening_modules_type ON intake_screening_modules(module_type);

-- Create trigger to update the updated_at column for intake forms
CREATE TRIGGER update_intake_forms_updated_at 
    BEFORE UPDATE ON client_intake_forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate intake form completion percentage
CREATE OR REPLACE FUNCTION calculate_intake_completion_percentage(intake_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total_sections INTEGER := 10;
    completed_sections INTEGER := 0;
    progress_data JSONB;
    key TEXT;
BEGIN
    -- Get the section progress for this intake form
    SELECT section_progress INTO progress_data 
    FROM client_intake_forms 
    WHERE id = intake_id;
    
    -- Count completed sections
    FOR key IN SELECT jsonb_object_keys(progress_data)
    LOOP
        IF (progress_data->>key)::boolean = true THEN
            completed_sections := completed_sections + 1;
        END IF;
    END LOOP;
    
    -- Return percentage
    RETURN ROUND((completed_sections::FLOAT / total_sections::FLOAT) * 100);
END;
$$ LANGUAGE plpgsql;

-- Create function to determine required screening modules based on intake responses
CREATE OR REPLACE FUNCTION get_recommended_screening_modules(intake_id INTEGER)
RETURNS TEXT[] AS $$
DECLARE
    intake_data RECORD;
    modules TEXT[] := '{}';
    symptoms JSONB;
BEGIN
    -- Get intake form data
    SELECT * INTO intake_data FROM client_intake_forms WHERE id = intake_id;
    
    IF NOT FOUND THEN
        RETURN modules;
    END IF;
    
    -- PHQ-9 (Depression) - if depression symptoms or severity moderate+
    IF intake_data.current_symptoms ? 'Sadness/Depression' 
       OR intake_data.current_severity IN ('Moderate', 'Severe', 'Crisis') THEN
        modules := array_append(modules, 'PHQ-9');
    END IF;
    
    -- GAD-7 (Anxiety) - if anxiety symptoms present
    IF intake_data.current_symptoms ? 'Anxiety/Worry' 
       OR intake_data.current_symptoms ? 'Panic Attacks' THEN
        modules := array_append(modules, 'GAD-7');
    END IF;
    
    -- PC-PTSD-5 (PTSD) - if trauma history or PTSD symptoms
    IF intake_data.experienced_trauma = 'Yes' 
       OR intake_data.current_symptoms ? 'Trauma/PTSD' THEN
        modules := array_append(modules, 'PC-PTSD-5');
    END IF;
    
    -- AUDIT-C (Alcohol) - if current alcohol use
    IF intake_data.substance_use->'alcohol'->>'status' = 'current' THEN
        modules := array_append(modules, 'AUDIT-C');
    END IF;
    
    -- DAST-10 (Drug use) - if current substance use
    IF intake_data.substance_use->'cannabis'->>'status' = 'current'
       OR intake_data.substance_use->'prescription_misuse'->>'status' = 'current'
       OR intake_data.substance_use->'other'->>'status' = 'current' THEN
        modules := array_append(modules, 'DAST-10');
    END IF;
    
    -- C-SSRS (Suicide risk) - if self-harm thoughts or suicide history
    IF intake_data.current_self_harm_thoughts = true 
       OR intake_data.suicide_attempt_history = true
       OR intake_data.current_symptoms ? 'Suicidal Thoughts' THEN
        modules := array_append(modules, 'C-SSRS');
    END IF;
    
    -- ASRS (ADHD) - if concentration issues present
    IF intake_data.current_symptoms ? 'Concentration Issues'
       OR intake_data.current_symptoms ? 'Memory Problems' THEN
        modules := array_append(modules, 'ASRS-v1.1');
    END IF;
    
    -- MDQ (Bipolar) - if mood swings present
    IF intake_data.current_symptoms ? 'Mood Swings' THEN
        modules := array_append(modules, 'MDQ');
    END IF;
    
    -- ISI (Insomnia) - if sleep problems present
    IF intake_data.current_symptoms ? 'Sleep Problems' THEN
        modules := array_append(modules, 'ISI');
    END IF;
    
    -- SCOFF (Eating disorders) - if eating issues present
    IF intake_data.current_symptoms ? 'Eating Issues'
       OR intake_data.current_symptoms ? 'Appetite Changes' THEN
        modules := array_append(modules, 'SCOFF');
    END IF;
    
    -- OCI-R (OCD) - if obsessive/compulsive symptoms
    IF intake_data.current_symptoms ? 'Obsessive Thoughts'
       OR intake_data.current_symptoms ? 'Compulsive Behaviors' THEN
        modules := array_append(modules, 'OCI-R');
    END IF;
    
    RETURN modules;
END;
$$ LANGUAGE plpgsql;

-- Add intake form status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS intake_form_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS intake_form_id INTEGER REFERENCES client_intake_forms(id);

-- Create index on intake form status
CREATE INDEX IF NOT EXISTS idx_users_intake_completed ON users(intake_form_completed);

-- Sample data for testing (can be removed in production)
-- This will be populated when users complete their intake forms

COMMENT ON TABLE client_intake_forms IS 'Comprehensive client intake forms for therapy clinic compliance';
COMMENT ON TABLE intake_screening_modules IS 'Additional standardized screening questionnaires based on intake responses';
COMMENT ON FUNCTION calculate_intake_completion_percentage(INTEGER) IS 'Calculate percentage completion of intake form sections';
COMMENT ON FUNCTION get_recommended_screening_modules(INTEGER) IS 'Determine which screening modules to show based on intake responses'; 