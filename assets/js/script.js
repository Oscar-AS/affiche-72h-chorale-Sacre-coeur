/**
 * Journée des Parrains & Marraines - Paroisse de Tampouy - Badge Generator Script
 * High-performance canvas rendering and interactive photo adjustments
 */

// Initialisation du canvas Fabric.js et configuration
const canvas = new fabric.Canvas('afficheCanvas', {
  preserveObjectStacking: true,
  controlsAboveOverlay: true
});

const imgURL = 'assets/images/affiche.png';
const originalWidth = 1587;
const originalHeight = 2245;

// Centre et rayon du cercle parfaitement ajustés à l'image
const circleCenter = { x: 700.60, y: 1350 };
const circleRadius = 402;

let activeImage = null;
let initialScale = 1;

// Configuration des dimensions initiales du canvas
canvas.setWidth(originalWidth);
canvas.setHeight(originalHeight);

/* ==========================================================================
   RESPONSIVE CANVAS RESIZING
   ========================================================================== */
function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  if (!container) return;
  
  const containerWidth = container.clientWidth;
  if (containerWidth === 0) return; // Ne pas redimensionner si le conteneur est masqué
  
  const scaleRatio = containerWidth / originalWidth;
  
  canvas.setWidth(originalWidth * scaleRatio);
  canvas.setHeight(originalHeight * scaleRatio);
  canvas.setZoom(scaleRatio);
  canvas.requestRenderAll();
}

// Adaptation automatique aux changements d'écran
window.addEventListener('resize', resizeCanvas);

// Chargement initial de l'affiche en arrière-plan
fabric.Image.fromURL(imgURL, function(img) {
  if (!img) {
    console.error("Erreur de chargement de l'affiche.");
    return;
  }
  img.set({ selectable: false, evented: false });
  canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
    scaleX: 1,
    scaleY: 1
  });
  resizeCanvas();
});

/* ==========================================================================
   GESTION DU DRAG & DROP ET UPLOAD DE PHOTO
   ========================================================================== */
const dropZone = document.getElementById('dropZone');
const uploadImageInput = document.getElementById('uploadImage');
const changePhotoInput = document.getElementById('changePhotoInput');
const uploadSection = document.getElementById('uploadSection');
const canvasSection = document.getElementById('canvasSection');

// Événement clic sur la zone de drop
dropZone.addEventListener('click', () => uploadImageInput.click());

// Gestion du dragover
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

// Gestion du dragleave
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

// Gestion du drop
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  
  if (e.dataTransfer.files.length > 0) {
    handleImageFile(e.dataTransfer.files[0]);
  }
});

// Événement input d'upload initial
uploadImageInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleImageFile(e.target.files[0]);
  }
});

// Événement input pour changer de photo
changePhotoInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleImageFile(e.target.files[0]);
  }
});

// Synchronise la position et l'échelle du masque circulaire sur l'image
function updateClipPath(img) {
  if (!img || !img.clipPath) return;
  img.clipPath.set({
    left: circleCenter.x,
    top: circleCenter.y,
    radius: circleRadius
  });
}

// Traitement du fichier image et insertion dans le canvas Fabric
function handleImageFile(file) {
  if (!file.type.match('image.*')) {
    alert('Veuillez sélectionner un fichier image valide.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    fabric.Image.fromURL(event.target.result, function(img) {
      // Détermination du facteur d'échelle initial pour couvrir le cercle
      initialScale = Math.max(
        (circleRadius * 2) / img.width,
        (circleRadius * 2) / img.height
      );

      // Configuration de l'image
      img.set({
        left: circleCenter.x,
        top: circleCenter.y,
        originX: 'center',
        originY: 'center',
        scaleX: initialScale,
        scaleY: initialScale,
        angle: 0,
        cornerColor: '#b71c1c',
        cornerStrokeColor: '#ffffff',
        borderColor: '#b71c1c',
        cornerSize: 32, // Plus grand pour faciliter l'interaction tactile
        transparentCorners: false,
        hasRotatingPoint: false,
        lockRotation: true, // Désactiver la rotation
        shadow: {
          color: 'rgba(0,0,0,0.3)',
          blur: 30,
          offsetX: 0,
          offsetY: 10
        }
      });

      // Masquage de la photo dans le cercle doré (position fixe sur le canvas)
      img.clipPath = new fabric.Circle({
        radius: circleRadius,
        left: circleCenter.x,
        top: circleCenter.y,
        originX: 'center',
        originY: 'center',
        absolutePositioned: true
      });

      // Nettoyer les anciennes images téléversées du canvas
      canvas.getObjects('image').forEach(function(o) {
        if (o !== canvas.backgroundImage) canvas.remove(o);
      });

      // Ajouter l'image et l'activer
      canvas.add(img);
      canvas.setActiveObject(img);
      activeImage = img;

      // Réinitialiser les sliders d'ajustement
      resetSliders();

      // Afficher la section Canvas et cacher la zone de téléversement
      uploadSection.classList.add('hidden');
      canvasSection.classList.remove('hidden');
      
      // Ajuster et rafraîchir le canvas
      setTimeout(() => {
        resizeCanvas();
        updateClipPath(img); // S'assurer que le clipPath est bien initialisé
        canvas.renderAll();
      }, 50);
    });
  };
  reader.readAsDataURL(file);
}

/* ==========================================================================
   PANNEAU DE CONTRÔLES INTERACTIFS
   ========================================================================== */
const zoomSlider = document.getElementById('zoomSlider');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');

