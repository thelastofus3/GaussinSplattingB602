import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";
import * as THREE from 'three';

export const viewer = new GaussianSplats3D.DropInViewer({
    dynamicScene: true,
});

viewer.addSplatScenes(
    [
        {
            path: 'public/assets/B601.splat',
            splatAlphaRemovalThreshold: 10,
            rotation: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 0).normalize(), new THREE.Vector3(0, 0, 0)).toArray()
        }
    ],
    true
);