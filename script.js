// --- EKLEME 1 (ÖN HAZIRLIK): KUYRUK (TRAIL) EFEKTİ İÇİN RENDERER AYARI ---
if (typeof renderer !== 'undefined') {
    renderer.autoClear = false; // İz bırakabilmek için otomatik temizlemeyi kapatıyoruz
}

// Orijinal renk paletin
const sphereColors = [
    new THREE.Color(0x00ffff).multiplyScalar(1.2),
    new THREE.Color(0xfff400).multiplyScalar(1.1),
    new THREE.Color(0x410beb).multiplyScalar(1.2),
    new THREE.Color(0xff09b4).multiplyScalar(1.1),
    new THREE.Color(0x00ff00).multiplyScalar(1.2)
];

// Orijinal halkan
const orbitRings = createOrbitRings(5.8, 6, 0.4);

// --- MERKEZ KÜRE (GLOW CORE) ---
const coreGeometry = new THREE.SphereGeometry(3.2, 32, 32); 
const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,                  
    transparent: true,
    opacity: 0.35,                    
    blending: THREE.AdditiveBlending  
});
const centerCore = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(centerCore);

// --- ARKA PLAN YILDIZLARI (STARFIELD) ---
const starCount = 3000;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const distance = 400 + Math.random() * 200; 

    starPositions[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = distance * Math.cos(phi);
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true 
});

const backgroundStars = new THREE.Points(starGeometry, starMaterial);
scene.add(backgroundStars);

// --- TEKNİK DOKUNUŞ: FARE DÖNDÜRMELERİNDE DERİNLİK TEMİZLİĞİ ---
if (typeof controls !== 'undefined') {
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.addEventListener('change', () => {
        if (typeof renderer !== 'undefined') renderer.clearDepth();
    });
}

// Zaman ve Animasyon Döngüsü
let time = 0;
const initialCamY = typeof camera !== 'undefined' ? camera.position.y : 0;

// Kuyruk efekti için her karede ekranın üzerine örteceğimiz şeffaf siyah perde nesneleri
const trailScene = new THREE.Scene();
const trailCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const trailMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.15 // Bu değer düşerse kuyruk uzar, büyürse kuyruk kısalır
});
const trailMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), trailMaterial);
trailScene.add(trailMesh);

function animate() {
    requestAnimationFrame(animate);
    
    time += 0.002;
    
    if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
        // --- EKLEME 1: KUYRUK (TRAIL) EFEKTİ SİNEMATİĞİ ---
        // Eski karelerin üzerine hafif şeffaf siyah perde örterek ışık izi yaratıyoruz
        renderer.render(trailScene, trailCamera);
        renderer.clearDepth(); 
    }
    
    // Orijinal halka animasyonun
    orbitRings.rotation.y = time;
    orbitRings.rotation.x = time * 0.3;
    
    // MERKEZ KÜRE NEFES ALMA EFEKTİ
    const pulse = 1 + Math.sin(time * 4) * 0.03; 
    centerCore.scale.set(pulse, pulse, pulse);
    
    // ARKA PLAN YILDIZLARININ YAVAŞ DÖNÜŞÜ
    backgroundStars.rotation.y = time * 0.02;
    backgroundStars.rotation.x = time * 0.01;
    
    // --- EKLEME 4: KAMERAYA HAFİF OTOMATİK SALINIM (BREATHING) ---
    if (typeof camera !== 'undefined') {
        camera.position.y = initialCamY + Math.sin(time * 2) * 0.4;
    }
    
    if (typeof controls !== 'undefined') controls.update();
    if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
        renderer.render(scene, camera);
    }
}

// --- TEKNİK DOKUNUŞ: RESIZE ESNASINDA ARTIKLARI TEMİZLEME ---
window.addEventListener('resize', () => {
    if (typeof camera !== 'undefined' && typeof renderer !== 'undefined') {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.clear(); 
    }
});
