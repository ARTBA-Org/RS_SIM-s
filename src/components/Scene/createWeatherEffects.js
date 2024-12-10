import * as THREE from 'three';

export const createWeatherEffects = (scene, gui, materials) => {
  // Create particle systems for rain and snow
  const createParticleSystem = (color, size, count) => {
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = Math.random() * 400 - 200;     // x
      positions[i + 1] = Math.random() * 200;       // y
      positions[i + 2] = Math.random() * 400 - 200; // z
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: color,
      size: size,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    return new THREE.Points(particles, particleMaterial);
  };

  // Create rain and snow systems
  const rainSystem = createParticleSystem(0xaaaaaa, 0.1, 15000);
  const snowSystem = createParticleSystem(0xffffff, 0.2, 10000);
  rainSystem.visible = false;
  snowSystem.visible = false;
  scene.add(rainSystem);
  scene.add(snowSystem);

  // Weather parameters
  const params = {
    condition: 'clear',
    intensity: 0.5,
    windSpeed: 1.0
  };

  // Create GUI controls
  const weatherFolder = gui.addFolder('Weather Effects');
  
  weatherFolder.add(params, 'condition', ['clear', 'rain', 'snow', 'drizzle'])
    .onChange((value) => {
      updateWeather(value);
    });
    
  weatherFolder.add(params, 'intensity', 0, 1)
    .onChange((value) => {
      updateIntensity(value);
    });
    
  weatherFolder.add(params, 'windSpeed', 0, 2)
    .onChange((value) => {
      updateWindSpeed(value);
    });

  weatherFolder.open();

  // Update functions
  const updateWeather = (condition) => {
    // Hide all weather systems first
    rainSystem.visible = false;
    snowSystem.visible = false;

    // Update material properties
    Object.values(materials.trees.tops).forEach(material => {
      switch(condition) {
        case 'rain':
        case 'drizzle':
          material.roughness = Math.min(0.9, 0.8 + params.intensity * 0.2);
          rainSystem.visible = true;
          break;
        case 'snow':
          material.roughness = Math.max(0.3, 0.8 - params.intensity * 0.5);
          snowSystem.visible = true;
          break;
        default:
          material.roughness = 0.8;
      }
      material.needsUpdate = true;
    });
  };

  const updateIntensity = (intensity) => {
    rainSystem.material.opacity = intensity * 0.6;
    snowSystem.material.opacity = intensity * 0.6;
    updateWeather(params.condition);
  };

  const updateWindSpeed = (speed) => {
    params.windSpeed = speed;
  };

  // Animation function
  const animate = () => {
    if (rainSystem.visible) {
      rainSystem.geometry.attributes.position.array.forEach((value, i) => {
        if (i % 3 === 1) { // y position
          rainSystem.geometry.attributes.position.array[i] -= 2 * params.intensity;
          if (rainSystem.geometry.attributes.position.array[i] < 0) {
            rainSystem.geometry.attributes.position.array[i] = 200;
          }
        }
        if (i % 3 === 0) { // x position - wind effect
          rainSystem.geometry.attributes.position.array[i] += params.windSpeed * 0.1;
          if (rainSystem.geometry.attributes.position.array[i] > 200) {
            rainSystem.geometry.attributes.position.array[i] = -200;
          }
        }
      });
      rainSystem.geometry.attributes.position.needsUpdate = true;
    }

    if (snowSystem.visible) {
      snowSystem.geometry.attributes.position.array.forEach((value, i) => {
        if (i % 3 === 1) { // y position
          snowSystem.geometry.attributes.position.array[i] -= 0.2 * params.intensity;
          if (snowSystem.geometry.attributes.position.array[i] < 0) {
            snowSystem.geometry.attributes.position.array[i] = 200;
          }
        }
        if (i % 3 === 0) { // x position - wind effect
          snowSystem.geometry.attributes.position.array[i] += params.windSpeed * 0.05;
          if (snowSystem.geometry.attributes.position.array[i] > 200) {
            snowSystem.geometry.attributes.position.array[i] = -200;
          }
        }
      });
      snowSystem.geometry.attributes.position.needsUpdate = true;
    }
  };

  return {
    animate,
    updateWeather,
    updateIntensity,
    updateWindSpeed,
    params
  };
}; 