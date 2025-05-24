const levenshteinCache = new Map<string, number>();

const createCacheKey = (a: string, b: string): string => {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
};

/**
 * Вычисляет расстояние Левенштейна между двумя строками
 * (минимальное количество операций вставки, удаления или замены для преобразования одной строки в другую)
 * @param a Первая строка
 * @param b Вторая строка
 * @returns Расстояние Левенштейна
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;

  const cacheKey = createCacheKey(a, b);
  const cachedResult = levenshteinCache.get(cacheKey);
  if (cachedResult !== undefined) return cachedResult;

  const matrix: number[][] = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const result = matrix[a.length][b.length];
  levenshteinCache.set(cacheKey, result);
  return result;
}

export const clearLevenshteinCache = (): void => {
  levenshteinCache.clear();
};

export { exportChat } from "../../utils/exportUtils";
