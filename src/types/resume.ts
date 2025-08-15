export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  summary?: string;
  avatarUri?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string; // ISO
  endDate?: string; // ISO
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string; // ISO
  endDate?: string; // ISO
}

export interface Skill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Resume {
  personal: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages?: string[];
  certifications?: string[];
}
