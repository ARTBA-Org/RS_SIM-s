import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { placeDrums } from '../components/Scene/createDrums';
import { loadTreeModel, placeTrees } from '../components/Scene/createTrees';
import { createCar } from '../components/Scene/createCar';
import { getSpeedOptions, updateSpeedController, createGUI } from '../components/Scene/createGUI';
import { createStars } from '../components/Scene/createStars';
import { createRoad } from '../components/Scene/createRoad';
import { addGrass } from '../components/Scene/createGrass';

function Home() {
  const mountRef = useRef(null);
  const carRef = useRef(null);
  const guiRef = useRef(null);
  const coordsRef = useRef({
    car: { x: 0, y: 0, z: 0 },
    worker: { x: 0, y: 0, z: 0 },
    useMetric: true
  });

  const speedRef = useRef({
    speed: 10, // Default speed in MPH
    headlightMode: 'regular', // Default headlight mode
    currentSpeed: 10, // Actual current speed
    isBraking: false,
    pavementCondition: 'normal' // Default condition
  });

  const BRAKE_COEFFICIENTS = {
    'normal': 1.0,      // Normal braking power
    'drizzle': 0.8,     // 20% less effective
    'rain': 0.6,        // 40% less effective
    'snow': 0.4,        // 60% less effective
    'ice': 0.2          // 80% less effective
  };

  const snowRef = useRef(null);
  const rainRef = useRef(null);

  // Modify the materials ref to store arrays of materials
  const materialsRef = useRef({
    grass: null,
    trees: {
      trunks: [],
      tops: []
    }
  });

  // Add new refs for wipers
  const wipersRef = useRef({
    left: null,
    right: null,
    isActive: false,
    angle: 0,
    direction: 1
  });

  // Simplify the vehicle controls ref to only handle braking
  const vehicleControlsRef = useRef({
    isBraking: false
  });

  // Define constants at the top of your component
  const maxDistance = 50;
  const roadWidth = 8; // Make sure this is defined
  const roadLength = 402.336; // Make sure this is defined
  const gltfLoader = new GLTFLoader();
  const objLoader = new OBJLoader();
  const fbxLoader = new FBXLoader();
  const scene = new THREE.Scene();

  // Add new ref for the 2D canvas
  const distanceCanvasRef = useRef(null);

  // Add new refs for lighting
  const lightingRef = useRef({
    isDaytime: true,
    ambientLight: null,
    directionalLight: null,
    streetLights: [],
    skyColor: new THREE.Color(0x87CEEB), // Daytime sky blue
    nightColor: new THREE.Color(0x000020)  // Night sky dark blue
  });

 
  placeDrums(roadLength, scene);

  loadTreeModel(gltfLoader)
  .then(treeModel => {
    placeTrees(treeModel, roadLength, roadWidth, scene);
  })
  .catch(error => {
    console.error('Failed to load tree model:', error);
  });

  // Add this function before your main useEffect
  const draw2DScene = (ctx, carPosition, workerPosition) => {
    const canvas = ctx.canvas;
    
    // Set canvas resolution to match display size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Improved font settings
    ctx.strokeStyle = '#444444';
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial, sans-serif'; // Smaller, cleaner font
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; // Better vertical alignment
    
    // Convert road length to pixels (use 80% of canvas width)
    const scale = (width * 0.8) / 402.336;
    const offsetX = width * 0.1;
    
    // Convert measurements based on system, freeze value if car isn't moving
    const convertDistance = (meters) => {
      // Only show changing values if car is moving
      if (speedRef.current.currentSpeed < 0.01) {
        // Round to nearest 0.1 and freeze
        meters = Math.round(meters * 10) / 10;
      }
      
      return coordsRef.current.useMetric ? 
        `${meters.toFixed(1)}m` : 
        `${(meters * 3.28084).toFixed(1)}ft`;
    };
    
    // Draw markers every 50 meters/164 feet
    for (let i = 0; i <= 400; i += 50) {
      const x = offsetX + (i * scale);
      
      ctx.beginPath();
      ctx.moveTo(x, height * 0.65);
      ctx.lineTo(x, height * 0.35);
      ctx.stroke();
      
      ctx.fillText(convertDistance(i), x, height * 0.25);
    }
    
    // Draw worker position (fixed at 0)
    const workerX = offsetX + ((workerPosition + 200) * scale);
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.arc(workerX, height * 0.5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('Worker', workerX, height * 0.15);
    
    // Draw car position
    const carX = offsetX + ((carPosition + 200) * scale);
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(carX, height * 0.5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('Car', carX, height * 0.8);
    
    // Draw distance line between car and worker
    const distance = Math.abs(carPosition - workerPosition);
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(carX, height * 0.5);
    ctx.lineTo(workerX, height * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Update distance text
    ctx.fillStyle = '#ffffff';
    const midX = (carX + workerX) / 2;
    ctx.fillText(convertDistance(distance), midX, height * 0.45);
  };


  useEffect(() => {
    // Scene setup
    scene.background = lightingRef.current.skyColor; // Start with daytime sky
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Brighter for daytime
    lightingRef.current.ambientLight = ambientLight;
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Sun
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    lightingRef.current.directionalLight = directionalLight;
    scene.add(directionalLight);

    // Improve shadow quality for directional light
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;


    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a1f0a, // Darker grass color
      roughness: 1,
      metalness: 0
    });
    materialsRef.current.grass = grassMaterial;

    createStars(scene);

    // Adjust camera and renderer for night scene
    renderer.toneMappingExposure = 1.0; // Increased from 0.5 to 1.0
    renderer.shadowMap.enabled = true;

    // Add roadway
    const roadLength = 402.336; // quarter mile in meters
    const roadWidth = 7.3152; // standard lane width (24 feet in meters)
    
    createRoad(roadLength, roadWidth, scene);

    addGrass(roadLength, roadWidth, grassMaterial, scene);

    // Initialize TGA loader
    const tgaLoader = new TGALoader();
    const textureLoader = new THREE.TextureLoader();

    // Load FBX Model

    const workerPosition = new THREE.Vector3();
    fbxLoader.load(
      '/models/construction_worker_male/Export/Construction_Male_07.fbx',
      (object) => {
        object.scale.setScalar(0.01);
        object.position.set(
          0,
          0,
          -(roadWidth / 2 + 1)
        );

        object.traverse((child) => {
          if (child.isMesh) {
            console.log('Processing mesh:', child.name);
            console.log('Material:', child.material);

            // Create PBR material
            const material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              metalness: 0.2,
              roughness: 0.8
            });

            try {
              // Extract part name (body, head, or helmet)
              const parts = ['body', 'head', 'helmet'];
              const part = parts.find(p => child.name.toLowerCase().includes(p)) || 'body';

              // Load textures using TGA loader
              const basePath = '/models/construction_worker_male/Textures/';
              const colorPath = `${basePath}m107_${part}_color.tga`;
              const normalPath = `${basePath}m107_${part}_normal.tga`;
              const specularPath = `${basePath}m107_${part}_specular.tga`;

              console.log('Loading textures:', { color: colorPath, normal: normalPath, specular: specularPath });

              // Load textures with proper loader
              material.map = tgaLoader.load(colorPath);
              material.normalMap = tgaLoader.load(normalPath);
              material.roughnessMap = tgaLoader.load(specularPath);
              material.needsUpdate = true;

            } catch (error) {
              console.warn('Error loading textures for mesh:', child.name, error);
            }

            child.material = material;
          }
        });

        scene.add(object);

        // Store the worker's position
        workerPosition.copy(object.position);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading FBX:', error);
      }
    );

    // Load GLTF Model
    
    gltfLoader.load(
      '/models/nightworker_male/Construction Worker.gltf',
      (gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(1);
        model.position.set(
          20,
          0,
          -(roadWidth / 2) + 6
        );

        // Configure materials for proper light interaction
        model.traverse((child) => {
          if (child.isMesh) {
            // Keep original textures but configure for proper light response
            if (child.material) {
              child.material.needsUpdate = true;
              child.material.shadowSide = THREE.FrontSide;
              child.material.side = THREE.DoubleSide;
              
              // Ensure materials react to lights
              child.material.metalness = 0.1;    // Low metalness for cloth-like materials
              child.material.roughness = 0.8;    // Higher roughness for matte finish
              child.material.emissive = new THREE.Color(0x000000);
              
              // Enable shadow casting and receiving
              child.castShadow = true;
              child.receiveShadow = true;
            }
          }
        });

        model.rotation.y = -Math.PI / 2;
        scene.add(model);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded GLTF model');
      },
      (error) => {
        console.error('Error loading GLTF:', error);
      }
    );

    createCar(roadWidth, scene, carRef, camera, controls);

    // Modify the scene's ambient light to be darker
    ambientLight.intensity = 0;

    // GUI Setup
    const { gui, speedDisplay, distanceController } = createGUI(
      speedRef,
      coordsRef,
      vehicleControlsRef,
      lightingRef,
      wipersRef,
      scene
    );

    guiRef.current = gui;

    // Make sure to use speedDisplay and distanceController in your animation loop
    // for updating their values

    // Add clock at the top of useEffect
    const clock = new THREE.Clock();

    // Modify the createWipers function to position relative to camera view
    const createWipers = () => {
      const wiperGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.05);
      const wiperMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        metalness: 0.8,
        roughness: 0.2
      });

      const leftWiper = new THREE.Mesh(wiperGeometry, wiperMaterial);
      const rightWiper = new THREE.Mesh(wiperGeometry, wiperMaterial);

      // Position wipers in camera view (lower part of viewport)
      leftWiper.position.set(-0.7, -0.6, -2);  // Adjusted for camera perspective
      rightWiper.position.set(0.7, -0.6, -2);

      // Set pivot points
      leftWiper.geometry.translate(0.4, 0, 0);
      rightWiper.geometry.translate(-0.4, 0, 0);

      return { left: leftWiper, right: rightWiper };
    };

    // In your useEffect, attach wipers to camera instead of car:
    const wipers = createWipers();
    wipersRef.current.left = wipers.left;
    wipersRef.current.right = wipers.right;
    camera.add(wipers.left);    // Attach to camera instead of car
    camera.add(wipers.right);

    // Clean keyboard controls
    const handleKeyDown = (event) => {
        if (event.code === 'Space') {
            event.preventDefault(); // Prevent page scrolling
            vehicleControlsRef.current.isBraking = true;
        }
    };

    const handleKeyUp = (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
            vehicleControlsRef.current.isBraking = false;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Simplify animation loop to only handle braking
    const animate = () => {
        if (carRef.current) {
            const delta = clock.getDelta();
            
            // Handle braking
            if (vehicleControlsRef.current.isBraking) {
                const brakingPower = BRAKE_COEFFICIENTS[speedRef.current.pavementCondition] || 1.0;
                speedRef.current.currentSpeed = Math.max(
                    0,
                    speedRef.current.currentSpeed - (15 * delta * brakingPower)
                );
            } else {
                // Accelerate or maintain speed when not braking
                speedRef.current.currentSpeed = Math.min(
                    speedRef.current.speed,
                    speedRef.current.currentSpeed + (5 * delta)
                );
            }

            // Convert current MPH to meters per second
            const speedMPH = speedRef.current.currentSpeed;
            const speedKMH = speedMPH * 1.60934;
            const speedMPS = speedKMH / 3.6;
            
            // Move car based on actual speed and actual delta time
            const distanceThisFrame = speedMPS * delta * .975;
            carRef.current.position.x += distanceThisFrame * 0.5;

            // Reset position when reaching end of road
            if (carRef.current.position.x > roadLength/2) {
                carRef.current.position.x = -roadLength/2;
            }

        // Update camera position to follow car
        camera.position.set(
          carRef.current.position.x - 7,
          carRef.current.position.y + 1,
          carRef.current.position.z + 1
        );

        // Always look ahead of the car
        controls.target.set(
          carRef.current.position.x + 10,
          carRef.current.position.y,
          carRef.current.position.z + 1
        );
        
        controls.update();

        // Update 2D visualization if canvas exists
        if (distanceCanvasRef.current) {
          const ctx = distanceCanvasRef.current.getContext('2d');
          draw2DScene(
            ctx,
            carRef.current.position.x,
            0  // Worker position is at 0
          );
        }

        // Update car coordinates
        coordsRef.current.car.x = carRef.current.position.x;
        
        // Calculate distance (using absolute value)
        const distance = Math.abs(coordsRef.current.car.x); // Worker is at x=0
        
        // Update GUI with formatted distance
        const formattedDistance = coordsRef.current.useMetric ? 
          `${distance.toFixed(1)} meters` : 
          `${(distance * 3.28084).toFixed(1)} feet`;
        distanceController.setValue(formattedDistance);

        // In the animation loop, update the speed display
        const formattedSpeed = coordsRef.current.useMetric ? 
          `${(speedRef.current.currentSpeed * 1.60934).toFixed(1)} km/h` : 
          `${speedRef.current.currentSpeed.toFixed(1)} mph`;
        speedDisplay.setValue(formattedSpeed);

        // Update the animation loop for wipers
        // (Move this part outside of the carRef.current check since it's now camera-based)
        if (wipersRef.current.isActive) {
          const wiperSpeed = wipersRef.current.speed;
          
          wipersRef.current.angle += wiperSpeed * wipersRef.current.direction;
          
          if (wipersRef.current.angle > 1.2) {
            wipersRef.current.direction = -1;
          } else if (wipersRef.current.angle < 0) {
            wipersRef.current.direction = 1;
          }
          
          if (wipersRef.current.left && wipersRef.current.right) {
            wipersRef.current.left.rotation.z = wipersRef.current.angle;    // Changed from y to z rotation
            wipersRef.current.right.rotation.z = -wipersRef.current.angle;  // Changed from y to z rotation
          }
        } else {
          if (wipersRef.current.left && wipersRef.current.right) {
            wipersRef.current.left.rotation.z = 0;    // Changed from y to z rotation
            wipersRef.current.right.rotation.z = 0;    // Changed from y to z rotation
            wipersRef.current.angle = 0;
          }
        }
      }

      // Animate snow if it exists
      if (snowRef.current) {
        const positions = snowRef.current.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] -= 0.02;
          
          if (positions[i + 1] < 0) {
            positions[i + 1] = 50;
            positions[i] = Math.random() * 400 - 200;
            positions[i + 2] = Math.random() * 100 - 50;
          }
        }
        snowRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Update rain animation
      if (rainRef.current) {
        const positions = rainRef.current.geometry.attributes.position.array;
        const isDrizzle = speedRef.current.pavementCondition === 'drizzle';
        const speed = isDrizzle ? 0.2 : 0.4;
        
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] -= speed;
          
          positions[i] += (isDrizzle ? 0.01 : 0.02) * Math.sin(Date.now() * 0.001 + i);
          
          if (positions[i + 1] < 0) {
            positions[i + 1] = 50;
            positions[i] = Math.random() * 400 - 200;
            positions[i + 2] = Math.random() * 100 - 50;
          }
        }
        rainRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      // Update 2D canvas size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.2;
    };
    window.addEventListener('resize', handleResize);

    // Adjust camera for human eye level view
    camera.position.set(
      0.1,  // x: distance back from center
      0.1,   // y: ~2 meters high (human eye level)
      10   // z: slight offset to the side
    );
    
    // Look slightly upward from this position
    controls.target.set(
      0,    // x: look at center
      1,    // y: look slightly up
      0     // z: center
    );
    
    controls.update();

    // Optional: You might want to adjust these control limits for a more natural view
    controls.maxPolarAngle = Math.PI / 2; // Don't allow camera to go below ground
    controls.minDistance = 5;              // Don't allow camera too close
    controls.maxDistance = 100;            // Don't allow camera too far

    

    // Place trees randomly on both sides
    const minDistance = 10; // Minimum distance between trees
    const maxDistance = 50; // Maximum distance from road
    
    // Adjust camera for better view of wider scene
    camera.position.set(30, 20, 30);
    controls.target.set(0, 10, 0);
    controls.update();

    // Rotate entire scene 90 degrees counterclockwise around Y axis
    
    

    

    // Add GUI controls for time of day

    
    

    // Make sure to clean up the refs in the cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (guiRef.current) {
        guiRef.current.destroy();
      }
      if (wipersRef.current.left) camera.remove(wipersRef.current.left);
      if (wipersRef.current.right) camera.remove(wipersRef.current.right);
      lightingRef.current.streetLights = [];
    };
  }, []);

  


  

  

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '80vh' }} />
      <canvas 
        ref={distanceCanvasRef}
        style={{ 
          width: '100%',
          maxWidth: '768px',
          height: '20vh',
          backgroundColor: '#1a1a1a',
          margin: '0 auto',
          display: 'block',
          '@media (min-width: 768px)': {
            width: '40%'
          }
        }} 
      />
    </div>
  );
}

export default Home;