import { DEFAULT_TIER_SEQUENCE } from "./tierColors.js";

const toNumber = (value) => Number.parseFloat(value) || 0;

const normalizePrize = (prize) => ({
  ...prize,
  quantity: Number.parseInt(prize.quantity, 10) || 0,
  weight: toNumber(prize.weight) || 0
});

const clonePrizeList = (prizes) => prizes.map((prize) => ({ ...prize }));

const tierInfluence = (tier) => {
  const upper = String(tier || "").trim().toUpperCase();
  const index = DEFAULT_TIER_SEQUENCE.indexOf(upper);
  if (index === -1) {
    return 1;
  }
  return 1 / (index + 2); // Tier S (index 0) gets 0.5, lower tiers trend toward zero
};

const weightContribution = (prize, mode) => {
  const baseWeight = prize.weight;
  if (mode !== "advanced") {
    return baseWeight;
  }
  return baseWeight * Math.max(prize.quantity, 0) * tierInfluence(prize.tier);
};

export function calculateProbabilities(prizes, mode = "basic") {
  const entries = prizes
    .map(normalizePrize)
    .filter((prize) => prize.quantity > 0 && prize.weight > 0);

  if (!entries.length) {
    return [];
  }

  const totalWeight = entries.reduce((sum, prize) => sum + weightContribution(prize, mode), 0);
  if (totalWeight <= 0) {
    return entries.map((prize) => ({ prize, probability: 0 }));
  }

  return entries.map((prize) => ({
    prize,
    probability: weightContribution(prize, mode) / totalWeight
  }));
}

export function drawPrize(prizes, mode = "basic") {
  const pool = clonePrizeList(prizes).map(normalizePrize);
  const indexed = pool
    .map((prize, index) => ({ prize, index }))
    .filter(({ prize }) => prize.quantity > 0 && prize.weight > 0);

  if (!indexed.length) {
    return null;
  }

  const totalWeight = indexed.reduce((sum, { prize }) => sum + weightContribution(prize, mode), 0);
  if (totalWeight <= 0) {
    return null;
  }

  let target = Math.random() * totalWeight;
  let selected = indexed[0];

  for (const entry of indexed) {
    const contribution = weightContribution(entry.prize, mode);
    if (target < contribution) {
      selected = entry;
      break;
    }
    target -= contribution;
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