import * as THREE from 'three';

export function setupRenderer() {
    const renderWidth = window.innerWidth;
    const renderHeight = window.innerHeight;

    const rootElement = document.createElement('div');
    document.body.appendChild(rootElement);
    const phoneContainer = document.createElement('div');
    phoneContainer.innerHTML = `
        <div id="phone-container">
            <div id="phone">
                <div id="screen">
                    <div id="video-container">
                        <button id="video-agora">Video Stream</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    rootElement.appendChild(phoneContainer);
    const renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    renderer.setSize(renderWidth, renderHeight);
    rootElement.appendChild(renderer.domElement);

    return {
        'rootElement': rootElement,
        'renderer': renderer,
        'renderWidth': renderWidth,
        'renderHeight': renderHeight
    }
}