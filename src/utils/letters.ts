import { LetterOutput } from "@/types/general";

// For preview purposes in the form
export function generatePreviewLetter<FormValues>(
  data: FormValues,
  index: number = 0,
  letterCallback: (data: FormValues) => LetterOutput[]
): {
  body: string;
  currentIndex: number;
  total: number;
  isHtml: boolean;
} {
  const letters = letterCallback(data);

  if (letters.length === 0)
    return {
      body: "No organisations selected",
      currentIndex: 0,
      total: 0,
      isHtml: false,
    };

  // Ensure index is within bounds
  const safeIndex = Math.max(0, Math.min(index, letters.length - 1));
  const letter = letters[safeIndex];

  return {
    body: `To: ${letter.to}\nSubject: ${letter.subject}\n\n${letter.body}`,
    currentIndex: safeIndex,
    total: letters.length,
    isHtml: true,
  };
}
