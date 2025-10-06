// Ambil canvas
const canvas = document.getElementById("heroCanvas");
let rect = canvas.getBoundingClientRect();

// Cek dukungan WebGL
function isWebGLAvailable() {
  try {
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!(window.WebGLRenderingContext && gl);
  } catch (e) {
    return false;
  }
}

if (isWebGLAvailable()) {
  // =============== MODE 3D =================
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000);
  camera.position.set(0, 1.5, 1.2);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power", // hemat energi device lama
  });
  renderer.setSize(rect.width, rect.height);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Cahaya
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  // Responsif
  let isMobile = rect.width < 768;
  let segmentRadius = isMobile ? 0.15 : 0.25;
  let segmentSpacing = isMobile ? 0.2 : 0.3;
  const segmentCount = isMobile ? 10 : 20;

  const snakeSegments = [];
  const snakeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00, // kuning neon
    emissive: 0xffff66,
    emissiveIntensity: 0.6,
    roughness: 0.4,
    metalness: 0.8,
    transparent: true,
    opacity: 1
  });

  for (let i = 0; i < segmentCount; i++) {
    const geometry = new THREE.SphereGeometry(segmentRadius, 8, 8);
    const seg = new THREE.Mesh(geometry, snakeMaterial.clone());
    seg.position.x = rect.width / 100 - i * segmentSpacing;
    scene.add(seg);
    snakeSegments.push(seg);
  }

  const clock = new THREE.Clock();
  const speed = 0.08;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    snakeSegments.forEach((seg, idx) => {
      seg.position.x -= speed;
      seg.position.y = Math.sin(t * 2 + idx * 0.5) * 0.2;
      seg.position.z = Math.cos(t * 2 + idx * 0.5) * 0.1;
    });

    const tail = snakeSegments[snakeSegments.length - 1];
    if (tail.position.x < -rect.width / 100 - segmentSpacing) {
      snakeSegments.forEach((seg, idx) => {
        seg.position.x = rect.width / 100 - idx * segmentSpacing;
      });
    }

    renderer.render(scene, camera);
  }
  animate();

  // Responsif
  window.addEventListener("resize", () => {
    rect = canvas.getBoundingClientRect();
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);

    isMobile = rect.width < 768;
    segmentRadius = isMobile ? 0.15 : 0.25;
    segmentSpacing = isMobile ? 0.2 : 0.3;

    snakeSegments.forEach((seg, idx) => {
      seg.geometry = new THREE.SphereGeometry(segmentRadius, 8, 8);
      seg.position.x = rect.width / 100 - idx * segmentSpacing;
    });
  });

} else {
  // =============== FALLBACK MODE 2D =================
  console.warn("⚠️ WebGL tidak tersedia, pakai animasi 2D.");

  const ctx = canvas.getContext("2d");
  let x = 0;
  const radius = 10;

  function animate2D() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gradient neon
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, "rgba(255,255,0,0.8)");
    grad.addColorStop(0.5, "rgba(255,255,100,0.9)");
    grad.addColorStop(1, "rgba(255,255,0,0.8)");
    ctx.fillStyle = grad;

    // Ular neon bergerak
    for (let i = 0; i < 15; i++) {
      const offset = (x - i * 15 + canvas.width) % canvas.width;
      const y = canvas.height / 2 + Math.sin((x / 20) + i * 0.5) * 20;
      ctx.beginPath();
      ctx.arc(offset, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    x += 2;
    requestAnimationFrame(animate2D);
  }

  animate2D();
}
