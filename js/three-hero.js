// hero 3D — rotating crest geometry + particle field + mouse parallax
(() => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0c0b, 0.08);

  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, 22);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const key = new THREE.DirectionalLight(0xc8a94a, 2.2);
  key.position.set(5, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6dfff0, 1.1);
  rim.position.set(-6, -3, -8);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0x223026, 0.9));

  const group = new THREE.Group();
  scene.add(group);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xe9e6df,
    roughness: 0.35,
    metalness: 0.85,
    emissive: 0x0e0e0e,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xc8a94a,
    roughness: 0.25,
    metalness: 0.95,
    emissive: 0x2a1f07,
  });

  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 1.6);
  arrowShape.lineTo(0.55, 0.2);
  arrowShape.lineTo(0.18, 0.2);
  arrowShape.lineTo(0.18, -1.6);
  arrowShape.lineTo(-0.18, -1.6);
  arrowShape.lineTo(-0.18, 0.2);
  arrowShape.lineTo(-0.55, 0.2);
  arrowShape.closePath();

  const extrude = { depth: 0.35, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 };
  const arrow = new THREE.Mesh(new THREE.ExtrudeGeometry(arrowShape, extrude), accentMat);
  group.add(arrow);

  const blockA = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.4), mat);
  blockA.position.set(-1.9, -0.2, 0);
  blockA.rotation.z = Math.PI / 4;
  group.add(blockA);

  const blockE1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 0.4), mat);
  blockE1.position.set(1.9, 0.6, 0);
  group.add(blockE1);
  const blockE2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 0.4), mat);
  blockE2.position.set(1.9, -0.2, 0);
  group.add(blockE2);
  const blockE3 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 0.4), mat);
  blockE3.position.set(1.9, -1.0, 0);
  group.add(blockE3);
  const eBar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.88, 0.4), mat);
  eBar.position.set(1.42, -0.2, 0);
  group.add(eBar);

  group.scale.setScalar(2.4);

  const wire = new THREE.Mesh(
    new THREE.BoxGeometry(9, 9, 3),
    new THREE.MeshBasicMaterial({ color: 0xc8a94a, wireframe: true, transparent: true, opacity: 0.06 })
  );
  scene.add(wire);

  const pGeo = new THREE.BufferGeometry();
  const N = 900;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 80;
    pos[i*3+1] = (Math.random() - 0.5) * 50;
    pos[i*3+2] = (Math.random() - 0.5) * 60 - 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xc8a94a, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false,
  }));
  scene.add(points);

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / innerWidth - 0.5) * 2;
    my = (e.clientY / innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  const animate = () => {
    const t = clock.getElapsedTime();
    tx += (mx - tx) * 0.04;
    ty += (my - ty) * 0.04;

    group.rotation.y = t * 0.25 + tx * 0.6;
    group.rotation.x = ty * 0.4;
    group.rotation.z = Math.sin(t * 0.4) * 0.05;

    wire.rotation.y = -t * 0.1;
    wire.rotation.x = t * 0.08;

    points.rotation.y = t * 0.02;

    camera.position.x += (tx * 2 - camera.position.x) * 0.05;
    camera.position.y += (-ty * 1.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();