/**
 * Gets the display number for a question.
 * Always uses the question's stored number field,
 * never uses array index.
 */
export function getQuestionNumber(question) {
  if (!question) return '?';
  return (
    question.number || 
    question.questionNumber || 
    question.qNumber || 
    '?'
  );
}

/**
 * Sorts questions by their stored number.
 * Use this before rendering any question list.
 */
export function sortQuestionsByNumber(questions) {
  if (!questions || !Array.isArray(questions)) return [];
  return [...questions].sort((a, b) => {
    const numA = parseInt(getQuestionNumber(a)) || 0;
    const numB = parseInt(getQuestionNumber(b)) || 0;
    return numA - numB;
  });
}
