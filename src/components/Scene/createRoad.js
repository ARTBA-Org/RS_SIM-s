import * as THREE from 'three';

const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x151515, // Darker asphalt color
    roughness: 0.8,
    metalness: 0.1
  });

  const stripeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF, // Slightly dimmer white for road markings
    roughness: 0,   // Reduced roughness for more shine
    metalness: 0,   // Slight metalness for better reflection
    emissive: 0xFFFFFF, // Base emissive glow
    emissiveIntensity: 0.5
  });

  const retroReflectiveEffect = new THREE.TextureLoader().load('/path/to/gradient.png'); // Optional: add gradient texture
  stripeMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.viewPosition = { value: new THREE.Vector3() };
    
    // Add to fragment shader - simplified retroreflective effect
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `
        #include <emissivemap_fragment>
        
        // Calculate view direction
        vec3 viewDir = normalize(vViewPosition);
        // Simulate retroreflection
        float retroReflection = pow(max(dot(normal, viewDir), 0.0), 2.0);
        
        // Increase emissive based on view angle
        totalEmissiveRadiance += emissive * retroReflection * 2.0;
        `
    );
  };

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