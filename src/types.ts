export interface Project {
  id: string;
  title: string;
  category: 'Full-Stack' | 'Systems & Tools' | 'Web Apps' | 'Interactive';
  summary: string;
  description: string;
  metrics: string[];
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
  date: string;
  highlights: string[];
  color: string;
}

export interface SkillCategory {
  title: string;
  iconName: string;
  description: string;
  skills: {
    name: string;
    level: number; // 1-100
    category: string;
    icon?: string;
  }[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  location: string;
  type: 'Full-time' | 'Contract' | 'Open Source' | 'Education';
  summary: string;
  points: string[];
  skills: string[];
}
