import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export function setupControls(camera, rootElement) {
    const controls = new PointerLockControls(camera, document.body);
    rootElement.addEventListener('click', () => controls.lock());
    return controls;
}