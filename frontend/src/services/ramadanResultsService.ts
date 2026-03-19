import { api } from "./api";

export interface CategoryResult {
  id: string;
  name: string;
  meaning: string;
  total: number;
  target: number;
}

export interface Nomination {
  categoryId: string;
  categoryName: string;
  meaning: string;
  winner: string;
  total: number;
}

export interface RamadanResults {
  activeDays: number;
  totalRamadanDays: number;
  asmaLearned: number;
  totalAsma: number;
  quiz: {
    totalQuizzes: number;
    totalScore: number;
    bestScore: number;
  };
  categories: CategoryResult[];
  nominations: Nomination[];
}

export async function getRamadanResults(): Promise<RamadanResults> {
  return api("/ramadan-results");
}