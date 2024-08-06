export function containsPercentage(text: string): boolean {
    const percentageRegex = /\d+%/;
    return percentageRegex.test(text);
  }