const canvas = new fabric.Canvas('afficheCanvas');
const imgURL = 'affiche.png';

let originalWidth = 3101;
let originalHeight = 4134;

canvas.setWidth(originalWidth);
canvas.setHeight(originalHeight);

function resizeCanvas() {
  const containerWidth = document.getElementById('canvas-container').clientWidth;
  const scaleRatio = containerWidth / originalWidth;
  canvas.setWidth(originalWidth * scaleRatio);
  canvas.setHeight(originalHeight * scaleRatio);
  canvas.setZoom(scaleRatio);
  canvas.requestRenderAll();
}

window.addEventListener('resize', resizeCanvas);

fabric.Image.fromURL(imgURL, function(img) {
  img.set({ selectable: false });
  canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
    scaleX: canvas.width / originalWidth,
    scaleY: canvas.height / originalHeight
  });
  resizeCanvas();
});

// --- Paramètres du cercle (à ajuster selon ton affiche) ---
const circleCenter = { x: 2054.75, y: 1579.65 }; // centre du cercle doré sur l'affiche
const circleRadius = 836.95; // rayon du cercle doré

// --- Upload et insertion de la photo dans le cercle ---
document.getElementById('uploadImage').addEventListener('change', function(e) {
  const reader = new FileReader();
  reader.onload = function(event) {
    fabric.Image.fromURL(event.target.result, function(img) {
      // Calcul du scale pour remplir le cercle
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

      // ClipPath circulaire bien centré
      img.clipPath = new fabric.Circle({
        radius: circleRadius,
        left: circleCenter.x,
        top: circleCenter.y,
        originX: 'center',
        originY: 'center',
        absolutePositioned: true
      });

      // Supprime les anciennes images si besoin
      canvas.getObjects('image').forEach(function(o) {
        if (o !== canvas.backgroundImage) canvas.remove(o);
      });

      canvas.add(img);
      canvas.setActiveObject(img);

      // Ajoute le texte "J'y serai" au-dessus de la photo
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

// --- Bouton de téléchargement et animation de validation ---

document.getElementById('downloadBtn').addEventListener('click', function() {
  // Désactive le zoom avant l'export pour avoir la taille réelle
  const currentZoom = canvas.getZoom();
  canvas.setZoom(1);
  canvas.setWidth(originalWidth);
  canvas.setHeight(originalHeight);

  // Force le rendu à la taille réelle
  canvas.renderAll();

  // Télécharge à la taille réelle
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 2,
    multiplier: 1 // 1 = taille réelle, tu peux mettre 2 pour ultra HD
  });

  // Restaure le zoom pour l'affichage utilisateur
  resizeCanvas();

  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'badge_jy_serai.png';
  link.click();

  // Affiche le message de validation avec fleurs
  showValidationMessage();
});

// --- Animation fleurs et message ---
function showValidationMessage() {
  const msg = document.getElementById('validation-message');
  msg.classList.remove('hidden');
  createFlowers();

  setTimeout(() => {
    msg.classList.add('hidden');
    document.querySelector('.flowers').innerHTML = '';
  }, 10000);
}

function createFlowers() {
  const emojis = [
    '🌸','🌺','🌻','💐', // fleurs
    '🏆','🎉','🙌',               // victoire
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
