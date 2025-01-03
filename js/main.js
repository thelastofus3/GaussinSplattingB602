import * as THREE from 'three';
import {GLTFLoader} from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import {setupRenderer} from "./setupRenderer.js";
import { setupCamera } from './setupCamera.js';
import {setupScene} from "./setupScene.js";
import {setupControls} from "./controls.js";
import {viewer} from "./setupGaussianSplat.js";


const {rootElement, renderer, renderWidth, renderHeight} = setupRenderer();
const camera = setupCamera(renderWidth, renderHeight);
const threeScene = setupScene();
const controls = setupControls(camera, rootElement);

threeScene.add(viewer);
threeScene.add(controls.getObject());

const loader = new GLTFLoader();
let monitor1, monitor2;
loader.load(
    'public/assets/tv_gs.gltf',
    (gltf) => {
        monitor1 = gltf.scene;
        monitor1.traverse((node) => {
            if (node.isMesh && !(node.material instanceof THREE.Material)) {
                node.material = new THREE.MeshBasicMaterial({
                    color: 0x000000,
                });
            }
        });
        threeScene.add(monitor1);

        monitor1.scale.set(1.7, 1.7, 1.7);
        monitor1.position.set(-19, -7.5, 0.5);
        monitor1.rotation.y = Math.PI / 2.2;
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% downloaded');
    },
    (error) => {
        console.error('Error processing model', error);
    }
);

loader.load(
    'public/assets/tv_gs.gltf',
    (gltf) => {
        monitor2 = gltf.scene;
        monitor2.traverse((node) => {
            if (node.isMesh && !(node.material instanceof THREE.Material)) {
                node.material = new THREE.MeshBasicMaterial({
                    color: 0x000000,
                });
            }
        });
        threeScene.add(monitor2);

        monitor2.scale.set(1, 1, 1);
        monitor2.position.set(-20.3, -6.5, 2.5);
        monitor2.rotation.y = Math.PI / 3.4;
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% downloaded');
    },
    (error) => {
        console.error('Error processing model', error);
    }
);

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const onKeyDown = function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
};

const onKeyUp = function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

requestAnimationFrame(update);
const speedMultiplier = 2;

function updateMonitorTexture(videoElement, monitor) {
    console.log("initial update monitor")
    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.flipY = false;

    monitor.traverse((node) => {
        if (node.isMesh) {
            console.log(node.material)
            node.material = new THREE.MeshBasicMaterial({ map: videoTexture });
            node.material.needsUpdate = true;
            console.log("apply video texture to monitor")
        }
    });
}


let rtc = {
    localAudioTrack: null,
    localVideoTrack: null,
    client: null,
};
let options = {
    appId: "a7802749b2504f27bcbfdae2448638ee",
    channel: "main",
    token: null,
    uid: sessionStorage.getItem("uid") || String(Math.floor(Math.random() * 10000)),
};

function initializeClient() {
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setupEventListeners();
}

function setupEventListeners() {
    rtc.client.on("user-published", async (user, mediaType) => {
        await rtc.client.subscribe(user, mediaType);
        console.log("subscribe success");
        if (mediaType === "video") {
            displayRemoteVideo(user);
        }
        if (mediaType === "audio") {
            user.audioTrack.play();
        }
    });
    rtc.client.on("user-unpublished", (user) => {
        const remotePlayerContainer = document.getElementById(user.uid);
        remotePlayerContainer && remotePlayerContainer.remove();
    });
}

function displayRemoteVideo(user) {
    const remoteVideoTrack = user.videoTrack;
    const remoteVideoElement = document.createElement("video");
    remoteVideoTrack.play(remoteVideoElement);
    updateMonitorTexture(remoteVideoElement, monitor2);
}

async function joinChannel() {
    await rtc.client.join(options.appId, options.channel, options.token, options.uid);
    await createAndPublishLocalTracks();
    displayLocalVideo();
    console.log("Publish success!");
}

const cameraConfig = {
    encoderConfig: {
        width: 1920,
        height: 1080,
        frameRate: 30,
        bitrateMin: 1000,
        bitrateMax: 2500,
        orientationMode: 'adaptative'
    },
    optimizationMode: 'detail',
    facingMode: 'user'
};

async function createAndPublishLocalTracks() {
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack(cameraConfig);
    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
}

function displayLocalVideo() {
    const localVideoElement = document.createElement("video");
    rtc.localVideoTrack.play(localVideoElement);

    updateMonitorTexture(localVideoElement, monitor1);
}

function setupButtonHandlers() {
    document.getElementById("video-agora").onclick = joinChannel;
}

function startBasicCall() {
    initializeClient();
    window.onload = setupButtonHandlers;
    console.log("call start")
}

startBasicCall();


function update() {
    requestAnimationFrame(update);

    const time = performance.now();
    if (controls.isLocked === true) {

        const deltaSeconds = (time - prevTime) / 1000;
        const delta = deltaSeconds * .01;

        velocity.x -= velocity.x * delta;
        velocity.z -= velocity.z * delta;
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions
        if (moveForward || moveBackward) velocity.z -= direction.z * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * delta;

        controls.moveRight(-velocity.x * delta * speedMultiplier);
        controls.moveForward(-velocity.z * delta * speedMultiplier);

    }
    renderer.render(threeScene, camera);
}