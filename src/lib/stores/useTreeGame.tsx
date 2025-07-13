import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface TreeData {
  id: string;
  position: [number, number, number];
  growth: number;
  isGolden: boolean;
  plantedAt: number;
  lastWatered: number;
  isWatered: boolean;
}

export interface PlantData {
  id: string;
  position: [number, number, number];
  type: 'flower' | 'bush' | 'small_tree';
  growth: number;
  plantedAt: number;
  lastWatered: number;
  isWatered: boolean;
}

export interface CloudData {
  id: string;
  position: [number, number, number];
  isRaining: boolean;
  cooldown: number;
}

export interface GameInventory {
  seeds: {
    tree: number;
    flower: number;
    bush: number;
    small_tree: number;
  };
  tools: {
    watering_can: number;
    fertilizer: number;
    pruning_shears: number;
  };
  specialItems: string[];
}

interface TreeGameState {
  trees: TreeData[];
  plants: PlantData[];
  clouds: CloudData[];
  inventory: GameInventory;
  waterLevel: number;
  lastCheckIn: number;
  dailyStreak: number;
  
  initializeGame: () => void;
  plantSeed: (seedType: string, position: [number, number, number]) => void;
  waterPlant: (cloudId: string) => void;
  updateClouds: (delta: number) => void;
  collectDailyReward: () => void;
  checkDailyReward: () => void;
  saveGame: () => void;
  loadGame: () => void;
  useTool: (toolType: string, targetId?: string) => void;
  resetGame: () => void;
}

const initialInventory: GameInventory = {
  seeds: {
    tree: 5,
    flower: 10,
    bush: 8,
    small_tree: 3,
  },
  tools: {
    watering_can: 3,
    fertilizer: 2,
    pruning_shears: 1,
  },
  specialItems: [],
};

