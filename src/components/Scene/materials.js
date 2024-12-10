import * as THREE from 'three';

// Create and export materials object
export const materials = {
  // Road materials
  road: {
    surface: new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.7,
      metalness: 0.1
    }),
    marking: new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.5,
      metalness: 0.1
    }),
    shoulder: new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.9,
      metalness: 0.1
    })
  },

  // Ground and environment materials
  ground: {
    grass: new THREE.MeshStandardMaterial({
      color: 0x3b7d3b,
      roughness: 0.8,
      metalness: 0.2
    })
  },

  // Tree materials (arrays to store multiple instances)
  trees: {
    trunks: [],  // Will be populated when trees are loaded
    tops: []     // Will be populated when trees are loaded
  },

  // Weather-affected materials
  updateForWeather: (condition, intensity) => {
    // Update road surface based on weather
    switch(condition) {
      case 'rain':
      case 'drizzle':
        materials.road.surface.roughness = Math.max(0.3, 0.7 - intensity * 0.4);
        materials.road.surface.metalness = Math.min(0.3, 0.1 + intensity * 0.2);
        break;
      case 'snow':
        materials.road.surface.roughness = Math.min(0.9, 0.7 + intensity * 0.2);
        materials.road.surface.metalness = 0.1;
        break;
      default:
        materials.road.surface.roughness = 0.7;
        materials.road.surface.metalness = 0.1;
    }

    // Update grass/ground based on weather
    switch(condition) {
      case 'rain':
      case 'drizzle':
        materials.ground.grass.color.setHex(0x2a5c2a); // Darker when wet
        materials.ground.grass.roughness = 0.6;
        break;
      case 'snow':
        materials.ground.grass.color.setHex(0xffffff); // White when snowy
        materials.ground.grass.roughness = 0.9;
        break;
      default:
        materials.ground.grass.roughness = 0.8;
    }
  }
} 