import type { QuizQuestion } from '../types/content';

export const requestedExamSizes = [10, 20, 30] as const;

export function examSizeOptions(available: number): Array<{ value: number; label: string }> {
  const standard: Array<{ value: number; label: string }> = requestedExamSizes.filter((size) => size <= available).map((value) => ({ value, label: String(value) }));
  if (available > 0 && !standard.some(({ value }) => value === available)) standard.push({ value: available, label: `Все (${available})` });
  return standard;
}

export function selectExamQuestions(pool: QuizQuestion[], requested: number, random = Math.random): QuizQuestion[] {
  const unique = [...new Map(pool.map((question) => [question.id, question])).values()];
  for (let index = unique.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [unique[index], unique[target]] = [unique[target], unique[index]];
  }
  return unique.slice(0, Math.min(Math.max(0, requested), unique.length));
}

export interface CategoryScore { category:string; score:number; total:number; percent:number }
export function scoreByCategory(answers:Record<string,number>,questions:QuizQuestion[]):CategoryScore[]{
  const groups=new Map<string,QuizQuestion[]>();
  for(const question of questions)groups.set(question.category,[...(groups.get(question.category)||[]),question]);
  return [...groups].map(([category,items])=>{const score=items.filter(item=>answers[item.id]===item.correctOption).length;return{category,score,total:items.length,percent:Math.round(score/items.length*100)}});
}
export function filterByDifficulty(questions:QuizQuestion[],levels:QuizQuestion['difficulty'][]):QuizQuestion[]{return questions.filter(question=>levels.includes(question.difficulty))}
export function readinessRecommendations(scores:CategoryScore[]){return{strong:scores.filter(score=>score.percent>=85).map(score=>score.category),repeat:scores.filter(score=>score.percent<75).map(score=>score.category)}}
