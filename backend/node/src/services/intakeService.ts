import { Pool } from 'pg';
import { 
  ClientIntakeForm, 
  CreateIntakeFormRequest, 
  UpdateIntakeFormRequest,
  ScreeningModule,
  CreateScreeningModuleRequest,
  ScreeningModuleType,
  IntakeFormProgress,
  SectionProgress
} from '../types/intake';
import { logger } from '../utils/logger';

export class IntakeService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Create a new intake form for a user
  async createIntakeForm(userId: number, data: CreateIntakeFormRequest): Promise<ClientIntakeForm> {
    const client = await this.pool.connect();
    
    try {
      // Check if user already has an intake form
      const existingForm = await client.query(
        'SELECT id FROM client_intake_forms WHERE user_id = $1',
        [userId]
      );

      if (existingForm.rows.length > 0) {
        throw new Error('User already has an intake form');
      }

      // Parse date_of_birth if provided
      const dateOfBirth = data.date_of_birth ? new Date(data.date_of_birth) : null;

      // Insert new intake form (only specify user_id, let other columns use their defaults)
      const result = await client.query(
        `INSERT INTO client_intake_forms (user_id) VALUES ($1) RETURNING *`,
        [userId]
      );

      return this.formatIntakeForm(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Get intake form by user ID
  async getIntakeFormByUserId(userId: number): Promise<ClientIntakeForm | null> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM client_intake_forms WHERE user_id = $1',
        [userId]
      );

      return result.rows.length > 0 ? this.formatIntakeForm(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  // Get intake form by ID
  async getIntakeFormById(id: number): Promise<ClientIntakeForm | null> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM client_intake_forms WHERE id = $1',
        [id]
      );

      return result.rows.length > 0 ? this.formatIntakeForm(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  // Update intake form (supports partial updates and section-specific updates)
  async updateIntakeForm(
    userId: number, 
    updates: UpdateIntakeFormRequest
  ): Promise<ClientIntakeForm> {
    const client = await this.pool.connect();
    
    try {
      // Get existing form
      const existingForm = await client.query(
        'SELECT * FROM client_intake_forms WHERE user_id = $1',
        [userId]
      );

      if (existingForm.rows.length === 0) {
        throw new Error('Intake form not found');
      }

      const currentForm = existingForm.rows[0];
      
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // Helper function to add field to update
      const addField = (fieldName: string, value: any) => {
        if (value !== undefined) {
          updateFields.push(`${fieldName} = $${paramIndex++}`);
          updateValues.push(value);
        }
      };

      // Section 1: Client Identification
      addField('full_name', updates.full_name);
      addField('preferred_name', updates.preferred_name);
      addField('pronouns', updates.pronouns);
      addField('date_of_birth', updates.date_of_birth ? new Date(updates.date_of_birth) : undefined);
      addField('gender_identity', updates.gender_identity);
      addField('gender_self_describe', updates.gender_self_describe);
      addField('marital_status', updates.marital_status);
      addField('occupation_school', updates.occupation_school);
      addField('primary_language', updates.primary_language);
      addField('religion_spirituality', updates.religion_spirituality);

      // Section 2: Presenting Concerns
      addField('main_issues', updates.main_issues);
      addField('concern_duration', updates.concern_duration);
      addField('current_severity', updates.current_severity);
      addField('therapy_goals', updates.therapy_goals ? JSON.stringify(updates.therapy_goals) : undefined);

      // Section 3: Mental Health History
      addField('prior_counselling', updates.prior_counselling);
      addField('prior_counselling_helpful', updates.prior_counselling_helpful);
      addField('prior_counselling_details', updates.prior_counselling_details);
      addField('psychiatric_hospitalization', updates.psychiatric_hospitalization);
      addField('psychiatric_hospitalization_details', updates.psychiatric_hospitalization_details);
      addField('current_self_harm_thoughts', updates.current_self_harm_thoughts);
      addField('current_self_harm_details', updates.current_self_harm_details);
      addField('suicide_attempt_history', updates.suicide_attempt_history);
      addField('suicide_attempt_details', updates.suicide_attempt_details);
      addField('violence_history', updates.violence_history);
      addField('violence_details', updates.violence_details);
      addField('previous_diagnoses', updates.previous_diagnoses);
      addField('previous_diagnoses_details', updates.previous_diagnoses_details);

      // Section 4: Current Symptoms
      addField('current_symptoms', updates.current_symptoms ? JSON.stringify(updates.current_symptoms) : undefined);
      addField('current_symptoms_other', updates.current_symptoms_other);

      // Section 5: Medical History
      addField('chronic_pain_illness', updates.chronic_pain_illness);
      addField('chronic_pain_details', updates.chronic_pain_details);
      addField('neurological_conditions', updates.neurological_conditions);
      addField('neurological_details', updates.neurological_details);
      addField('allergies', updates.allergies);
      addField('allergies_details', updates.allergies_details);
      addField('pregnancy_postpartum', updates.pregnancy_postpartum);
      addField('pregnancy_details', updates.pregnancy_details);
      addField('other_medical_issues', updates.other_medical_issues);
      addField('other_medical_details', updates.other_medical_details);
      addField('current_medications', updates.current_medications);

      // Section 6: Family History
      addField('family_mental_health', updates.family_mental_health);
      addField('family_mental_health_details', updates.family_mental_health_details);
      addField('family_substance_abuse', updates.family_substance_abuse);
      addField('family_substance_abuse_details', updates.family_substance_abuse_details);

      // Section 7: Substance Use
      addField('substance_use', updates.substance_use ? JSON.stringify(updates.substance_use) : undefined);

      // Section 8: Psychosocial Snapshot
      addField('living_situation', updates.living_situation);
      addField('living_situation_other', updates.living_situation_other);
      addField('relationship_quality', updates.relationship_quality);
      addField('adequate_social_support', updates.adequate_social_support);
      addField('in_romantic_relationship', updates.in_romantic_relationship);
      addField('romantic_relationship_duration', updates.romantic_relationship_duration);
      addField('romantic_relationship_quality', updates.romantic_relationship_quality);
      addField('family_structure_support', updates.family_structure_support);
      addField('social_network_friendships', updates.social_network_friendships);
      addField('work_school_stress', updates.work_school_stress);
      addField('sleep_details', updates.sleep_details);
      addField('exercise_hobbies', updates.exercise_hobbies);

      // Section 9: Trauma History
      addField('experienced_trauma', updates.experienced_trauma);
      addField('trauma_types', updates.trauma_types ? JSON.stringify(updates.trauma_types) : undefined);
      addField('trauma_ages', updates.trauma_ages);
      addField('trauma_details', updates.trauma_details);

      // Section 10: Therapy Preferences
      addField('preferred_therapy_approach', updates.preferred_therapy_approach);

      // Update section progress if section_name is provided
      if (updates.section_name) {
        const currentProgress = currentForm.section_progress;
        currentProgress[updates.section_name] = true;
        addField('section_progress', JSON.stringify(currentProgress));
      }

      // Always update the updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateValues.push(userId);

      if (updateFields.length === 1) { // Only updated_at
        throw new Error('No fields to update');
      }

      const query = `
        UPDATE client_intake_forms 
        SET ${updateFields.join(', ')} 
        WHERE user_id = $${paramIndex} 
        RETURNING *
      `;

      const result = await client.query(query, updateValues);
      
      if (result.rows.length === 0) {
        throw new Error('Intake form not found');
      }

      return this.formatIntakeForm(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Mark intake form as complete
  async completeIntakeForm(userId: number): Promise<ClientIntakeForm> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE client_intake_forms 
         SET is_complete = true, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 
         RETURNING *`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Intake form not found');
      }

      // Update user's intake_form_completed status
      await client.query(
        'UPDATE users SET intake_form_completed = true, intake_form_id = $1 WHERE id = $2',
        [result.rows[0].id, userId]
      );

      return this.formatIntakeForm(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Get intake form progress
  async getIntakeProgress(userId: number): Promise<IntakeFormProgress | null> {
    const client = await this.pool.connect();
    
    try {
      const form = await this.getIntakeFormByUserId(userId);
      
      if (!form) {
        return null;
      }

      // Calculate completion percentage
      const completionResult = await client.query(
        'SELECT calculate_intake_completion_percentage($1) as percentage',
        [form.id]
      );

      const completionPercentage = completionResult.rows[0].percentage;

      // Get completed and pending sections
      const sectionProgress = form.section_progress;
      const completedSections = Object.keys(sectionProgress).filter(key => sectionProgress[key]);
      const pendingSections = Object.keys(sectionProgress).filter(key => !sectionProgress[key]);

      // Get recommended screening modules
      const modulesResult = await client.query(
        'SELECT get_recommended_screening_modules($1) as modules',
        [form.id]
      );

      const recommendedModules = modulesResult.rows[0].modules || [];

      return {
        user_id: userId,
        completion_percentage: completionPercentage,
        completed_sections: completedSections,
        pending_sections: pendingSections,
        recommended_modules: recommendedModules
      };
    } finally {
      client.release();
    }
  }

  // Screening Modules Management

  // Create screening module response
  async createScreeningModule(
    userId: number, 
    intakeFormId: number, 
    data: CreateScreeningModuleRequest
  ): Promise<ScreeningModule> {
    const client = await this.pool.connect();
    
    try {
      // Calculate score based on module type and responses
      const score = this.calculateModuleScore(data.module_type, data.responses);
      const severityLevel = this.getSeverityLevel(data.module_type, score);

      const result = await client.query(
        `INSERT INTO intake_screening_modules 
         (intake_form_id, user_id, module_type, responses, score, severity_level)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (intake_form_id, module_type) 
         DO UPDATE SET 
           responses = EXCLUDED.responses,
           score = EXCLUDED.score,
           severity_level = EXCLUDED.severity_level,
           completed_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          intakeFormId, 
          userId, 
          data.module_type, 
          JSON.stringify(data.responses), 
          score, 
          severityLevel
        ]
      );

      return this.formatScreeningModule(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Get screening modules for intake form
  async getScreeningModules(intakeFormId: number): Promise<ScreeningModule[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM intake_screening_modules WHERE intake_form_id = $1 ORDER BY completed_at DESC',
        [intakeFormId]
      );

      return result.rows.map(row => this.formatScreeningModule(row));
    } finally {
      client.release();
    }
  }

  // Get recommended screening modules for intake form
  async getRecommendedScreeningModules(intakeFormId: number): Promise<ScreeningModuleType[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        'SELECT get_recommended_screening_modules($1) as modules',
        [intakeFormId]
      );

      return result.rows[0].modules || [];
    } finally {
      client.release();
    }
  }

  // Delete intake form (admin only)
  async deleteIntakeForm(id: number): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM client_intake_forms WHERE id = $1 RETURNING user_id',
        [id]
      );

      if (result.rows.length > 0) {
        // Update user's intake status
        await client.query(
          'UPDATE users SET intake_form_completed = false, intake_form_id = NULL WHERE id = $1',
          [result.rows[0].user_id]
        );
      }
    } finally {
      client.release();
    }
  }

  // Get all intake forms (admin only)
  async getAllIntakeForms(page: number = 1, limit: number = 50): Promise<{
    intake_forms: ClientIntakeForm[];
    total: number;
    page: number;
    limit: number;
  }> {
    const client = await this.pool.connect();
    
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await client.query('SELECT COUNT(*) FROM client_intake_forms');
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      const result = await client.query(
        `SELECT * FROM client_intake_forms 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const intakeForms = result.rows.map(row => this.formatIntakeForm(row));

      return {
        intake_forms: intakeForms,
        total,
        page,
        limit
      };
    } finally {
      client.release();
    }
  }

  // Helper methods

  private formatIntakeForm(row: any): ClientIntakeForm {
    return {
      id: row.id,
      user_id: row.user_id,
      full_name: row.full_name,
      preferred_name: row.preferred_name,
      pronouns: row.pronouns,
      date_of_birth: row.date_of_birth,
      gender_identity: row.gender_identity,
      gender_self_describe: row.gender_self_describe,
      marital_status: row.marital_status,
      occupation_school: row.occupation_school,
      primary_language: row.primary_language,
      religion_spirituality: row.religion_spirituality,
      main_issues: row.main_issues,
      concern_duration: row.concern_duration,
      current_severity: row.current_severity,
      therapy_goals: row.therapy_goals,
      prior_counselling: row.prior_counselling,
      prior_counselling_helpful: row.prior_counselling_helpful,
      prior_counselling_details: row.prior_counselling_details,
      psychiatric_hospitalization: row.psychiatric_hospitalization,
      psychiatric_hospitalization_details: row.psychiatric_hospitalization_details,
      current_self_harm_thoughts: row.current_self_harm_thoughts,
      current_self_harm_details: row.current_self_harm_details,
      suicide_attempt_history: row.suicide_attempt_history,
      suicide_attempt_details: row.suicide_attempt_details,
      violence_history: row.violence_history,
      violence_details: row.violence_details,
      previous_diagnoses: row.previous_diagnoses,
      previous_diagnoses_details: row.previous_diagnoses_details,
      current_symptoms: row.current_symptoms,
      current_symptoms_other: row.current_symptoms_other,
      chronic_pain_illness: row.chronic_pain_illness,
      chronic_pain_details: row.chronic_pain_details,
      neurological_conditions: row.neurological_conditions,
      neurological_details: row.neurological_details,
      allergies: row.allergies,
      allergies_details: row.allergies_details,
      pregnancy_postpartum: row.pregnancy_postpartum,
      pregnancy_details: row.pregnancy_details,
      other_medical_issues: row.other_medical_issues,
      other_medical_details: row.other_medical_details,
      current_medications: row.current_medications,
      family_mental_health: row.family_mental_health,
      family_mental_health_details: row.family_mental_health_details,
      family_substance_abuse: row.family_substance_abuse,
      family_substance_abuse_details: row.family_substance_abuse_details,
      substance_use: row.substance_use,
      living_situation: row.living_situation,
      living_situation_other: row.living_situation_other,
      relationship_quality: row.relationship_quality,
      adequate_social_support: row.adequate_social_support,
      in_romantic_relationship: row.in_romantic_relationship,
      romantic_relationship_duration: row.romantic_relationship_duration,
      romantic_relationship_quality: row.romantic_relationship_quality,
      family_structure_support: row.family_structure_support,
      social_network_friendships: row.social_network_friendships,
      work_school_stress: row.work_school_stress,
      sleep_details: row.sleep_details,
      exercise_hobbies: row.exercise_hobbies,
      experienced_trauma: row.experienced_trauma,
      trauma_types: row.trauma_types,
      trauma_ages: row.trauma_ages,
      trauma_details: row.trauma_details,
      preferred_therapy_approach: row.preferred_therapy_approach,
      completed_at: row.completed_at,
      is_complete: row.is_complete,
      section_progress: row.section_progress,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private formatScreeningModule(row: any): ScreeningModule {
    return {
      id: row.id,
      intake_form_id: row.intake_form_id,
      user_id: row.user_id,
      module_type: row.module_type,
      responses: row.responses,
      score: row.score,
      severity_level: row.severity_level,
      completed_at: row.completed_at,
      created_at: row.created_at
    };
  }

  // Scoring algorithms for different screening modules
  private calculateModuleScore(moduleType: ScreeningModuleType, responses: any): number {
    switch (moduleType) {
      case 'PHQ-9':
        return this.calculatePHQ9Score(responses);
      case 'GAD-7':
        return this.calculateGAD7Score(responses);
      case 'PC-PTSD-5':
        return this.calculatePCPTSD5Score(responses);
      // Add more scoring algorithms as needed
      default:
        return 0;
    }
  }

  private calculatePHQ9Score(responses: any): number {
    // PHQ-9 scoring: sum of all 9 items (0-3 each, total 0-27)
    const items = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];
    return items.reduce((sum, item) => sum + (parseInt(responses[item]) || 0), 0);
  }

  private calculateGAD7Score(responses: any): number {
    // GAD-7 scoring: sum of all 7 items (0-3 each, total 0-21)
    const items = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];
    return items.reduce((sum, item) => sum + (parseInt(responses[item]) || 0), 0);
  }

  private calculatePCPTSD5Score(responses: any): number {
    // PC-PTSD-5 scoring: count of "Yes" responses (0-5)
    const items = ['q1', 'q2', 'q3', 'q4', 'q5'];
    return items.reduce((sum, item) => sum + (responses[item] === 'yes' ? 1 : 0), 0);
  }

  private getSeverityLevel(moduleType: ScreeningModuleType, score: number): string {
    switch (moduleType) {
      case 'PHQ-9':
        if (score <= 4) return 'Minimal';
        if (score <= 9) return 'Mild';
        if (score <= 14) return 'Moderate';
        if (score <= 19) return 'Moderately Severe';
        return 'Severe';
      case 'GAD-7':
        if (score <= 4) return 'Minimal';
        if (score <= 9) return 'Mild';
        if (score <= 14) return 'Moderate';
        return 'Severe';
      case 'PC-PTSD-5':
        return score >= 3 ? 'Positive Screen' : 'Negative Screen';
      default:
        return 'Unknown';
    }
  }
} 