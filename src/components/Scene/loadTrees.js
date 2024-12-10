import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';

export const loadTrees = (scene) => {
  const tgaLoader = new TGALoader();
  const objLoader = new OBJLoader();
  
  // Load textures
  const treeTexture = tgaLoader.load('/models/tree/T_Pine_02_OP.tga');
  const treeNormal = tgaLoader.load('/models/tree/T_Pine_02_N.tga');
  const treeRoughness = tgaLoader.load('/models/tree/T_Pine_02_OP.tga');

  const treeMaterial = new THREE.MeshStandardMaterial({
    map: treeTexture,
    normalMap: treeNormal,
    roughnessMap: treeRoughness,
    roughness: 0.8,
    metalness: 0
  });

  // Load tree model
  objLoader.load(
    '/models/tree/SM_Pine_b_04.obj',
    (treeObject) => {
      treeObject.traverse((child) => {
        if (child.isMesh) {
          child.material = treeMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      placeTrees(scene, treeObject);
    },
    (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
    (error) => console.error('Error loading tree model:', error)
  );
};

const placeTrees = (scene, treeObject) => {
  const roadWidth = 8;
  const roadLength = 402.336;
  const minDistance = 10;
  const maxDistance = 50;
  const numberOfTrees = 100;

  for (let i = 0; i < numberOfTrees; i++) {
    const tree = treeObject.clone();
    const x = (Math.random() - 0.5) * (roadLength - 20);
    const side = Math.random() < 0.5 ? -1 : 1;
    const distanceFromRoad = minDistance + Math.random() * (maxDistance - minDistance);
    const z = side * (roadWidth / 2 + distanceFromRoad);
    
    tree.rotation.y = Math.random() * Math.PI * 2;
    const scale = 0.008 + Math.random() * 0.004;
    tree.scale.setScalar(scale);
    tree.position.set(x, 0, z);
    
    scene.add(tree);
  }
}; 