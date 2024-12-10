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

export const createGUI = (speedRef, coordsRef, vehicleControlsRef, lightingRef, wipersRef, scene) => {
    const gui = new GUI();
    
    // Speed Controls Folder
    const speedFolder = gui.addFolder('Car Controls');
    
    // Create initial speed controller
    updateSpeedController(speedFolder, speedRef, coordsRef.current.useMetric);

    // Add metric system toggle
    speedFolder.add(coordsRef.current, 'useMetric')
      .name('Use Metric System')
      .onChange((value) => {
        coordsRef.current.useMetric = value;
        updateSpeedController(speedFolder, speedRef, value);
        gui.updateDisplay();
      });

    // Add speed display
    const speedDisplay = speedFolder.add(
      { currentSpeed: '0' },
      'currentSpeed'
    )
    .name('Current Speed')
    .disable();

    // Add headlight mode control
    speedFolder.add(speedRef.current, 'headlightMode', {
        'Regular Beam': 'regular',
        'High Beam': 'high'
    })
    .name('Headlights');

    // Add brake button
    const brakeButton = {
      brake: function() {
        speedRef.current.isBraking = true;
        vehicleControlsRef.current.isBraking = true;
      }
    };

    const brakeController = speedFolder.add(brakeButton, 'brake').name('BRAKE');
    brakeController.domElement.addEventListener('mousedown', () => {
      speedRef.current.isBraking = true;
      vehicleControlsRef.current.isBraking = true;
    });

    // Style brake button
    const brakeElement = brakeController.domElement;
    const brakeButtonElement = brakeElement.querySelector('button');
    if (brakeButtonElement) {
      brakeButtonElement.style.backgroundColor = '#ff4444';
    }

    // Add distance display
    const distanceController = speedFolder.add(
      { distance: '0.0 meters' },
      'distance'
    )
    .name('Distance to Worker')
    .disable();

    speedFolder.open();

    // Weather Controls Folder
    const weatherFolder = gui.addFolder('Weather Effects');
    
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
          scene.add(speedRef.current.activeWeather);
          wipersRef.current.isActive = true;
          wipersRef.current.speed = 0.08;
          break;
        case 'drizzle':
          speedRef.current.activeWeather = createRain(true);
          scene.add(speedRef.current.activeWeather);
          wipersRef.current.isActive = true;
          wipersRef.current.speed = 0.05;
          break;
        case 'snow':
          speedRef.current.activeWeather = createSnow();
          scene.add(speedRef.current.activeWeather);
          wipersRef.current.isActive = true;
          wipersRef.current.speed = 0.05;
          break;
        default:
          wipersRef.current.isActive = false;
          break;
      }
    });

    weatherFolder.open();

    // Environment Controls Folder
    const environmentFolder = gui.addFolder('Environment');
    
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
    const duration = 1000; // Transition duration in ms
    const startTime = Date.now();
    
    const startAmbient = lightingRef.current.ambientLight.intensity;
    const startDirectional = lightingRef.current.directionalLight.intensity;
    const startSky = scene.background.clone();
    
    const targetAmbient = isDaytime ? 0.6 : 0.1;
    const targetDirectional = isDaytime ? 0.8 : 0.0;
    const targetSky = isDaytime ? lightingRef.current.skyColor : lightingRef.current.nightColor;

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
      
      // Ease function for smooth transition
      const ease = t => t * t * (3 - 2 * t);
      const t = ease(progress);

      // Update lighting intensities
      lightingRef.current.ambientLight.intensity = startAmbient + (targetAmbient - startAmbient) * t;
      lightingRef.current.directionalLight.intensity = startDirectional + (targetDirectional - startDirectional) * t;
      
      // Update sky color
      scene.background.lerpColors(startSky, targetSky, t);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

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

const createSnow = () => {
  return createParticleSystem(0xffffff, 0.2, 10000);
};

const createRain = (isDrizzle) => {
  return createParticleSystem(
    0xaaaaaa, 
    isDrizzle ? 0.05 : 0.1,
    isDrizzle ? 20000 : 15000
  );
};