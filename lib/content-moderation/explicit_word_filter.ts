"use server";
/**
 * Utility function to generate common variations of a given bad word.
 * This function accounts for character substitutions such as '@' for 'a', '3' for 'e', etc.
 *
 * @param {string} word - The bad word to generate variations for.
 * @returns {string[]} - An array of strings containing the original word and its variations.
 */

function generateVariations(word: string): string[] {
  const variations: { [key: string]: string[] } = {
    a: ["a", "@", "4"],
    e: ["e", "3"],
    i: ["i", "1", "!"],
    o: ["o", "0"],
    u: ["u", "v"],
    s: ["s", "$", "5"],
    t: ["t", "7"],
  };

  const generate = (word: string, index: number): string[] => {
    if (index >= word.length) {
      return [""];
    }

    const char = word[index];
    const chars = variations[char.toLowerCase()] || [char];
    const rest = generate(word, index + 1);

    return chars.flatMap((ch) => rest.map((suffix) => ch + suffix));
  };

  return generate(word, 0);
}

const baseWords: string[] = [
  "anal",
  "anus",
  "arse",
  "ass",
  "asshole",
  "bastard",
  "bitch",
  "bloody",
  "bollocks",
  "boob",
  "bugger",
  "bullshit",
  "bum",
  "butt",
  "buttplug",
  "clit",
  "cock",
  "coon",
  "crap",
  "cunt",
  "damn",
  "dick",
  "dckk",
  "dildo",
  "dyke",
  "fag",
  "faggot",
  "fuck",
  "fck",
  "fucker",
  "fucking",
  "goddamn",
  "hell",
  "homo",
  "jerk",
  "jizz",
  "knob",
  "kkk",
  "labia",
  "muff",
  "nigga",
  "nigger",
  "penis",
  "piss",
  "prick",
  "pube",
  "pussy",
  "queer",
  "scrotum",
  "sex",
  "shit",
  "slut",
  "spunk",
  "twat",
  "vagina",
  "wank",
  "whore",
  "willy",
];

const badWords: string[] = [];

baseWords.forEach((word) => {
  badWords.push(...generateVariations(word));
});

const uniqueBadWords = Array.from(new Set(badWords)); // Remove duplicates

const badWordsRegex: RegExp = new RegExp(
  `\\b(${uniqueBadWords.join("|")})\\b`,
  "i"
);

/**
 * Function to check if a string contains bad/banned/explicit words
 * @param {string} text - The input text to check
 * @returns {boolean} - Returns true if bad words are found, otherwise false
 */
export async function contentModerationWordFilter(
  text: string
): Promise<boolean> {
  if (!text) {
    throw new Error("No text provided");
  }

  return Promise.resolve(badWordsRegex.test(text));
}
