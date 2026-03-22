export type Screen = 'landing' | 'interview' | 'feedback';
export type HelperType = 'MONO' | 'C-BOT' | 'HEX' | 'LENTE';

export interface Helper {
  id: HelperType;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

export interface FeedbackTip {
  icon: string;
  title: string;
  description: string;
}

export interface SkillScore {
  label: string;
  score: number;
}
