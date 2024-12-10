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
    const configureHeadlights = (isHighBeam = false) => {
        [leftHeadlight, rightHeadlight].forEach(light => {
            // Common settings for both regular and high beam
            light.angle = Math.PI * -3;
            light.penumbra = 1;
            light.decay = 0;
            light.castShadow = true;
            light.forward = 5;
            light.horizontalAngle = 180;  // Same horizontal angle for both modes

            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 30;

            // Only intensity and distance differ between modes
            if (isHighBeam) {
                light.intensity = 5;
                light.distance = 100;    // High beam reaches far
            } else {
                light.intensity = 3;
                light.distance = 10;     // Regular beam reduced from 200 to 20
            }
        });

        // Update targets with 180 degree angle for both modes
        const angleRad = Math.PI; // 180 degrees in radians
        [leftTarget, rightTarget].forEach(target => {
            const forwardDistance = Math.cos(angleRad) * 20;
            const sideDistance = Math.sin(angleRad) * 20;
            target.position.x = forwardDistance;
            target.position.z = sideDistance;
        });
    };

    // Initial configuration
    configureHeadlights(false);

    // Position lights relative to car
    const headlightOffset = 2;
    leftHeadlight.position.set(5, 1, -headlightOffset/2);
    rightHeadlight.position.set(5, 1, headlightOffset/2);

    // Set up targets
    leftHeadlight.target = leftTarget;
    rightHeadlight.target = rightTarget;

    // Add lights to car
    car.add(leftHeadlight);
    car.add(rightHeadlight);
    car.add(leftTarget);
    car.add(rightTarget);

}