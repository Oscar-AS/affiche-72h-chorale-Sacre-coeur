// Initialisation du canvas Fabric.js et de l'affiche de fond
const canvas = new fabric.Canvas('afficheCanvas');
const imgURL = 'affiche.png';

let originalWidth = 3101;
let originalHeight = 4134;

canvas.setWidth(originalWidth);
canvas.setHeight(originalHeight);

// Fonction pour rendre le canvas responsive (s'adapte à la taille de l'écran)
function resizeCanvas() {
  const containerWidth = document.getElementById('canvas-container').clientWidth;
  const scaleRatio = containerWidth / originalWidth;
  canvas.setWidth(originalWidth * scaleRatio);
  canvas.setHeight(originalHeight * scaleRatio);
  canvas.setZoom(scaleRatio);
  canvas.requestRenderAll();
}

// Redimensionne le canvas quand la fenêtre change de taille
window.addEventListener('resize', resizeCanvas);

// Charge l'image de fond (l'affiche) et l'ajoute en arrière-plan du canvas
fabric.Image.fromURL(imgURL, function(img) {
  img.set({ selectable: false });
  canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
    scaleX: canvas.width / originalWidth,
    scaleY: canvas.height / originalHeight
  });
  resizeCanvas();
});

// --- Paramètres du cercle pour la photo (à ajuster selon ton affiche) ---
const circleCenter = { x: 2054.75, y: 1579.65 }; // centre du cercle doré
const circleRadius = 836.95; // rayon du cercle doré

// --- Gestion de l'upload et insertion de la photo dans le cercle ---
document.getElementById('uploadImage').addEventListener('change', function(e) {
  const reader = new FileReader();
  reader.onload = function(event) {
    fabric.Image.fromURL(event.target.result, function(img) {
      // Calcule le scale pour que la photo remplisse bien le cercle
      const scale = Math.max(
        (circleRadius * 2) / img.width,
        (circleRadius * 2) / img.height
      );

      img.set({
        left: circleCenter.x,
        top: circleCenter.y,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        cornerColor: 'blue',
        cornerSize: 12,
        hasRotatingPoint: false,
        lockRotation: true,
        shadow: {
          color: 'rgba(0,0,0,0.25)',
          blur: 20,
          offsetX: 0,
          offsetY: 8
        }
      });

      // Masque la photo dans un cercle (clipPath)
      img.clipPath = new fabric.Circle({
        radius: circleRadius,
        left: circleCenter.x,
        top: circleCenter.y,
        originX: 'center',
        originY: 'center',
        absolutePositioned: true
      });

      // Supprime les anciennes photos si besoin (garde l'affiche de fond)
      canvas.getObjects('image').forEach(function(o) {
        if (o !== canvas.backgroundImage) canvas.remove(o);
      });

      canvas.add(img);
      canvas.setActiveObject(img);

      // Ajoute le texte "J'y serai" au-dessus de la photo (ici vide si tu ne veux rien)
      const jySeraiText = new fabric.Text("", {
        left: circleCenter.x,
        top: circleCenter.y + circleRadius + 120,
        originX: 'center',
        originY: 'center',
        fontSize: 180,
        fontFamily: 'Pacifico, cursive',
        fill: '#fff8e1',
        stroke: '#b71c1c',
        strokeWidth: 6,
        shadow: 'rgba(183,28,28,0.4) 8px 8px 16px',
        selectable: false
      });

      // Supprime l'ancien texte si déjà présent
      canvas.getObjects('text').forEach(function(o) {
        canvas.remove(o);
      });

      canvas.add(jySeraiText);
      canvas.bringToFront(jySeraiText);

      canvas.renderAll();
    });
  };
  reader.readAsDataURL(e.target.files[0]);
});

// --- Bouton de téléchargement, barre de progression et animation de validation ---
document.getElementById('downloadBtn').addEventListener('click', function() {
  // Affiche la barre de progression
  const progressBarContainer = document.getElementById('progress-bar-container');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  progressBarContainer.style.display = 'block';
  progressBar.style.width = '0';
  progressText.textContent = 'Préparation du badge...';

  // Simulation de progression (pour l'expérience utilisateur)
  let percent = 0;
  const interval = setInterval(() => {
    percent += Math.random() * 20 + 10; // avance aléatoire
    if (percent >= 100) percent = 100;
    progressBar.style.width = percent + '%';
    progressText.textContent = Math.floor(percent) + '%';

    if (percent >= 100) {
      clearInterval(interval);

      // Prépare le canvas à la taille réelle pour l'export HD
      canvas.setZoom(1);
      canvas.setWidth(originalWidth);
      canvas.setHeight(originalHeight);
      canvas.renderAll();

      // Petit délai pour garantir que toutes les images sont bien affichées
      setTimeout(() => {
        // Génère l'image en haute définition (multiplier: 2)
        const dataURL = canvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2
        });

        // Restaure le canvas à la taille responsive pour l'utilisateur
        resizeCanvas();

        // Déclenche le téléchargement
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'badge_jy_serai.png';
        link.click();

        // Barre à 100% et message
        progressBar.style.width = '100%';
        progressText.textContent = 'Téléchargement terminé !';

        // Masque la barre après 1.5s
        setTimeout(() => {
          progressBarContainer.style.display = 'none';
        }, 1500);

        // Affiche le message de validation avec fleurs/emojis
        showValidationMessage();
      }, 200); // 200ms de délai pour garantir le rendu complet
    }
  }, 200);
});

// --- Animation fleurs/emojis et message de validation ---
function showValidationMessage() {
  const msg = document.getElementById('validation-message');
  msg.classList.remove('hidden');
  createFlowers();

  // Masque le message après 10 secondes (modifiable)
  setTimeout(() => {
    msg.classList.add('hidden');
    document.querySelector('.flowers').innerHTML = '';
  }, 10000);
}

// Génère des emojis (victoire, musique, fleurs) qui "pop" à l'écran
function createFlowers() {
  const emojis = [
    '🌸','🌺','🌻','💐', // fleurs
    '🏆','🎉','🙌',      // victoire
    '🎶','🎵','🎤','🎷','🎺','🎸' // musique
  ];
  const container = document.querySelector('.flowers');
  container.innerHTML = '';
  for(let i=0; i<22; i++) {
    const emoji = document.createElement('span');
    emoji.className = 'flower';
    emoji.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    emoji.style.left = Math.random()*90 + '%';
    emoji.style.top = (60 + Math.random()*30) + '%';
    emoji.style.fontSize = (2 + Math.random()*2.5) + 'em';
    emoji.style.animationDelay = (Math.random()*0.7) + 's';
    container.appendChild(emoji);
  }
}