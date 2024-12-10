
import * as THREE from 'three';

export const addGrass = (roadLength, roadWidth, grassMaterial, scene) => {
// Add shoulder/grass on sides
    const shoulderWidth = 3; // 3 meters of shoulder on each side
    const shoulderGeometry = new THREE.PlaneGeometry(roadLength, shoulderWidth);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, grassMaterial);

    leftShoulder.rotation.x = -Math.PI / 2;
    leftShoulder.position.y = 0;
    leftShoulder.position.z = -(roadWidth / 2 + shoulderWidth / 2);
    scene.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, grassMaterial);
    rightShoulder.rotation.x = -Math.PI / 2;
    rightShoulder.position.y = 0;
    rightShoulder.position.z = (roadWidth / 2 + shoulderWidth / 2);
    scene.add(rightShoulder);

    // Expand the shoulder/grass areas
    const grassWidth = 402.336; // quarter mile on each side
    const grassGeometry = new THREE.PlaneGeometry(roadLength, grassWidth);
    const leftGrass = new THREE.Mesh(grassGeometry, grassMaterial);
    leftGrass.rotation.x = -Math.PI / 2;
    leftGrass.position.y = 0;
    leftGrass.position.z = -(roadWidth / 2 + grassWidth / 2);
    scene.add(leftGrass);

    const rightGrass = new THREE.Mesh(grassGeometry, grassMaterial);
    rightGrass.rotation.x = -Math.PI / 2;
    rightGrass.position.y = 0;
    rightGrass.position.z = (roadWidth / 2 + grassWidth / 2);
    scene.add(rightGrass);

}