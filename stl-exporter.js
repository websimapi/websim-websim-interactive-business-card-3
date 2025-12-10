import * as THREE from 'three';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export function convertToSTL(cardData) {
    const { slogan, email, website, qrMatrix, moduleCount } = cardData;

    const scene = new THREE.Scene();
    const cardWidth = 3.5;
    const cardHeight = 2;
    const cardDepth = 0.1;

    // Create card base
    const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);
    const cardMaterial = new THREE.MeshPhongMaterial({ color: 0x4285f4 });
    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    scene.add(cardMesh);

    // Load font
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

        // Function to create extruded text
        const createText = (text, size, x, y) => {
            const textGeometry = new TextGeometry(text, {
                font: font,
                size: size,
                height: 0.05,
                curveSegments: 12,
                bevelEnabled: false
            });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(x, y, cardDepth / 2 + 0.01);
            scene.add(textMesh);
        };

        // Add text elements
        createText('WebSim', 0.3, -1.6, 0.7);
        createText(slogan, 0.1, -1.6, 0.4);
        createText(email, 0.08, -1.6, -0.7);
        createText(website, 0.08, -1.6, -0.85);

        // Create QR code
        if (!qrMatrix) {
            console.error("QR matrix not available for STL generation.");
            alert("Could not generate STL, QR code data is missing.");
            return;
        }

        const qrSize = 0.8;
        const qrX = 1.2;
        const qrY = -0.5;
        const moduleSize = qrSize / moduleCount;
        const halfModuleCount = moduleCount / 2.0;

        // Engrave/emboss QR code modules
        const blackMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const whiteMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const moduleRelief = 0.02; // how much to go in/out from the card surface

        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                const isBlack = qrMatrix[row][col];
                const material = isBlack ? blackMaterial : whiteMaterial;
                const geometry = new THREE.BoxGeometry(moduleSize, moduleSize, moduleRelief);
                const moduleMesh = new THREE.Mesh(geometry, material);

                const xPos = qrX + (col - halfModuleCount + 0.5) * moduleSize;
                const yPos = qrY - (row - halfModuleCount - 0.5) * moduleSize;
                // zPos is relative to card surface at cardDepth / 2
                const zPos = cardDepth / 2 + (isBlack ? moduleRelief / 2 : -moduleRelief / 2);

                moduleMesh.position.set(xPos, yPos, zPos);
                scene.add(moduleMesh);
            }
        }

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Export STL
        const exporter = new STLExporter();
        const stlString = exporter.parse(scene);
        const blob = new Blob([stlString], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'business_card.stl';
        link.click();
    });
}