import { api } from "./api";
import { ASMA_KAZAKH_TRANSLIT } from "../data/asmaKazakhTranslit";
import { ASMA_KAZAKH } from "../data/asmaKazakh";

export interface QuizQuestion {
  id: string;
  asmaNumber: number;
  kazakhName: string;
  meaning: string;
  type: "name-to-meaning" | "meaning-to-name";
  options: string[];
  correctAnswer: string;
}

export interface QuizResult {
  date: string;
  score: number;
  total: number;
  percentage: number;
  answers: {
    questionId: string;
    selected: string;
    correct: string;
    isCorrect: boolean;
  }[];
}

export interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  lastQuizDate: string | null;
  results: QuizResult[];
}

// Get all Asma numbers that should be in the quiz pool (learned up to today)
export async function getAvailableAsmaNumbers(): Promise<number[]> {
  const today = new Date().toISOString().split("T")[0];

  try {
    const response = await api("me");
    const user = response;

    // Get all progress to find which asma have been learned
    const progressResponse = await api(`progress?date=${today}`);
    const progress = progressResponse;

    // Find the FirstThreeNames category
    const categoriesResponse = await api("categories");
    const categories = categoriesResponse;
    const firstThreeNamesCategory = categories.find(
      (c: any) => c.name.includes("есімі") && c.target === 3
    );

    if (!firstThreeNamesCategory) return [];

    // Get progress for FirstThreeNames to see which asma have been learned
    const learnedAsma = progress[firstThreeNamesCategory.id] || [];

    // Get all asma that have been shown up to today
    // Assuming 3 asma per day starting from day 1
    const today_date = new Date();
    const ramadanStart = new Date(2026, 1, 19); // Feb 19, 2026
    const dayNumber = Math.floor(
      (today_date.getTime() - ramadanStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    const maxAsmaIndex = Math.min((dayNumber + 1) * 3, 99); // 0-99 (99 asma)
    const availableAsmaNumbers = Array.from(
      { length: maxAsmaIndex },
      (_, i) => i
    );

    return availableAsmaNumbers;
  } catch (error) {
    console.error("Error fetching available asma:", error);
    return [];
  }
}

// Generate a quiz with 10 random questions
export function generateQuiz(asmaNumbers: number[]): QuizQuestion[] {
  if (asmaNumbers.length === 0) return [];

  const questions: QuizQuestion[] = [];
  const usedNumbers = new Set<number>();

  // Get 10 random unique asma numbers
  while (questions.length < 10 && usedNumbers.size < asmaNumbers.length) {
    const randomNum = asmaNumbers[
      Math.floor(Math.random() * asmaNumbers.length)
    ];
    if (!usedNumbers.has(randomNum)) {
      usedNumbers.add(randomNum);

      const asmaNum = randomNum;
      const kazakhName = ASMA_KAZAKH_TRANSLIT[asmaNum];
      const meaning = ASMA_KAZAKH[asmaNum];

      // Randomly decide question type (50/50)
      const isNameToMeaning = Math.random() > 0.5;
      const questionType: "name-to-meaning" | "meaning-to-name" =
        isNameToMeaning ? "name-to-meaning" : "meaning-to-name";

      // Generate wrong options
      const wrongOptions = new Set<string>();
      while (wrongOptions.size < 3) {
        const wrongNum =
          asmaNumbers[Math.floor(Math.random() * asmaNumbers.length)];
        if (wrongNum !== asmaNum) {
          wrongOptions.add(
            isNameToMeaning
              ? ASMA_KAZAKH[wrongNum]
              : ASMA_KAZAKH_TRANSLIT[wrongNum]
          );
        }
      }

      const correctAnswer = isNameToMeaning ? meaning : kazakhName;
      const options = [
        correctAnswer,
        ...Array.from(wrongOptions),
      ].sort(() => Math.random() - 0.5);

      questions.push({
        id: `q${questions.length + 1}`,
        asmaNumber: asmaNum,
        kazakhName,
        meaning,
        type: questionType,
        options,
        correctAnswer,
      });
    }
  }

  return questions;
}

// Save quiz result to Firebase
export async function saveQuizResult(result: QuizResult): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    await api(`quiz-results/${today}`, {
      method: "POST",
      body: JSON.stringify(result),
    });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw error;
  }
}

// Get quiz statistics
export async function getQuizStats(): Promise<QuizStats> {
  try {
    const response = await api("quiz-stats");
    return response;
  } catch (error) {
    console.error("Error fetching quiz stats:", error);
    return {
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      lastQuizDate: null,
      results: [],
    };
  }
}