// Met à jour la photo en fonction du zoom
function updateZoom(value) {
  if (!activeImage) return;
  // La valeur du slider multiplie le zoom initial d'ajustement
  const newScale = initialScale * value;
  activeImage.set({
    scaleX: newScale,
    scaleY: newScale
  });
  updateClipPath(activeImage);
  canvas.requestRenderAll();
}

// Synchroniser les contrôles si l'utilisateur redimensionne directement sur l'écran
canvas.on('object:scaling', function() {
  if (!activeImage) return;
  updateClipPath(activeImage);
  const currentScale = activeImage.scaleX;
  const zoomFactor = currentScale / initialScale;
  zoomSlider.value = zoomFactor.toFixed(2);
});

// Synchroniser le masque si l'utilisateur déplace la photo directement sur l'écran
canvas.on('object:moving', function() {
  if (!activeImage) return;
  updateClipPath(activeImage);
});

// Événements pour le Zoom
zoomSlider.addEventListener('input', (e) => updateZoom(parseFloat(e.target.value)));

zoomInBtn.addEventListener('click', () => {
  let val = Math.min(parseFloat(zoomSlider.value) + 0.1, parseFloat(zoomSlider.max));
  zoomSlider.value = val;
  updateZoom(val);
});

zoomOutBtn.addEventListener('click', () => {
  let val = Math.max(parseFloat(zoomSlider.value) - 0.1, parseFloat(zoomSlider.min));
  zoomSlider.value = val;
  updateZoom(val);
});

// Réinitialise les valeurs des sliders
function resetSliders() {
  zoomSlider.value = 1;
}

/* ==========================================================================
   TÉLÉCHARGEMENT ET EFFETS DE PROGRESSION
   ========================================================================== */
const downloadBtn = document.getElementById('downloadBtn');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

downloadBtn.addEventListener('click', () => {
  if (!activeImage) return;

  // Affichage de la barre de progression
  progressBarContainer.style.display = 'block';
  progressBar.style.width = '0%';
  downloadBtn.disabled = true;

  const steps = [
    { percent: 15, text: "Ajustement Haute Résolution..." },
    { percent: 45, text: "Rendu des couches de l'affiche..." },
    { percent: 75, text: "Génération du fichier PNG HD..." },
    { percent: 100, text: "Téléchargement en cours !" }
  ];

  let currentStep = 0;

  function runProgress() {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      progressBar.style.width = step.percent + '%';
      progressText.textContent = step.text;
      
      let delay = 350 + Math.random() * 250; // Délai naturel pour chaque étape
      currentStep++;
      setTimeout(runProgress, delay);
    } else {
      // Finalisation et export de l'image
      generateAndDownloadBadge();
    }
  }

  runProgress();
});

function generateAndDownloadBadge() {
  // Prépare le canvas à la taille réelle HD sans zoom responsive
  canvas.setZoom(1);
  canvas.setWidth(originalWidth);
  canvas.setHeight(originalHeight);
  canvas.renderAll();

  // Petit délai pour assurer que le canvas Fabric.js soit parfaitement dessiné en pleine résolution
  setTimeout(() => {
    try {
      // Export haute fidélité
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 1 // L'affiche fait déjà 3101 x 4134 (12.8 MP), multiplier par 1 est largement suffisant et optimal
      });

      // Déclenche le téléchargement du fichier
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'badge_parrain_marraine_tampouy.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Restaure l'affichage responsive du canvas
      resizeCanvas();

      // Cacher la progression et afficher le modal de succès
      setTimeout(() => {
        progressBarContainer.style.display = 'none';
        downloadBtn.disabled = false;
        showSuccessModal();
      }, 800);

    } catch (error) {
      console.error("Erreur d'exportation :", error);
      alert("Une erreur s'est produite lors de la génération de l'image. Veuillez réessayer.");
      resizeCanvas();
      progressBarContainer.style.display = 'none';
      downloadBtn.disabled = false;
    }
  }, 200);
}

/* ==========================================================================
   MODAL DE SUCCÈS & CONFETTIS
   ========================================================================== */
const successModal = document.getElementById('validation-message');
const closeModalBtn = document.getElementById('closeModalBtn');
const confettiContainer = document.getElementById('modalConfetti');

function showSuccessModal() {
  successModal.classList.remove('hidden');
  createConfettiShower();
}

closeModalBtn.addEventListener('click', () => {
  successModal.classList.add('hidden');
  confettiContainer.innerHTML = '';
});

// Création d'une pluie de confettis multicolores en CSS/JS
function createConfettiShower() {
  confettiContainer.innerHTML = '';
  const colors = [
    '#b71c1c', '#ffca28', '#2e7d32', '#1565c0', 
    '#9c27b0', '#ff9800', '#00bcd4', '#e91e63'
  ];
  
  const particleCount = 60;
  
  for (let i = 0; i < particleCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-particle';
    
    // Propriétés aléatoires de chaque confetti
    const size = Math.random() * 8 + 6; // Entre 6px et 14px
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;   // Position horizontale
    const duration = Math.random() * 1.5 + 1.2; // Durée de chute
    const delay = Math.random() * 0.8;  // Délai de départ
    
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = color;
    confetti.style.left = `${left}%`;
    confetti.style.top = `-20px`;
    
    // Forme aléatoire (carré ou rond)
    if (Math.random() > 0.5) {
      confetti.style.borderRadius = '50%';
    }
    
    confetti.style.animation = `confettiFall ${duration}s ${delay}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
    
    confettiContainer.appendChild(confetti);
  }
}
