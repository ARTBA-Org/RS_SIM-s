import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

let speedController;

export const getSpeedOptions = (useMetric) => {
    if (useMetric) {
      return {
        'Slow (16 km/h)': 10,
        'Normal (40 km/h)': 25,
        'Fast (72 km/h)': 45,
        'Very Fast (97 km/h)': 60
      };
    }
    return {
      'Slow (10 mph)': 10,
      'Normal (25 mph)': 25,
      'Fast (45 mph)': 45,
      'Very Fast (60 mph)': 60
    };
};

export const createGUI = (
    speedRef, 
    coordsRef, 
    vehicleControlsRef, 
    lightingRef, 
    wipersRef, 
    scene, 
    snowRef, 
    rainRef,
    carRef
) => {
    const gui = new GUI();
    gui.close();
    
    // Speed Controls Folder
    const speedFolder = gui.addFolder('Car Controls');
    speedFolder.close();
    
    // Add metric system toggle
    speedFolder.add(coordsRef.current, 'useMetric')
      .name('Use Metric System')
      .onChange((value) => {
        coordsRef.current.useMetric = value;
        gui.updateDisplay();
      });

    // Add speed display
    const speedDisplay = speedFolder.add(
      { currentSpeed: '0' },
      'currentSpeed'
    )
    .name('Current Speed')
    .disable();

  

    // Add distance display
    const distanceController = speedFolder.add(
      { distance: '0.0 meters' },
      'distance'
    )
    .name('Distance to Worker')
    .disable();



    // Weather Controls Folder
    const weatherFolder = gui.addFolder('Weather Effects');
    weatherFolder.close();
    
    weatherFolder.add(speedRef.current, 'pavementCondition', {
      'Normal': 'normal',
      'Wet from Drizzle': 'drizzle',
      'Wet from Rain': 'rain',
      'Snowy': 'snow',
      'Icy': 'ice'
    })
    .name('Road Condition')
    .onChange((value) => {
      // Remove any existing weather effects
      if (speedRef.current.activeWeather) {
        scene.remove(speedRef.current.activeWeather);
        speedRef.current.activeWeather = null;
      }

      // Add new weather effect based on condition
      switch(value) {
        case 'rain':
          speedRef.current.activeWeather = createRain(false);
          rainRef.current = speedRef.current.activeWeather;  // Store reference
          scene.add(speedRef.current.activeWeather);
          wipersRef.current.isActive = true;
          wipersRef.current.speed = 0.08;
          break;
        case 'drizzle':
          speedRef.current.activeWeather = createRain(true);
          rainRef.current = speedRef.current.activeWeather;  // Store reference
          scene.add(speedRef.current.activeWeather);
          wipersRef.current.isActive = true;
          wipersRef.current.speed = 0.05;
          break;
        case 'snow':
          speedRef.current.activeWeather = createSnow();
          snowRef.current = speedRef.current.activeWeather;  // Store reference
          scene.add(speedRef.current.activeWeather);
          wipersRef.current.isActive = true;
          wipersRef.current.speed = 0.05;
          break;
        default:
          snowRef.current = null;  // Clear reference
          rainRef.current = null;  // Clear reference
          wipersRef.current.isActive = false;
          break;
      }
    });



    // Environment Controls Folder
    const environmentFolder = gui.addFolder('Environment');
    environmentFolder.close();
    
    environmentFolder.add(lightingRef.current, 'isDaytime')
      .name('Daytime')
      .onChange((value) => {
        updateTimeOfDay(value, lightingRef, scene);
      });

    return {
      gui,
      speedDisplay,
      distanceController
    };
};

export const updateSpeedController = (speedFolder, speedRef, useMetric) => {
    if (speedController) {
      try {
        speedController.destroy();
      } catch (error) {
        console.debug('Controller was already removed');
      }
    }
    
    speedController = speedFolder.add(
      speedRef.current,
      'speed',
      getSpeedOptions(useMetric)
    )
    .name('Speed')
    .onChange((value) => {
      speedRef.current.speed = value;
      if (!speedRef.current.isBraking) {
        speedRef.current.currentSpeed = value;
      }
    });
};

// Add this function to handle day/night transitions
const updateTimeOfDay = (isDaytime, lightingRef, scene) => {
    const duration = 1000;
    const startTime = Date.now();
    
    const startAmbient = lightingRef.current.ambientLight.intensity;
    const startDirectional = lightingRef.current.directionalLight.intensity;
    
    // Ensure we have Color objects for both start and target
    const startSky = scene.background instanceof THREE.Color ? 
        scene.background.clone() : 
        new THREE.Color(scene.background);
    
    const targetSky = new THREE.Color(isDaytime ? lightingRef.current.skyColor : lightingRef.current.nightColor);


    const targetAmbient = isDaytime ? 0.6 : 0;
    const targetDirectional = isDaytime ? 0.8 : 0.0;

    // Handle street light visibility
    scene.traverse((child) => {
      if (child.isSpotLight && child.userData.isStreetLight) {
        child.visible = !isDaytime;
      }
    });

    // Animate the transition
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const t = progress * progress * (3 - 2 * progress); // ease function

      // Update lighting intensities
      lightingRef.current.ambientLight.intensity = startAmbient + (targetAmbient - startAmbient) * t;
      lightingRef.current.directionalLight.intensity = startDirectional + (targetDirectional - startDirectional) * t;

      if (!scene.background) scene.background = new THREE.Color();
      scene.background = targetSky;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
};

const createParticleSystem = (isSnow = false) => {
  const particles = new THREE.BufferGeometry();
  const count = isSnow ? 10000 : 15000;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = Math.random() * 400 - 200;     // x
    positions[i + 1] = Math.random() * 200;       // y
    positions[i + 2] = Math.random() * 400 - 200; // z
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  let material;
  
  if (isSnow) {
    // Create a canvas to draw the snowflake
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Draw snowflake
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    
    // Draw six-pointed snowflake
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate(i * Math.PI / 3);
      
      // Main branch
      ctx.fillRect(-1, -12, 2, 24);
      
      // Side crystals
      for (let j = 1; j <= 3; j++) {
        const y = j * 6;
        ctx.fillRect(-4, -y, 8, 2);  // Horizontal crystal
        ctx.fillRect(-4, y-2, 8, 2); // Horizontal crystal
      }
      
      ctx.restore();
    }
    
    // Create texture from canvas
    const snowflakeTexture = new THREE.CanvasTexture(canvas);
    
    material = new THREE.PointsMaterial({
      size: 0.5,
      map: snowflakeTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: false,
      sizeAttenuation: true
    });
  } else {
    // Rain material remains unchanged
    material = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
  }
  
  return new THREE.Points(particles, material);
};

const createSnow = () => {
  return createParticleSystem(true);
};

const createRain = (isDrizzle) => {
  const rain = createParticleSystem(false);
  if (isDrizzle) {
    rain.material.size = 0.05;
    rain.material.opacity = 0.4;
  }
  return rain;
};