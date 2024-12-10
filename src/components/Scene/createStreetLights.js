import * as THREE from 'three';

export const createStreetLight = () => {
  const streetLight = new THREE.Group();
  
  // Pole material
  const poleMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.7,
    metalness: 0.5
  });

  // Vertical pole
  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 7, 8);
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.y = 3.5;
  streetLight.add(pole);

  // Horizontal arm
  const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
  const arm = new THREE.Mesh(armGeometry, poleMaterial);
  arm.position.y = 6.8;
  arm.position.z = 1.5;
  arm.rotation.x = Math.PI / 2;
  streetLight.add(arm);

  // Light fixture
  const fixtureGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
  const fixtureMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.5,
    metalness: 0.8
  });
  const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
  fixture.position.y = 6.8;
  fixture.position.z = 2.8;
  fixture.rotation.x = Math.PI / 2;
  streetLight.add(fixture);

  // Add the actual light
  const light = new THREE.SpotLight(0xffffaa, 2);
  light.position.set(0, 6.8, 2.8);
  light.target.position.set(0, 0, 2.8);
  light.angle = Math.PI / 4;
  light.penumbra = 0.2;
  light.decay = 1;
  light.distance = 30;
  light.castShadow = true;
  
  // Improve shadow quality
  light.shadow.mapSize.width = 512;
  light.shadow.mapSize.height = 512;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 30;
  
  streetLight.add(light);
  streetLight.add(light.target);

  // Add metadata to the spotlight
  light.userData.isStreetLight = true;
  light.visible = !lightingRef.current.isDaytime; // Initially hidden during day

  return streetLight;
};

export const placeStreetLights = (roadLength, roadWidth, scene) => {
  const spacing = 30;
  const offset = 4;
  const numLights = Math.floor(roadLength / spacing);
  
  for (let i = 0; i < numLights; i++) {
    const leftLight = createStreetLight();
    leftLight.position.set(
      -roadLength/2 + i * spacing + spacing/2,
      0,
      -(roadWidth/2 + offset)
    );
    leftLight.rotation.y = Math.PI / 2;
    //scene.add(leftLight);
    lightingRef.current.streetLights.push(leftLight);

    const rightLight = createStreetLight();
    rightLight.position.set(
      -roadLength/2 + i * spacing + spacing/2,
      0,
      roadWidth/2 + offset
    );
    rightLight.rotation.y = -Math.PI / 2;
    //scene.add(rightLight);
    lightingRef.current.streetLights.push(rightLight);
  }
};

placeStreetLights();