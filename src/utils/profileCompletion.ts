interface ProfileData {
  full_name: string;
  bio: string;
  skills: { skillId: string; proficiency: number }[];
}

export function calculateProfileCompletion(profile: ProfileData): {
  percentage: number;
  missingFields: string[];
} {
  const missingFields: string[] = [];
  let completedFields = 0;
  const totalFields = 3; // name, bio, skills

  // Check full name
  if (profile.full_name && profile.full_name.trim().length >= 3) {
    completedFields++;
  } else {
    missingFields.push('full name');
  }

  // Check bio
  if (profile.bio && profile.bio.trim().length >= 50) {
    completedFields++;
  } else {
    missingFields.push('bio (minimum 50 characters)');
  }

  // Check skills
  if (profile.skills && profile.skills.length >= 3) {
    completedFields++;
  } else {
    missingFields.push('at least 3 skills');
  }

  const percentage = Math.round((completedFields / totalFields) * 100);

  return {
    percentage,
    missingFields,
  };
} 