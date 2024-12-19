import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export const loadWorkers = (scene) => {
  const textureLoader = new THREE.TextureLoader();
  const textureBasePath = '/models/construction_worker_male/Textures/';
  const fbxLoader = new FBXLoader();

  // Worker positions along the road
  const workerPositions = [
    { x: -500, y: 0, z: 5 },
    { x: 30, y: 0, z: -5 },
    { x: 0, y: 0, z: 6 }
  ];

  // Load worker model for each position
  workerPositions.forEach((position) => {
    fbxLoader.load(
      '/models/construction_worker_male/Export/Construction_Male_07_facial.fbx',
      (model) => {
        // Apply textures to the model
        model.traverse((child) => {
          if (child.isMesh) {
            // Load and apply diffuse texture
            const diffuseTexture = textureLoader.load(
              `${textureBasePath}${child.material.name}_diffuse.png`,
              undefined,
              undefined,
              (error) => console.error('Error loading diffuse texture:', error)
            );
            child.material.map = diffuseTexture;
            
            // Load and apply normal map
            const normalTexture = textureLoader.load(
              `${textureBasePath}${child.material.name}_normal.png`,
              undefined,
              undefined,
              (error) => console.error('Error loading normal texture:', error)
            );
            child.material.normalMap = normalTexture;
            
            // Enable shadows
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Update material
            child.material.needsUpdate = true;
          }
        });

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Position the worker
        model.position.set(position.x, position.y, position.z);
        
        // Scale the model appropriately
        model.scale.setScalar(0.02);

        // Add random rotation to make workers face different directions
        model.rotation.y = Math.random() * Math.PI * 2;

        scene.add(model);
      },
      (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log(`Worker loading: ${percentComplete}% complete`);
      },
      (error) => {
        console.error('Error loading worker model:', error);
      }
    );
  });

  // Optional: Add worker animations
  const animateWorkers = () => {
    // Animation logic here if needed
    // You can add subtle movements or gestures
  };

  return {
    animateWorkers
  };
}; 