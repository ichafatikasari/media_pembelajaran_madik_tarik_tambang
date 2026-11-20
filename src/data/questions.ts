import {
  DifficultyFilter,
  QuestionAnswerKey,
  QuestionPrompt,
  QueuedQuestion,
  TeamId,
} from '../types/game';
import { BANK_MERAH } from './soalMerah.js';
import { BANK_BIRU } from './soalBiru.js';
import { KUNCI_MERAH } from './kunciMerah.js';
import { KUNCI_BIRU } from './kunciBiru.js';
import {
  CADANGAN_BIRU,
  CADANGAN_MERAH,
  KUNCI_CADANGAN_BIRU,
  KUNCI_CADANGAN_MERAH,
} from './soalCadangan.js';
import type {
  IndonesianKunciEntry,
  IndonesianSoalEntry,
  RawAnswerEntry,
  RawPromptEntry,
} from './soalBanks';

export interface TeacherBankItem extends RawPromptEntry {
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

function toPromptEntries(items: IndonesianSoalEntry[]): RawPromptEntry[] {
  return items.map((item, idx) => ({
    id: item.id,
    pairNumber: idx + 1,
    team: item.tim === 'merah' ? 'red' : 'blue',
    category: item.materi,
    difficulty: item.tingkat,
    isBonus: item.bonus,
    prompt: item.pertanyaan,
    codeSnippet: item.kode,
    options: item.pilihan,
  }));
}

function toAnswerMap(
  keys: Record<string, IndonesianKunciEntry>
): Record<string, RawAnswerEntry> {
  const out: Record<string, RawAnswerEntry> = {};
  for (const [id, entry] of Object.entries(keys)) {
    out[id] = {
      correctIndex: entry.jawaban,
      explanation: entry.penjelasan,
    };
  }
  return out;
}

const TYPED_SOAL_MERAH = toPromptEntries(
  BANK_MERAH as unknown as IndonesianSoalEntry[]
);
const TYPED_KUNCI_MERAH = toAnswerMap(
  KUNCI_MERAH as unknown as Record<string, IndonesianKunciEntry>
);
const TYPED_CADANGAN_MERAH = toPromptEntries(
  CADANGAN_MERAH as unknown as IndonesianSoalEntry[]
);
const TYPED_KUNCI_CADANGAN_MERAH = toAnswerMap(
  KUNCI_CADANGAN_MERAH as unknown as Record<string, IndonesianKunciEntry>
);

const TYPED_SOAL_BIRU = toPromptEntries(
  BANK_BIRU as unknown as IndonesianSoalEntry[]
);
const TYPED_KUNCI_BIRU = toAnswerMap(
  KUNCI_BIRU as unknown as Record<string, IndonesianKunciEntry>
);
const TYPED_CADANGAN_BIRU = toPromptEntries(
  CADANGAN_BIRU as unknown as IndonesianSoalEntry[]
);
const TYPED_KUNCI_CADANGAN_BIRU = toAnswerMap(
  KUNCI_CADANGAN_BIRU as unknown as Record<string, IndonesianKunciEntry>
);

const PROMPT_MAP: Record<string, RawPromptEntry> = {};
const ANSWER_KEY_MAP: Record<string, QuestionAnswerKey> = {};

function registerBank(
  prompts: RawPromptEntry[],
  keys: Record<string, RawAnswerEntry>
) {
  for (const p of prompts) {
    PROMPT_MAP[p.id] = p;
    const k = keys[p.id];
    if (k) {
      ANSWER_KEY_MAP[p.id] = {
        id: p.id,
        correctIndex: k.correctIndex,
        explanation: k.explanation,
      };
    }
  }
}

registerBank(TYPED_SOAL_MERAH, TYPED_KUNCI_MERAH);
registerBank(TYPED_CADANGAN_MERAH, TYPED_KUNCI_CADANGAN_MERAH);
registerBank(TYPED_SOAL_BIRU, TYPED_KUNCI_BIRU);
registerBank(TYPED_CADANGAN_BIRU, TYPED_KUNCI_CADANGAN_BIRU);

export const BANK_MERAH_META: TeacherBankItem[] = TYPED_SOAL_MERAH.map((p) => ({
  ...p,
  correctIndex: TYPED_KUNCI_MERAH[p.id]?.correctIndex ?? 0,
  explanation: TYPED_KUNCI_MERAH[p.id]?.explanation ?? '',
}));

export const BANK_BIRU_META: TeacherBankItem[] = TYPED_SOAL_BIRU.map((p) => ({
  ...p,
  correctIndex: TYPED_KUNCI_BIRU[p.id]?.correctIndex ?? 0,
  explanation: TYPED_KUNCI_BIRU[p.id]?.explanation ?? '',
}));

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomOptionPermutation(): [number, number, number, number] {
  const arr = shuffleArray([0, 1, 2, 3]);
  return [arr[0], arr[1], arr[2], arr[3]];
}

export function buildTeamQueue(
  team: TeamId,
  count: number,
  difficultyFilter: DifficultyFilter,
  bonusEnabled: boolean
): QueuedQuestion[] {
  const baseBank = team === 'red' ? TYPED_SOAL_MERAH : TYPED_SOAL_BIRU;
  let pool =
    difficultyFilter === 'Semua'
      ? baseBank
      : baseBank.filter((q) => q.difficulty === difficultyFilter);

  if (pool.length < count) {
    const existingIds = new Set(pool.map((q) => q.id));
    const extras = shuffleArray(baseBank.filter((q) => !existingIds.has(q.id)));
    pool = [...shuffleArray(pool), ...extras];
  } else {
    pool = shuffleArray(pool);
  }

  return pool.slice(0, Math.min(count, baseBank.length)).map((q) => ({
    id: q.id,
    optionOrder: randomOptionPermutation(),
    isBonus: bonusEnabled && Boolean(q.isBonus),
  }));
}

export function getSpareQuestion(team: TeamId, spareIndex: number): QueuedQuestion | null {
  const list = team === 'red' ? TYPED_CADANGAN_MERAH : TYPED_CADANGAN_BIRU;
  if (list.length === 0) return null;
  const rec = list[spareIndex % list.length];
  return {
    id: rec.id,
    optionOrder: randomOptionPermutation(),
    isBonus: false,
    isSuddenDeath: true,
  };
}

export function getStudentQuestion(q: QueuedQuestion): QuestionPrompt | null {
  const rec = PROMPT_MAP[q.id];
  if (!rec) return null;
  return {
    id: rec.id,
    pairNumber: rec.pairNumber,
    team: rec.team,
    category: rec.category,
    difficulty: rec.difficulty,
    isBonus: q.isBonus,
    prompt: rec.prompt,
    codeSnippet: rec.codeSnippet,
    options: [
      rec.options[q.optionOrder[0]],
      rec.options[q.optionOrder[1]],
      rec.options[q.optionOrder[2]],
      rec.options[q.optionOrder[3]],
    ],
  };
}

export function getMappedAnswerKey(
  q: QueuedQuestion
): { correctOption: 0 | 1 | 2 | 3; explanation: string } | null {
  const key = ANSWER_KEY_MAP[q.id];
  if (!key) return null;
  const mappedIndex = q.optionOrder.indexOf(key.correctIndex) as 0 | 1 | 2 | 3;
  return {
    correctOption: mappedIndex,
    explanation: key.explanation,
  };
}
