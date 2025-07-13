export const PLANT_TYPES = {
  flower: { maxHeight: 0.5, growthRate: 0.8 },
  bush: { maxHeight: 1.0, growthRate: 0.6 },
  small_tree: { maxHeight: 1.5, growthRate: 0.4 },
};

export const WATERING_BONUS_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const GROWTH_PENALTY_START = 48 * 60 * 60 * 1000; // 48 hours without water

export function generateRandomPosition(radius: number = 8): [number, number, number] {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * radius;
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  return [x, 0, z];
}

export function calculateGrowth(
  plantedAt: number,
  lastWatered: number,
  currentTime: number,
  baseGrowthRate: number = 0.5
): number {
  const timeSincePlanted = currentTime - plantedAt;
  const timeSinceWatered = currentTime - lastWatered;
  
  // Base growth over time
  let growth = Math.min(1, (timeSincePlanted / (7 * 24 * 60 * 60 * 1000)) * baseGrowthRate);
  
  // Watering bonus
  if (timeSinceWatered < WATERING_BONUS_DURATION) {
    growth *= 1.5; // 50% growth bonus for well-watered plants
  }
  
  // Penalty for not watering
  if (timeSinceWatered > GROWTH_PENALTY_START) {
    growth *= 0.5; // 50% growth penalty for neglected plants
  }
  
  return Math.min(1, growth);
}

export function isHealthyPlant(lastWatered: number, currentTime: number): boolean {
  const timeSinceWatered = currentTime - lastWatered;
  return timeSinceWatered < GROWTH_PENALTY_START;
}

export function getPlantHealthColor(lastWatered: number, currentTime: number, isGolden: boolean = false): string {
  if (isGolden) return '#FFD700'; // Golden
  
  const timeSinceWatered = currentTime - lastWatered;
  
  if (timeSinceWatered < WATERING_BONUS_DURATION) {
    return '#4ADE80'; // Healthy green
  } else if (timeSinceWatered < GROWTH_PENALTY_START) {
    return '#84CC16'; // Normal green
  } else {
    return '#EF4444'; // Unhealthy red
  }
}

export function generateDailyRewards(streak: number): {
  seeds: { tree: number; flower: number; bush: number; small_tree: number };
  tools: { watering_can: number; fertilizer: number; pruning_shears: number };
} {
  return {
    seeds: {
      tree: Math.min(2 + Math.floor(streak / 3), 5),
      flower: Math.min(5 + Math.floor(streak / 2), 10),
      bush: Math.min(3 + Math.floor(streak / 2), 8),
      small_tree: Math.min(1 + Math.floor(streak / 5), 3),
    },
    tools: {
      watering_can: Math.min(1 + Math.floor(streak / 7), 3),
      fertilizer: Math.min(Math.floor(streak / 10), 2),
      pruning_shears: Math.min(Math.floor(streak / 14), 1),
    },
  };
}

export const GOLDEN_TREE_CHANCE = 0.03; // 3%

export function rollForGoldenTree(): boolean {
  return Math.random() < GOLDEN_TREE_CHANCE;
}

export function isValidPlantPosition(
  position: [number, number, number],
  existingPositions: [number, number, number][],
  minDistance: number = 1.5
): boolean {
  for (const existing of existingPositions) {
    const distance = Math.sqrt(
      Math.pow(position[0] - existing[0], 2) +
      Math.pow(position[2] - existing[2], 2)
    );
    if (distance < minDistance) {
      return false;
    }
  }
  return true;
  }
