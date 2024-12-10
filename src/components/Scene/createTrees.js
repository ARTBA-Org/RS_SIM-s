import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// Load and place trees


// Create a function to load the tree model
export const loadTreeModel = (gltfLoader) => {
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        '/models/tree/maple.gltf',
        (gltf) => {
          const model = gltf.scene;
          // Configure the tree model
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.material.needsUpdate = true;
            }
          });
          resolve(model);
        },
        undefined,
        (error) => {
          console.error('Error loading tree:', error);
          reject(error);
        }
      );
    });
  };

export const placeTrees = (treeModel, roadLength, roadWidth, scene) => {
    const numberOfTrees = 100;
    const minDistance = 10;
    const maxDistance = 50;
    
    for (let i = 0; i < numberOfTrees; i++) {
      const tree = treeModel.clone();
      
      // Random position along road length
      const x = (Math.random() - 0.5) * (roadLength - 20);
      
      // Random position on either side of road
      const side = Math.random() < 0.5 ? -1 : 1;
      const distanceFromRoad = minDistance + Math.random() * (maxDistance - minDistance);
      const z = side * (roadWidth / 2 + distanceFromRoad);
      
      // Random rotation and scale variation
      tree.rotation.y = Math.random() * Math.PI * 2;
      const scale = 0.15 + Math.random() * 0.1; // Adjusted scale for maple tree
      tree.scale.setScalar(scale * 0.5);
      
      // Adjust Y position if needed
      tree.position.set(x, 0, z);
      scene.add(tree);
    }
  };

