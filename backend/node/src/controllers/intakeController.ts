import { Response } from 'express';
import { IntakeService } from '../services/intakeService';
import { AuthRequest } from '../types/auth';
import { 
  CreateIntakeFormRequest, 
  UpdateIntakeFormRequest,
  CreateScreeningModuleRequest,
  IntakeFormResponse 
} from '../types/intake';
import { logger } from '../utils/logger';

export class IntakeController {
  private intakeService: IntakeService;

  constructor(intakeService: IntakeService) {
    this.intakeService = intakeService;
  }

  // Initialize intake form for current user
  async initializeIntakeForm(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Check if user already has an intake form
      const existingForm = await this.intakeService.getIntakeFormByUserId(userId);
      
      if (existingForm) {
        res.status(200).json({
          message: 'Intake form already exists',
          intake_form: existingForm,
          completion_percentage: await this.getCompletionPercentage(existingForm.id),
          recommended_modules: await this.intakeService.getRecommendedScreeningModules(existingForm.id)
        });
        return;
      }

      // Create new empty intake form
      const intakeForm = await this.intakeService.createIntakeForm(userId, {});
      
      res.status(201).json({
        message: 'Intake form initialized successfully',
        intake_form: intakeForm,
        completion_percentage: 0,
        recommended_modules: []
      });
    } catch (error: any) {
      logger.error('Error in initializeIntakeForm:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  // Get current user's intake form
  async getMyIntakeForm(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const intakeForm = await this.intakeService.getIntakeFormByUserId(userId);
      
      if (!intakeForm) {
        res.status(404).json({ error: 'Intake form not found' });
        return;
      }

      const completionPercentage = await this.getCompletionPercentage(intakeForm.id);
      const recommendedModules = await this.intakeService.getRecommendedScreeningModules(intakeForm.id);

      res.json({
        intake_form: intakeForm,
        completion_percentage: completionPercentage,
        recommended_modules: recommendedModules
      });
    } catch (error: any) {
      logger.error('Error in getMyIntakeForm:', error.message);
      res.status(500).json({ error: 'Failed to fetch intake form' });
    }
  }

  // Update intake form (section by section)
  async updateIntakeForm(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const updateData: UpdateIntakeFormRequest = req.body;

      const intakeForm = await this.intakeService.updateIntakeForm(userId, updateData);
      const completionPercentage = await this.getCompletionPercentage(intakeForm.id);
      const recommendedModules = await this.intakeService.getRecommendedScreeningModules(intakeForm.id);

      res.json({
        message: 'Intake form updated successfully',
        intake_form: intakeForm,
        completion_percentage: completionPercentage,
        recommended_modules: recommendedModules
      });
    } catch (error: any) {
      logger.error('Error in updateIntakeForm:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  // Complete intake form
  async completeIntakeForm(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Validate form completeness before marking complete
      const existingForm = await this.intakeService.getIntakeFormByUserId(userId);
      if (!existingForm) {
        res.status(404).json({ error: 'Intake form not found' });
        return;
      }

      const progress = await this.intakeService.getIntakeProgress(userId);
      if (progress && progress.completion_percentage < 100) {
        res.status(400).json({ 
          error: 'Intake form is not complete. Please fill in all required sections.',
          completion_percentage: progress.completion_percentage,
          pending_sections: progress.pending_sections
        });
        return;
      }

      const intakeForm = await this.intakeService.completeIntakeForm(userId);
      const recommendedModules = await this.intakeService.getRecommendedScreeningModules(intakeForm.id);

      res.json({
        message: 'Intake form completed successfully',
        intake_form: intakeForm,
        completion_percentage: 100,
        recommended_modules: recommendedModules
      });
    } catch (error: any) {
      logger.error('Error in completeIntakeForm:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  // Get intake progress
  async getIntakeProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const progress = await this.intakeService.getIntakeProgress(userId);
      
      if (!progress) {
        res.status(404).json({ error: 'Intake form not found' });
        return;
      }

      res.json(progress);
    } catch (error: any) {
      logger.error('Error in getIntakeProgress:', error.message);
      res.status(500).json({ error: 'Failed to fetch intake progress' });
    }
  }

  // Check if current user needs to complete intake form
  async checkIntakeStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const intakeForm = await this.intakeService.getIntakeFormByUserId(userId);
      
      if (!intakeForm) {
        res.json({
          needs_intake: true,
          has_form: false,
          is_complete: false,
          completion_percentage: 0
        });
        return;
      }

      const progress = await this.intakeService.getIntakeProgress(userId);

      res.json({
        needs_intake: !intakeForm.is_complete,
        has_form: true,
        is_complete: intakeForm.is_complete,
        completion_percentage: progress?.completion_percentage || 0,
        intake_form_id: intakeForm.id
      });
    } catch (error: any) {
      logger.error('Error in checkIntakeStatus:', error.message);
      res.status(500).json({ error: 'Failed to check intake status' });
    }
  }

  // Screening Modules

  // Submit screening module response
  async submitScreeningModule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const moduleData: CreateScreeningModuleRequest = req.body;

      // Get user's intake form
      const intakeForm = await this.intakeService.getIntakeFormByUserId(userId);
      if (!intakeForm) {
        res.status(404).json({ error: 'Intake form not found. Please complete intake form first.' });
        return;
      }

      const screeningModule = await this.intakeService.createScreeningModule(
        userId, 
        intakeForm.id, 
        moduleData
      );

      res.status(201).json({
        message: 'Screening module submitted successfully',
        module: screeningModule,
        interpretation: this.getModuleInterpretation(screeningModule.module_type, screeningModule.score!),
        recommendations: this.getModuleRecommendations(screeningModule.module_type, screeningModule.score!)
      });
    } catch (error: any) {
      logger.error('Error in submitScreeningModule:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  // Get screening modules for current user
  async getMyScreeningModules(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      const intakeForm = await this.intakeService.getIntakeFormByUserId(userId);
      if (!intakeForm) {
        res.status(404).json({ error: 'Intake form not found' });
        return;
      }

      const modules = await this.intakeService.getScreeningModules(intakeForm.id);
      const recommendedModules = await this.intakeService.getRecommendedScreeningModules(intakeForm.id);

      res.json({
        completed_modules: modules,
        recommended_modules: recommendedModules,
        total_completed: modules.length,
        total_recommended: recommendedModules.length
      });
    } catch (error: any) {
      logger.error('Error in getMyScreeningModules:', error.message);
      res.status(500).json({ error: 'Failed to fetch screening modules' });
    }
  }

  // Get recommended screening modules for current user
  async getRecommendedModules(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      const intakeForm = await this.intakeService.getIntakeFormByUserId(userId);
      if (!intakeForm) {
        res.status(404).json({ error: 'Intake form not found' });
        return;
      }

      const recommendedModules = await this.intakeService.getRecommendedScreeningModules(intakeForm.id);

      res.json({
        recommended_modules: recommendedModules,
        total: recommendedModules.length
      });
    } catch (error: any) {
      logger.error('Error in getRecommendedModules:', error.message);
      res.status(500).json({ error: 'Failed to fetch recommended modules' });
    }
  }

