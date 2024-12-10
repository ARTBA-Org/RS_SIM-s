import * as THREE from 'three';

const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x202020, // Darker asphalt color
    roughness: 0.8,
    metalness: 0.1
  });

  const stripeMaterial = new THREE.MeshStandardMaterial({
    color: 0xCCCCCC, // Slightly dimmer white for road markings
    roughness: 0.5,
    metalness: 0
  });

export const createRoad = (roadLength, roadWidth, scene) => {
    const roadGeometry = new THREE.PlaneGeometry(roadLength, roadWidth);
    
    // Create road material with asphalt texture
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2; // Rotate to lay flat
    road.position.y = 0.01; // Slightly above ground to prevent z-fighting
    scene.add(road);

    // Add lane markers
    const stripeLength = 3; // 3 meters long
    const stripeGap = 6; // 6 meters gap
    const stripeWidth = 0.15; // 15cm wide
    const numStripes = Math.floor(roadLength / (stripeLength + stripeGap));
    
    // Create lane markers
    for (let i = 0; i < numStripes; i++) {
      const stripeGeometry = new THREE.PlaneGeometry(stripeLength, stripeWidth);
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      
      // Position each stripe
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.y = 0.02; // Slightly above road to prevent z-fighting
      stripe.position.x = -roadLength/2 + i * (stripeLength + stripeGap) + stripeLength/2;
      
      scene.add(stripe);
    }
}