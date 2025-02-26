export interface TeamFormationRule {
  id: string;
  course_id: string;
  min_team_size: number;
  max_team_size: number;
  required_skills: {
    skillId: string;
    minCount: number;
    minProficiency: number;
  }[];
  skill_distribution_rules: {
    diversityWeight: number;
    academicLevelBalance: boolean;
  };
  created_at: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTeamRules(rule: TeamFormationRule): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Team size validation
  if (rule.min_team_size < 2) {
    errors.push('Minimum team size must be at least 2');
  }
  if (rule.max_team_size > 10) {
    errors.push('Maximum team size cannot exceed 10');
  }
  if (rule.min_team_size > rule.max_team_size) {
    errors.push('Minimum team size cannot be greater than maximum');
  }

  // Skill requirements validation
  const skillCounts = new Map<string, number>();
  rule.required_skills.forEach(req => {
    if (req.minCount > rule.max_team_size) {
      errors.push(`Skill requirement minimum count exceeds maximum team size`);
    }
    if (req.minProficiency < 1 || req.minProficiency > 5) {
      errors.push(`Skill proficiency must be between 1 and 5`);
    }
    skillCounts.set(req.skillId, (skillCounts.get(req.skillId) || 0) + 1);
  });

  // Check for duplicate skills
  skillCounts.forEach((count, skillId) => {
    if (count > 1) {
      errors.push(`Duplicate skill requirement found`);
    }
  });

  // Warnings
  if (rule.required_skills.length === 0) {
    warnings.push('No skill requirements defined');
  }
  if (rule.max_team_size - rule.min_team_size > 3) {
    warnings.push('Large team size range might lead to unbalanced teams');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
} 