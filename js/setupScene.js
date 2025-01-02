import * as THREE from 'three';

export function setupScene() {
    const threeScene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    threeScene.add(ambientLight);
    return threeScene;
}