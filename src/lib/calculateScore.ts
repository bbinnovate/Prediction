export function calculateScore(votes: any, answers: any) {
  let score = 0;
  let correct = 0;

  Object.keys(answers).forEach((q) => {
    if (votes[q] === answers[q]) {
      score += 2;
      correct++;
    }
  });

  if (correct === 5) {
    score += 2;
  }

  return score;
}