export const useTreeGame = create<TreeGameState>()(
  subscribeWithSelector((set, get) => ({
    trees: [],
    plants: [],
    clouds: [],
    inventory: initialInventory,
    waterLevel: 100,
    lastCheckIn: Date.now(),
    dailyStreak: 0,

    initializeGame: () => {
      const saved = localStorage.getItem('treeGameState');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          set(state);
          console.log('Game loaded from localStorage');
        } catch (error) {
          console.error('Failed to load game state:', error);
        }
      }
      
      const { clouds } = get();
      if (clouds.length === 0) {
        set({
          clouds: [
            {
              id: 'cloud-1',
              position: [-5, 3, -2],
              isRaining: false,
              cooldown: 0,
            },
            {
              id: 'cloud-2',
              position: [5, 3, 2],
              isRaining: false,
              cooldown: 0,
            },
            {
              id: 'cloud-3',
              position: [0, 3, 5],
              isRaining: false,
              cooldown: 0,
            },
          ],
        });
      }
    },

    plantSeed: (seedType: string, position: [number, number, number]) => {
      const { inventory, trees, plants } = get();
      
      if (seedType === 'tree' && inventory.seeds.tree > 0) {
        const isGolden = Math.random() < 0.03;
        const newTree: TreeData = {
          id: `tree-${Date.now()}-${Math.random()}`,
          position,
          growth: 0,
          isGolden,
          plantedAt: Date.now(),
          lastWatered: Date.now(),
          isWatered: false,
        };
        
        set({
          trees: [...trees, newTree],
          inventory: {
            ...inventory,
            seeds: { ...inventory.seeds, tree: inventory.seeds.tree - 1 },
          },
        });
      } else if (['flower', 'bush', 'small_tree'].includes(seedType)) {
        const seedKey = seedType as 'flower' | 'bush' | 'small_tree';
        if (inventory.seeds[seedKey] > 0) {
          const newPlant: PlantData = {
            id: `plant-${Date.now()}-${Math.random()}`,
            position,
            type: seedKey,
            growth: 0,
            plantedAt: Date.now(),
            lastWatered: Date.now(),
            isWatered: false,
          };
          
          set({
            plants: [...plants, newPlant],
            inventory: {
              ...inventory,
              seeds: { ...inventory.seeds, [seedKey]: inventory.seeds[seedKey] - 1 },
            },
          });
        }
      }
    },

    waterPlant: (cloudId: string) => {
      const { clouds, trees, plants } = get();
      const cloud = clouds.find(c => c.id === cloudId);
      
      if (!cloud || cloud.cooldown > 0) return;
      
      set({
        clouds: clouds.map(c => 
          c.id === cloudId 
            ? { ...c, isRaining: true, cooldown: 5000 } 
            : c
        ),
      });
      
      const waterRadius = 3;
      const currentTime = Date.now();
      
      const updatedTrees = trees.map(tree => {
        const distance = Math.sqrt(
          Math.pow(tree.position[0] - cloud.position[0], 2) +
          Math.pow(tree.position[2] - cloud.position[2], 2)
        );
        
        if (distance <= waterRadius) {
          return { ...tree, lastWatered: currentTime, isWatered: true };
        }
        return tree;
      });
      
      const updatedPlants = plants.map(plant => {
        const distance = Math.sqrt(
          Math.pow(plant.position[0] - cloud.position[0], 2) +
          Math.pow(plant.position[2] - cloud.position[2], 2)
        );
        
        if (distance <= waterRadius) {
          return { ...plant, lastWatered: currentTime, isWatered: true };
        }
        return plant;
      });
      
      set({ trees: updatedTrees, plants: updatedPlants });
      
      setTimeout(() => {
        set(state => ({
          clouds: state.clouds.map(c => 
            c.id === cloudId ? { ...c, isRaining: false } : c
          ),
        }));
      }, 2000);
    },

    updateClouds: (delta: number) => {
      set(state => ({
        clouds: state.clouds.map(cloud => ({
          ...cloud,
          cooldown: Math.max(0, cloud.cooldown - delta),
        })),
      }));
    },

    collectDailyReward: () => {
      const { lastCheckIn, dailyStreak, inventory } = get();
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (now - lastCheckIn >= oneDay) {
        const newStreak = dailyStreak + 1;
        const rewards = {
          seeds: {
            tree: Math.min(2 + Math.floor(newStreak / 3), 5),
            flower: Math.min(5 + Math.floor(newStreak / 2), 10),
            bush: Math.min(3 + Math.floor(newStreak / 2), 8),
            small_tree: Math.min(1 + Math.floor(newStreak / 5), 3),
          },
          tools: {
            watering_can: Math.min(1 + Math.floor(newStreak / 7), 3),
            fertilizer: Math.min(Math.floor(newStreak / 10), 2),
            pruning_shears: Math.min(Math.floor(newStreak / 14), 1),
          },
        };
        
        set({
          lastCheckIn: now,
          dailyStreak: newStreak,
          inventory: {
            ...inventory,
            seeds: {
              tree: inventory.seeds.tree + rewards.seeds.tree,
              flower: inventory.seeds.flower + rewards.seeds.flower,
              bush: inventory.seeds.bush + rewards.seeds.bush,
              small_tree: inventory.seeds.small_tree + rewards.seeds.small_tree,
            },
            tools: {
              watering_can: inventory.tools.watering_can + rewards.tools.watering_can,
              fertilizer: inventory.tools.fertilizer + rewards.tools.fertilizer,
              pruning_shears: inventory.tools.pruning_shears + rewards.tools.pruning_shears,
            },
            specialItems: inventory.specialItems,
          },
        });
      }
    },

    checkDailyReward: () => {
      const { lastCheckIn } = get();
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      return now - lastCheckIn >= oneDay;
    },

    saveGame: () => {
      const state = get();
      localStorage.setItem('treeGameState', JSON.stringify(state));
    },

    loadGame: () => {
      const saved = localStorage.getItem('treeGameState');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          set(state);
        } catch (error) {
          console.error('Failed to load game state:', error);
        }
      }
    },

    useTool: (toolType: string, targetId?: string) => {
      const { inventory, trees, plants } = get();
      const toolKey = toolType as keyof typeof inventory.tools;
      
      if (inventory.tools[toolKey] <= 0) return;
      
      const currentTime = Date.now();
      
      switch (toolType) {
        case 'watering_can':
          set({
            trees: trees.map(tree => ({ ...tree, lastWatered: currentTime, isWatered: true })),
            plants: plants.map(plant => ({ ...plant, lastWatered: currentTime, isWatered: true })),
            inventory: {
              ...inventory,
              tools: { ...inventory.tools, watering_can: inventory.tools.watering_can - 1 },
            },
          });
          console.log('💧 Watering can used! All plants watered and glowing blue!');
          break;
          
        case 'fertilizer':
          set({
            trees: trees.map(tree => ({ ...tree, growth: Math.min(1, tree.growth + 0.3) })),
            plants: plants.map(plant => ({ ...plant, growth: Math.min(1, plant.growth + 0.3) })),
            inventory: {
              ...inventory,
              tools: { ...inventory.tools, fertilizer: inventory.tools.fertilizer - 1 },
            },
          });
          console.log('🌱 Fertilizer used! All plants boosted and glowing green!');
          break;
          
        case 'pruning_shears':
          const twoDaysAgo = currentTime - (2 * 24 * 60 * 60 * 1000);
          const healthyTrees = trees.filter(tree => tree.lastWatered > twoDaysAgo);
          const healthyPlants = plants.filter(plant => plant.lastWatered > twoDaysAgo);
          
          set({
            trees: healthyTrees.map(tree => ({ ...tree, growth: Math.min(1, tree.growth + 0.2) })),
            plants: healthyPlants.map(plant => ({ ...plant, growth: Math.min(1, plant.growth + 0.2) })),
            inventory: {
              ...inventory,
              tools: { ...inventory.tools, pruning_shears: inventory.tools.pruning_shears - 1 },
            },
          });
          console.log('✂️ Pruning shears used! Unhealthy plants removed, healthy ones boosted and glowing!');
          break;
      }
    },

    resetGame: () => {
      set({
        trees: [],
        plants: [],
        clouds: [
          {
            id: 'cloud-1',
            position: [-5, 3, -2],
            isRaining: false,
            cooldown: 0,
          },
          {
            id: 'cloud-2',
            position: [5, 3, 2],
            isRaining: false,
            cooldown: 0,
          },
          {
            id: 'cloud-3',
            position: [0, 3, 5],
            isRaining: false,
            cooldown: 0,
          },
        ],
        inventory: initialInventory,
        waterLevel: 100,
        lastCheckIn: Date.now(),
        dailyStreak: 0,
      });
      localStorage.removeItem('treeGameState');
    },
  }))
);
