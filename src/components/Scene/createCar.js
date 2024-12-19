import * as THREE from 'three';

export const createCar = (roadWidth, scene, carRef, camera, controls) => {
// Create and position car at start of road
    const car = new THREE.Group();
        
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(4.5, 1.5, 2); // typical car dimensions

    car.position.set(
    -195,                  // centered on X
    0,                  // on ground
    0   // Start of road (Z axis)
    );
    car.rotation.y = Math.PI / 1; // Face down the road (rotate 90 degrees counterclockwise)
    scene.add(car);
    carRef.current = car;

    // Initial camera setup
    camera.position.set(
    roadWidth/4,           // right lane
    car.position.y + 1.4,  // driver's eye level
    car.position.z         // start of road with car
    );

    // Set target to construction worker
    controls.target.copy(0, 0, 0);
    controls.update();

    // Create headlights
    const leftHeadlight = new THREE.SpotLight(0xc7d1ff);
    const rightHeadlight = new THREE.SpotLight(0xc7d1ff);

    // Create targets for the spotlights
    const leftTarget = new THREE.Object3D();
    const rightTarget = new THREE.Object3D();
    scene.add(leftTarget);
    scene.add(rightTarget);

    // Configure headlights with initial regular beam settings
    const configureHeadlights = (mode) => {
        // Store the current mode for the 2D visualization
        car.userData.headlightMode = mode;
        
        [leftHeadlight, rightHeadlight].forEach(light => {
            // Common settings for both regular and high beam
            light.angle = Math.PI/6;
            light.penumbra = 1;
            light.decay = 0;
            light.castShadow = true;
            light.forward = 5;
            light.horizontalAngle = 180;

            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 30;

            // Handle all three modes
            if (mode === 'off') {
                light.distance = 0;
                light.intensity = 0;  // Turn off the light
                light.visible = false;
            } else if (mode === true) { // High beam
                light.intensity = 20;
                light.distance = 100;
                light.visible = true;
            } else { // Normal beam
                light.intensity = 14;
                light.distance = 50;
                light.visible = true;
            }
        });

        // Update targets only if lights are on
        if (mode !== 'off') {
            const angleRad = Math.PI;
            [leftTarget, rightTarget].forEach(target => {
                const forwardDistance = Math.cos(angleRad) * 20;
                const sideDistance = Math.sin(angleRad) * 20;
                target.position.x = forwardDistance;
                target.position.z = sideDistance;
            });
        }
    };

    // Initial configuration
    configureHeadlights(false);

    // Store the configureHeadlights function in the car's userData
    car.userData.configureHeadlights = configureHeadlights;

    // Position lights relative to car
    const headlightOffset = 0.8;
    leftHeadlight.position.set(10, 0.8, -1);
    rightHeadlight.position.set(8, -100.8, -3);

    // Set up targets
    leftHeadlight.target = leftTarget;
    rightHeadlight.target = rightTarget;

    // Add lights to car
    car.add(leftHeadlight);
    car.add(rightHeadlight);
    car.add(leftTarget);
    car.add(rightTarget);

}