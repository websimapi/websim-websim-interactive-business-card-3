import * as QRCode from 'qrcode';
import { initParticles } from './particles.js';
import { convertToSTL } from './stl-exporter.js';

let qrMatrix, moduleCount;

/**
 * Generate a QR code for the given URL and render it into the #qrcode container.
 * Uses a canvas-based renderer with a modern QR library and keeps the raw matrix
 * for STL export.
 */
function generateQRCode(url) {
    const qrCodeContainer = document.getElementById('qrcode');
    if (!qrCodeContainer) return;

    // Clear any previous QR rendering
    qrCodeContainer.innerHTML = '';

    // Create QR code data structure
    const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    const data = qr.modules.data;

    moduleCount = size;
    qrMatrix = [];

    for (let row = 0; row < size; row++) {
        const rowData = [];
        for (let col = 0; col < size; col++) {
            const idx = row * size + col;
            const isDark = !!data[idx];
            rowData.push(isDark);
        }
        qrMatrix.push(rowData);
    }

    // Determine display size from container
    const dpr = window.devicePixelRatio || 1;
    const containerSize = Math.min(
        qrCodeContainer.clientWidth || 90,
        qrCodeContainer.clientHeight || 90
    );
    const canvasSize = containerSize * dpr;

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Quiet zone and module size
    const quietZoneModules = 2;
    const modulesWithQuiet = size + quietZoneModules * 2;
    const moduleSize = canvasSize / modulesWithQuiet;

    // Draw dark modules
    ctx.fillStyle = '#000000';
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (qrMatrix[row][col]) {
                const x = (col + quietZoneModules) * moduleSize;
                const y = (row + quietZoneModules) * moduleSize;
                ctx.fillRect(
                    Math.round(x),
                    Math.round(y),
                    Math.ceil(moduleSize),
                    Math.ceil(moduleSize)
                );
            }
        }
    }

    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';

    qrCodeContainer.appendChild(canvas);
}

generateQRCode('https://504sites.com');

// Initialize particles
initParticles('canvas-container', 'businessCard');

if (!window.matchMedia('print').matches) {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('mouseleave', function() {
            this.querySelectorAll('span').forEach(span => {
                span.style.animation = 'none';
                span.offsetHeight; // Trigger reflow
                span.style.animation = null;
            });
        });
    }
}

const businessCard = document.getElementById('businessCard');
const contextMenu = document.getElementById('contextMenu');
const editableElements = document.querySelectorAll('.editable');
const profile_image = document.getElementById('profile_image');

businessCard.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.classList.add('fade-in');
});

document.addEventListener('click', function(e) {
    if (!businessCard.contains(e.target) && !contextMenu.contains(e.target)) {
        exitEditMode();
    }
});

function exitEditMode() {
    editableElements.forEach(el => {
        el.contentEditable = 'false';
    });
}

document.addEventListener('click', function(e) {
    if (!contextMenu.contains(e.target)) {
        contextMenu.style.display = 'none';
        contextMenu.classList.remove('fade-in');
    }
});

const helpIcon = document.getElementById('helpIcon');
const helpMenu = document.getElementById('helpMenu');
const helpClose = document.getElementById('helpClose');

helpIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    helpMenu.style.display = 'flex';
    helpMenu.classList.add('fade-in');
});

helpClose.addEventListener('click', function() {
    helpMenu.style.display = 'none';
    helpMenu.classList.remove('fade-in');
});

helpMenu.addEventListener('click', function(e) {
    if (e.target === helpMenu) {
        helpMenu.style.display = 'none';
        helpMenu.classList.remove('fade-in');
    }
});

document.getElementById('editCard').addEventListener('click', function() {
    editableElements.forEach(el => {
        el.contentEditable = 'true';
    });
    contextMenu.style.display = 'none';
});

document.getElementById('embedProfile').addEventListener('click', async function() {
    try {
        const user = await window.websim.getUser();
        if (user) {
            const contactP = document.querySelector('.contact-info p');
            if (contactP) contactP.textContent = user.username;
            
            profile_image.src = user.avatar_url;
            profile_image.style.display = 'block';
            profile_image.classList.add('fade-in');

            const newUrl = `https://websim.ai/@${user.username}`;
            generateQRCode(newUrl);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to fetch user data. Please try again.');
    }
});

document.getElementById('resetCard').addEventListener('click', function() {
    document.querySelector('.slogan').textContent = 'Professional Websites. No Crushing Costs.';
    document.querySelector('.pricing').textContent = '$89/month';
    const contactP = document.querySelector('.contact-info p');
    if (contactP) contactP.textContent = '504sites.com';
    
    profile_image.style.display = 'none';
    profile_image.removeAttribute('src');
    generateQRCode('https://504sites.com');
    editableElements.forEach(el => el.contentEditable = 'false');
});

document.getElementById('printCard').addEventListener('click', function() {
    window.print();
});

document.getElementById('convertToSTL').addEventListener('click', function() {
    const cardData = {
        slogan: document.querySelector('.slogan').textContent,
        email: document.querySelector('.pricing').textContent, // Reuse email slot for pricing in STL for now
        website: document.querySelector('.contact-info p').textContent,
        qrMatrix: qrMatrix,
        moduleCount: moduleCount
    };
    convertToSTL(cardData);
});