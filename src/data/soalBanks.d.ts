import { QuestionDifficulty, TeamId } from '../types/game';

export interface IndonesianSoalEntry {
  id: string;
  tim: 'merah' | 'biru';
  materi: string;
  tingkat: QuestionDifficulty;
  bonus: boolean;
  pertanyaan: string;
  kode?: string;
  pilihan: [string, string, string, string];
}

export interface IndonesianKunciEntry {
  jawaban: 0 | 1 | 2 | 3;
  penjelasan: string;
}

export interface RawPromptEntry {
  id: string;
  pairNumber: number;
  team: TeamId;
  category: string;
  difficulty: QuestionDifficulty;
  isBonus?: boolean;
  prompt: string;
  codeSnippet?: string;
  options: [string, string, string, string];
}

export interface RawAnswerEntry {
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}
