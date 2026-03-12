export function calculateScore(votes: any, answers: any) {
  let score = 0;
  let correct = 0;

  Object.keys(answers).forEach((q) => {

    // user did not answer → ignore
    if (votes[q] === undefined || votes[q] === "") return;

    const userAns = String(votes[q]).trim().toLowerCase();
    const correctAns = String(answers[q]).trim().toLowerCase();

    if (userAns === correctAns) {
      score += 2;
      correct++;
    } else {
      score -= 1;
    }

  });

  // bonus if all 4 correct
  if (correct === 4) {
    score += 2;
  }

  return score;
}