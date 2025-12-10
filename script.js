import qrcode from 'qrcode-generator';
import { initParticles } from './particles.js';
import { convertToSTL } from './stl-exporter.js';

let qrMatrix, moduleCount;

function generateQRCode(url) {
    // 0 = Auto type, 'M' = Medium Error Correction
    var qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();

    const qrCodeContainer = document.getElementById('qrcode');
    // Using cellSize 1 and margin 1 to get a base svg that can be scaled up by CSS.
    qrCodeContainer.innerHTML = qr.createSvgTag({ cellSize: 1, margin: 1 });
    const svg = qrCodeContainer.querySelector('svg');
    if (svg) {
        // Remove fixed dimensions to allow CSS scaling.
        svg.removeAttribute('width');
        svg.removeAttribute('height');
    }

    qrMatrix = qr.modules;
    moduleCount = qr.getModuleCount();
}

generateQRCode('https://websim.ai');

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
            document.querySelector('.contact-info p:first-child').textContent = user.username;
            profile_image.src = user.avatar_url;
            profile_image.style.display = 'block';
            profile_image.classList.add('fade-in');

            const newUrl = `https://websim.ai/@${user.username}`;
            generateQRCode(newUrl);
            document.querySelector('.contact-info p:last-child').textContent = newUrl;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to fetch user data. Please try again.');
    }
});

document.getElementById('resetCard').addEventListener('click', function() {
    document.querySelector('.slogan').textContent = 'Simulate. Innovate. Create.';
    document.querySelector('.contact-info p:first-child').textContent = 'support@websim.ai';
    document.querySelector('.contact-info p:last-child').textContent = 'websim.ai';
    profile_image.style.display = 'none';
    profile_image.removeAttribute('src');
    generateQRCode('https://websim.ai');
    editableElements.forEach(el => el.contentEditable = 'false');
});

document.getElementById('printCard').addEventListener('click', function() {
    window.print();
});

document.getElementById('convertToSTL').addEventListener('click', function() {
    const cardData = {
        slogan: document.querySelector('.slogan').textContent,
        email: document.querySelector('.contact-info p:first-child').textContent,
        website: document.querySelector('.contact-info p:last-child').textContent,
        qrMatrix: qrMatrix,
        moduleCount: moduleCount
    };
    convertToSTL(cardData);
});