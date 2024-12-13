import * as THREE from 'three';

 // Add these two functions right after your existing refs, before useEffect
 export const createDrum = () => {
    const drum = new THREE.Group();
    
    // Create the main cylinder (barrel)
    const barrelGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.9, 32);
    const barrelMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF4500, // Orange color
      roughness: 0.7,
      metalness: 0.1
    });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    
    // Create reflective stripes
    const stripeHeight = 0.15;
    const stripeGeometry = new THREE.CylinderGeometry(0.351, 0.351, stripeHeight, 32);
    const stripeMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.4,
      metalness: 0.6,
      emissive: 0xFFFFFF,
      emissiveIntensity: 0.2
    });

    // Add three reflective stripes
    const stripePositions = [-0.25, 0, 0.25];
    stripePositions.forEach(yPos => {
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      stripe.position.y = yPos;
      drum.add(stripe);
    });
    
    drum.add(barrel);
    return drum;
  };

  export const placeDrums = (roadLength, scene) => {
    const drumSpacing = 4.572; // 15 feet in meters
    const drumOffset = 4.5; // Distance from center of road
    const startOffset = -roadLength/2; // Start from beginning of road
    
    // Calculate number of drums needed
    const numDrums = Math.floor(roadLength / drumSpacing);
    
    // Place drums on both sides
    for (let i = 0; i < numDrums; i++) {
      const xPos = startOffset + (i * drumSpacing);
      
      // Left side drum
      const leftDrum = createDrum();
      leftDrum.position.set(xPos, 0.45, -drumOffset);
      scene.add(leftDrum);
      
      // Right side drum
      const rightDrum = createDrum();
      rightDrum.position.set(xPos, 0.45, drumOffset);
      scene.add(rightDrum);
    }
  };