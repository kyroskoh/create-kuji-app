const toNumber = (value) => Number.parseFloat(value) || 0;

const normalizePrize = (prize) => ({
  ...prize,
  quantity: Number.parseInt(prize.quantity, 10) || 0,
  weight: toNumber(prize.weight) || 0
});

const clonePrizeList = (prizes) => prizes.map((prize) => ({ ...prize }));

export function calculateProbabilities(prizes, mode = "basic") {
  const entries = prizes
    .map(normalizePrize)
    .filter((prize) => prize.quantity > 0 && prize.weight > 0);

  if (!entries.length) {
    return [];
  }

  let totalWeight = 0;
  if (mode === "advanced") {
    // In advanced mode, multiply weight by quantity for each prize
    totalWeight = entries.reduce((sum, prize) => sum + prize.weight * prize.quantity, 0);
  } else {
    // In basic mode, just sum the weights
    totalWeight = entries.reduce((sum, prize) => sum + prize.weight, 0);
  }

  if (totalWeight <= 0) {
    return entries.map((prize) => ({ prize, probability: 0 }));
  }

  return entries.map((prize) => {
    const weightContribution = mode === "advanced" ? prize.weight * prize.quantity : prize.weight;
    return {
      prize,
      probability: weightContribution / totalWeight
    };
  });
}

export function drawPrize(prizes, mode = "basic") {
  const pool = clonePrizeList(prizes).map(normalizePrize);
  const indexed = pool.map((prize, index) => ({ prize, index })).filter(({ prize }) => prize.quantity > 0 && prize.weight > 0);

  if (!indexed.length) {
    return null;
  }

  const totalWeight = indexed.reduce((sum, { prize }) => {
    const weightContribution = mode === "advanced" ? prize.weight * prize.quantity : prize.weight;
    return sum + weightContribution;
  }, 0);

  if (totalWeight <= 0) {
    return null;
  }

  let target = Math.random() * totalWeight;
  let selected = indexed[0];

  for (const entry of indexed) {
    const weightContribution = mode === "advanced" ? entry.prize.weight * entry.prize.quantity : entry.prize.weight;
    if (target < weightContribution) {
      selected = entry;
      break;
    }
    target -= weightContribution;
  }

  const chosenPrize = { ...selected.prize };
  const remaining = pool.map((prize, idx) =>
    idx === selected.index
      ? { ...prize, quantity: Math.max(0, prize.quantity - 1) }
      : { ...prize }
  );

  return {
    prize: chosenPrize,
    remaining
  };
}

export function executeDraw(prizes, count, mode = "basic") {
  let pool = clonePrizeList(prizes);
  const results = [];

  for (let i = 0; i < count; i += 1) {
    const outcome = drawPrize(pool, mode);
    if (!outcome) break;
    results.push(outcome.prize);
    pool = outcome.remaining;
  }

  return { results, remaining: pool };
}