  // Admin endpoints

  // Get all intake forms (admin only)
  async getAllIntakeForms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await this.intakeService.getAllIntakeForms(page, limit);

      res.json(result);
    } catch (error: any) {
      logger.error('Error in getAllIntakeForms:', error.message);
      res.status(500).json({ error: 'Failed to fetch intake forms' });
    }
  }

  // Get intake form by ID (admin only)
  async getIntakeFormById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const intakeFormId = parseInt(req.params.id);
      
      if (isNaN(intakeFormId)) {
        res.status(400).json({ error: 'Invalid intake form ID' });
        return;
      }

      const intakeForm = await this.intakeService.getIntakeFormById(intakeFormId);
      
      if (!intakeForm) {
        res.status(404).json({ error: 'Intake form not found' });
        return;
      }

      const completionPercentage = await this.getCompletionPercentage(intakeForm.id);
      const recommendedModules = await this.intakeService.getRecommendedScreeningModules(intakeForm.id);
      const screeningModules = await this.intakeService.getScreeningModules(intakeForm.id);

      res.json({
        intake_form: intakeForm,
        completion_percentage: completionPercentage,
        recommended_modules: recommendedModules,
        screening_modules: screeningModules
      });
    } catch (error: any) {
      logger.error('Error in getIntakeFormById:', error.message);
      res.status(500).json({ error: 'Failed to fetch intake form' });
    }
  }

  // Delete intake form (admin only)
  async deleteIntakeForm(req: AuthRequest, res: Response): Promise<void> {
    try {
      const intakeFormId = parseInt(req.params.id);
      
      if (isNaN(intakeFormId)) {
        res.status(400).json({ error: 'Invalid intake form ID' });
        return;
      }

      await this.intakeService.deleteIntakeForm(intakeFormId);

      res.json({ message: 'Intake form deleted successfully' });
    } catch (error: any) {
      logger.error('Error in deleteIntakeForm:', error.message);
      res.status(500).json({ error: 'Failed to delete intake form' });
    }
  }

  // Validation endpoints

  // Validate section data
  async validateSection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { section_name, data } = req.body;

      if (!section_name || !data) {
        res.status(400).json({ error: 'Section name and data are required' });
        return;
      }

      const validationResult = this.validateSectionData(section_name, data);

      res.json({
        valid: validationResult.valid,
        errors: validationResult.errors,
        warnings: validationResult.warnings
      });
    } catch (error: any) {
      logger.error('Error in validateSection:', error.message);
      res.status(500).json({ error: 'Failed to validate section' });
    }
  }

  // Helper methods

  private async getCompletionPercentage(intakeFormId: number): Promise<number> {
    try {
      // This would normally call the database function, but for now we'll calculate it
      // based on the progress tracking in the service
      return 0; // Placeholder - implement actual calculation
    } catch (error) {
      logger.error('Error calculating completion percentage:', error);
      return 0;
    }
  }

  private getModuleInterpretation(moduleType: string, score: number): string {
    switch (moduleType) {
      case 'PHQ-9':
        if (score <= 4) return 'Minimal depression symptoms';
        if (score <= 9) return 'Mild depression symptoms';
        if (score <= 14) return 'Moderate depression symptoms';
        if (score <= 19) return 'Moderately severe depression symptoms';
        return 'Severe depression symptoms';
      case 'GAD-7':
        if (score <= 4) return 'Minimal anxiety symptoms';
        if (score <= 9) return 'Mild anxiety symptoms';
        if (score <= 14) return 'Moderate anxiety symptoms';
        return 'Severe anxiety symptoms';
      case 'PC-PTSD-5':
        return score >= 3 ? 'Positive screen for PTSD' : 'Negative screen for PTSD';
      default:
        return 'Assessment completed';
    }
  }

  private getModuleRecommendations(moduleType: string, score: number): string[] {
    const recommendations: string[] = [];

    switch (moduleType) {
      case 'PHQ-9':
        if (score > 9) {
          recommendations.push('Consider discussing these symptoms with your therapist');
          recommendations.push('Focus on mood regulation techniques in therapy');
        }
        if (score > 14) {
          recommendations.push('Consider psychiatric evaluation for medication options');
          recommendations.push('Increase therapy session frequency if possible');
        }
        break;
      case 'GAD-7':
        if (score > 9) {
          recommendations.push('Explore anxiety management techniques');
          recommendations.push('Consider mindfulness and relaxation exercises');
        }
        if (score > 14) {
          recommendations.push('Discuss anxiety medication with a healthcare provider');
          recommendations.push('Consider specialized anxiety treatment approaches');
        }
        break;
      case 'PC-PTSD-5':
        if (score >= 3) {
          recommendations.push('Consider trauma-focused therapy approaches');
          recommendations.push('Discuss PTSD symptoms with your therapist');
          recommendations.push('Consider EMDR or trauma-specific interventions');
        }
        break;
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue with regular therapy sessions as planned');
    }

    return recommendations;
  }

  private validateSectionData(sectionName: string, data: any): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (sectionName) {
      case 'client_identification':
        if (!data.full_name || data.full_name.trim().length === 0) {
          errors.push('Full name is required');
        }
        if (data.date_of_birth && isNaN(Date.parse(data.date_of_birth))) {
          errors.push('Invalid date of birth format');
        }
        if (data.gender_identity === 'Self-describe' && !data.gender_self_describe) {
          warnings.push('Please provide self-description for gender identity');
        }
        break;

      case 'presenting_concerns':
        if (!data.main_issues || data.main_issues.trim().length === 0) {
          errors.push('Please describe your main concerns');
        }
        if (!data.current_severity) {
          errors.push('Please rate the current severity of your concerns');
        }
        break;

      case 'mental_health_history':
        if (data.current_self_harm_thoughts === true && !data.current_self_harm_details) {
          warnings.push('Please provide details about self-harm thoughts for proper care');
        }
        if (data.suicide_attempt_history === true && !data.suicide_attempt_details) {
          warnings.push('Please provide details about suicide attempt history');
        }
        break;

      case 'trauma_history':
        if (data.experienced_trauma === 'Yes' && (!data.trauma_types || data.trauma_types.length === 0)) {
          warnings.push('Please specify the types of trauma experienced');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
} 