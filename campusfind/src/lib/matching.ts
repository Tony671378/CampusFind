import { Item, MatchScore } from '@/types';

// Stop words to remove from keyword comparisons
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'my', 'i', 'near', 'lost', 'found',
  'some', 'this', 'there', 'here', 'item', 'please', 'help'
]);

function extractTokens(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

function computeKeywordSimilarity(textA: string, textB: string): number {
  const tokensA = new Set(extractTokens(textA));
  const tokensB = new Set(extractTokens(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let common = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) {
      common += 1;
    } else {
      // Substring or prefix match for words like 'earbuds' and 'earbud'
      for (const tb of tokensB) {
        if ((t.length > 3 && tb.includes(t)) || (tb.length > 3 && t.includes(tb))) {
          common += 0.8;
          break;
        }
      }
    }
  }

  // Jaccard-like normalized similarity
  const union = new Set([...tokensA, ...tokensB]).size;
  return Math.min(1, (common * 1.5) / Math.max(1, union));
}

function computeDateScore(dateStrA: string, dateStrB: string): number {
  try {
    const dateA = new Date(dateStrA).getTime();
    const dateB = new Date(dateStrB).getTime();
    const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);

    if (diffDays <= 2) return 1.0;
    if (diffDays <= 5) return 0.8;
    if (diffDays <= 10) return 0.5;
    if (diffDays <= 20) return 0.2;
    return 0;
  } catch {
    return 0;
  }
}

export function calculateMatchScore(lostItem: Item, foundItem: Item): MatchScore {
  // 1. Category match: 30 points
  const categoryMatch = lostItem.category_id === foundItem.category_id;
  const categoryScore = categoryMatch ? 30 : 0;

  // 2. Keyword similarity in title & description: up to 35 points
  const textA = `${lostItem.title} ${lostItem.description || ''}`;
  const textB = `${foundItem.title} ${foundItem.description || ''}`;
  const keywordSim = computeKeywordSimilarity(textA, textB);
  const keywordScore = Math.round(keywordSim * 35);

  // 3. Location match: 15 points
  const locationMatch = lostItem.location_id === foundItem.location_id;
  const locationScore = locationMatch ? 15 : 0;

  // 4. Color match: 10 points
  let colorMatch = false;
  if (lostItem.color && foundItem.color) {
    const cA = lostItem.color.toLowerCase().trim();
    const cB = foundItem.color.toLowerCase().trim();
    colorMatch = cA === cB || cA.includes(cB) || cB.includes(cA);
  }
  const colorScore = colorMatch ? 10 : 0;

  // 5. Brand match: 10 points
  let brandMatch = false;
  if (lostItem.brand && foundItem.brand) {
    const bA = lostItem.brand.toLowerCase().trim();
    const bB = foundItem.brand.toLowerCase().trim();
    brandMatch = bA === bB || bA.includes(bB) || bB.includes(bA);
  }
  const brandScore = brandMatch ? 10 : 0;

  // 6. Date proximity: up to 10 points
  const dateProximity = computeDateScore(lostItem.date, foundItem.date);
  const dateScore = Math.round(dateProximity * 10);

  // Total raw score
  let totalScore = categoryScore + keywordScore + locationScore + colorScore + brandScore + dateScore;

  // Bonus: If category matches AND keyword overlap is strong, amplify confidence
  if (categoryMatch && keywordSim > 0.4) {
    totalScore += 5;
  }

  // Cap at 98% (never 100% since ownership must be verified)
  const finalScore = Math.min(98, Math.max(0, totalScore));

  return {
    lostItem,
    foundItem,
    score: finalScore,
    breakdown: {
      categoryMatch,
      categoryScore,
      keywordScore,
      locationMatch,
      locationScore,
      colorMatch,
      colorScore,
      brandMatch,
      brandScore,
      dateScore,
    },
  };
}

export function findMatchesForLostItem(lostItem: Item, allFoundItems: Item[], minThreshold = 40): MatchScore[] {
  const matches: MatchScore[] = [];

  for (const foundItem of allFoundItems) {
    // Only match with available found items
    if (foundItem.status === 'returned' || foundItem.status === 'closed') continue;

    const match = calculateMatchScore(lostItem, foundItem);
    if (match.score >= minThreshold) {
      matches.push(match);
    }
  }

  // Sort descending by score
  return matches.sort((a, b) => b.score - a.score);
}

export function findMatchesForFoundItem(foundItem: Item, allLostItems: Item[], minThreshold = 40): MatchScore[] {
  const matches: MatchScore[] = [];

  for (const lostItem of allLostItems) {
    if (lostItem.status === 'returned' || lostItem.status === 'closed') continue;

    const match = calculateMatchScore(lostItem, foundItem);
    if (match.score >= minThreshold) {
      matches.push(match);
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}
