import * as THREE from 'three';

export function setupCamera(renderWidth, renderHeight) {
    const camera = new THREE.PerspectiveCamera(65, renderWidth / renderHeight, 0.1, 500);
    camera.position.copy(new THREE.Vector3().fromArray([-13, -4, 0]));
    return camera;
}