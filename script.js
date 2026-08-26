/* ==========================================================================
   DERMA CLINIC - 3D LIQUID GLOW & SERUM ENGINE (د. مريم سعد)
   3D Luminous Serum Droplet, Hydration Rings & Water Caustics
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  init3DLiquidSerumScene();
  init3DTilt();
  initBeforeAfterSlider();
  initSkinLayerExplorer();
  initSkinQuiz();
  initBookingSystem();
  initServiceFilters();
  initFaqAccordion();
  initMobileMenu();
});

/* --------------------------------------------------------------------------
   1. THREE.JS 3D LUMINOUS SERUM DROPLET & HYDRATION RINGS (قطرة النضارة والترطيب)
   -------------------------------------------------------------------------- */
function init3DLiquidSerumScene() {
  const container = document.getElementById('canvas3d-container');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 2, 24);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Group for the entire liquid composition
  const liquidGroup = new THREE.Group();
  scene.add(liquidGroup);

  // ------------------------------------------------------------------------
  // A. MAIN 3D SERUM DROPLET (قطرة السيروم الزجاجية الفاخرة)
  // ------------------------------------------------------------------------
  // Constructing a sleek Teardrop profile using LatheGeometry
  const dropPoints = [];
  const segments = 40;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Mathematical teardrop curve profile
    const angle = t * Math.PI;
    const r = Math.sin(angle) * Math.pow(Math.sin(angle / 2), 0.7) * 4.2;
    const y = (t - 0.6) * 7.5;
    dropPoints.push(new THREE.Vector2(Math.max(r, 0.001), -y));
  }

  const dropGeo = new THREE.LatheGeometry(dropPoints, 48);
  const dropMat = new THREE.MeshPhysicalMaterial({
    color: 0x5eead4,
    emissive: 0x0f766e,
    emissiveIntensity: 0.45,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.45,
    transparent: true,
    opacity: 0.9,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  const mainDroplet = new THREE.Mesh(dropGeo, dropMat);
  mainDroplet.position.y = 1.5;
  liquidGroup.add(mainDroplet);

  // Inner Active Core / Glowing Pearl inside the droplet
  const pearlGeo = new THREE.SphereGeometry(1.6, 32, 32);
  const pearlMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.8
  });
  const innerPearl = new THREE.Mesh(pearlGeo, pearlMat);
  innerPearl.position.y = 0.8;
  mainDroplet.add(innerPearl);

  // ------------------------------------------------------------------------
  // B. HYDRATION RIPPLE RINGS (حلقات وتموجات الترطيب المائية)
  // ------------------------------------------------------------------------
  const ripplesGroup = new THREE.Group();
  ripplesGroup.position.y = -4.5;
  ripplesGroup.rotation.x = Math.PI / 2.2;
  liquidGroup.add(ripplesGroup);

  const rippleCount = 3;
  const ripples = [];
  for (let i = 0; i < rippleCount; i++) {
    const ringGeo = new THREE.TorusGeometry(3.5 + i * 3.2, 0.12, 16, 80);
    const ringMat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? 0x38bdf8 : 0x14b8a6,
      emissive: i % 2 === 0 ? 0x0284c7 : 0x0f766e,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.6 - i * 0.15
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ripplesGroup.add(ring);
    ripples.push(ring);
  }

  // ------------------------------------------------------------------------
  // C. ORBITING MOISTURE MICRO-DROPLETS (حبيبات نضارة عائمة ولامعة)
  // ------------------------------------------------------------------------
  const microDropCount = 18;
  const microGroup = new THREE.Group();
  liquidGroup.add(microGroup);

  const microGeo = new THREE.SphereGeometry(0.35, 20, 20);
  const microMat = new THREE.MeshPhysicalMaterial({
    color: 0x5eead4,
    emissive: 0x115e59,
    emissiveIntensity: 0.6,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true,
    opacity: 0.85
  });

  const microDrops = [];
  for (let i = 0; i < microDropCount; i++) {
    const micro = new THREE.Mesh(microGeo, microMat);
    const orbitRadius = 6.5 + Math.random() * 4.5;
    const speed = 0.5 + Math.random() * 0.8;
    const angleOffset = (i / microDropCount) * Math.PI * 2;
    const yOffset = -2 + Math.random() * 6;
    const scale = 0.6 + Math.random() * 0.8;
    micro.scale.set(scale, scale, scale);

    microDrops.push({ mesh: micro, radius: orbitRadius, speed: speed, angle: angleOffset, y: yOffset });
    microGroup.add(micro);
  }

  // ------------------------------------------------------------------------
  // D. AMBIENT HYDRATION PARTICLES (ذرات لمعان وإشراقة ناعمة)
  // ------------------------------------------------------------------------
  const pCount = 180;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);

  for (let i = 0; i < pCount * 3; i += 3) {
    pPos[i] = (Math.random() - 0.5) * 26;
    pPos[i + 1] = (Math.random() - 0.5) * 18;
    pPos[i + 2] = (Math.random() - 0.5) * 16;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

  const pMat = new THREE.PointsMaterial({
    color: 0x5eead4,
    size: 0.35,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(pGeo, pMat);
  liquidGroup.add(particles);

  // ------------------------------------------------------------------------
  // E. LIGHTING SETUP
  // ------------------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
  mainLight.position.set(10, 15, 15);
  scene.add(mainLight);

  const tealSpot = new THREE.PointLight(0x14b8a6, 3.5, 50);
  tealSpot.position.set(-12, 6, 10);
  scene.add(tealSpot);

  const goldSpot = new THREE.PointLight(0xf59e0b, 2.8, 50);
  goldSpot.position.set(12, -4, 10);
  scene.add(goldSpot);

  // ------------------------------------------------------------------------
  // F. MOUSE & TOUCH INTERACTION
  // ------------------------------------------------------------------------
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    mouseX = (e.clientX - halfW) * 0.0012;
    mouseY = (e.clientY - halfH) * 0.0012;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouseX = (e.touches[0].clientX - halfW) * 0.0015;
      mouseY = (e.touches[0].clientY - halfH) * 0.0015;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // ------------------------------------------------------------------------
  // G. ANIMATION LOOP (Liquid Float & Glow Breathing)
  // ------------------------------------------------------------------------
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Smooth inertia tracking
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    liquidGroup.rotation.y = time * 0.15 + targetX * 1.8;
    liquidGroup.rotation.x = Math.sin(time * 0.2) * 0.1 + targetY * 1.5;

    // Organic Floating & Surface Tension Breathing of Droplet
    const floatY = Math.sin(time * 1.5) * 0.6;
    mainDroplet.position.y = 1.5 + floatY;

    // Fluid Squash & Stretch
    const stretch = 1 + Math.cos(time * 1.5) * 0.05;
    const squish = 1 - Math.cos(time * 1.5) * 0.03;
    mainDroplet.scale.set(squish, stretch, squish);

    // Inner pearl gentle counter-pulse
    const pearlPulse = 1 + Math.sin(time * 2.5) * 0.08;
    innerPearl.scale.set(pearlPulse, pearlPulse, pearlPulse);

    // Ripple wave expansion
    ripples.forEach((ring, idx) => {
      const wave = Math.sin(time * 2 - idx * 0.8);
      const scaleVal = 1 + wave * 0.08;
      ring.scale.set(scaleVal, scaleVal, scaleVal);
      ring.material.opacity = 0.4 + wave * 0.25;
    });

    // Orbiting micro-droplets
    microDrops.forEach((item) => {
      const currentAngle = item.angle + time * item.speed * 0.6;
      item.mesh.position.x = Math.cos(currentAngle) * item.radius;
      item.mesh.position.z = Math.sin(currentAngle) * item.radius;
      item.mesh.position.y = item.y + Math.sin(time * 2 + item.angle) * 0.5;
    });

    // Ambient shimmer particles
    particles.rotation.y = -time * 0.04;

    renderer.render(scene, camera);
  }
  animate();
}

/* --------------------------------------------------------------------------
   2. 3D PARALLAX TILT EFFECT (Medical Cards)
   -------------------------------------------------------------------------- */
function init3DTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

/* --------------------------------------------------------------------------
   3. BEFORE & AFTER INTERACTIVE SLIDER
   -------------------------------------------------------------------------- */
function initBeforeAfterSlider() {
  const container = document.getElementById('ba-slider');
  if (!container) return;

  const afterWrapper = container.querySelector('.ba-image-after-wrapper');
  const handle = container.querySelector('.ba-handle');
  let isSliding = false;

  function setSliderPosition(x) {
    const rect = container.getBoundingClientRect();
    let pos = (x - rect.left) / rect.width;
    if (pos < 0.05) pos = 0.05;
    if (pos > 0.95) pos = 0.95;

    const percentage = pos * 100;
    afterWrapper.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  }

  container.addEventListener('mousedown', (e) => {
    isSliding = true;
    setSliderPosition(e.clientX);
  });

  window.addEventListener('mouseup', () => { isSliding = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isSliding) return;
    setSliderPosition(e.clientX);
  });

  container.addEventListener('touchstart', (e) => {
    isSliding = true;
    setSliderPosition(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => { isSliding = false; });
  window.addEventListener('touchmove', (e) => {
    if (!isSliding) return;
    setSliderPosition(e.touches[0].clientX);
  }, { passive: true });

  const baTabs = document.querySelectorAll('.ba-tab');
  const beforeImg = document.getElementById('ba-before-img');
  const afterImg = document.getElementById('ba-after-img');
  const caseTitle = document.getElementById('ba-case-title');
  const caseDesc = document.getElementById('ba-case-desc');

  const cases = {
    acne: {
      title: 'علاج آثار وحفر حب الشباب - د. مريم سعد',
      desc: 'تحسن واضح في ملمس ونعومة البشرة واختفاء الندبات بعد 3 جلسات بسيطة.',
      before: 'https://images.unsplash.com/photo-1512290900672-1f02e6ae5c4a?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    },
    filler: {
      title: 'تحديد الفك والشفاه الطبيعي - د. مريم سعد',
      desc: 'مظهر شبابي جذاب ومتناسق مع ملامح الوجه بدون أي مبالغة.',
      before: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
    },
    pigment: {
      title: 'تفتيح وتوحيد لون البشرة والتصبغات',
      desc: 'إشراقة ونضارة كاملة وتخلص من بقع الشمس والكلف بطرق آمنة.',
      before: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80'
    }
  };

  baTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      baTabs.forEach((t) => {
        t.classList.remove('bg-teal-600', 'text-white', 'shadow-lg');
        t.classList.add('bg-slate-800/80', 'text-slate-300');
      });
      tab.classList.add('bg-teal-600', 'text-white', 'shadow-lg');
      tab.classList.remove('bg-slate-800/80', 'text-slate-300');

      const caseKey = tab.dataset.case;
      if (cases[caseKey]) {
        beforeImg.src = cases[caseKey].before;
        afterImg.src = cases[caseKey].after;
        caseTitle.textContent = cases[caseKey].title;
        caseDesc.textContent = cases[caseKey].desc;
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. 3D SKIN LAYERS EXPLORER (Simple & Patient-Friendly)
   -------------------------------------------------------------------------- */
function initSkinLayerExplorer() {
  const layerItems = document.querySelectorAll('.skin-layer');
  const layerTitle = document.getElementById('layer-detail-title');
  const layerDepth = document.getElementById('layer-detail-depth');
  const layerDesc = document.getElementById('layer-detail-desc');
  const layerTech = document.getElementById('layer-detail-tech');
  const laserBeam = document.getElementById('interactive-laser-beam');

  const layerData = {
    epidermis: {
      title: '1. نضارة وإشراقة السطح (Surface Glow)',
      depth: 'الهدف: تنظيف ونضارة فورية للمناسبات',
      desc: 'تنظيف عميق للمسام، إزالة الرؤوس السوداء، تفتيح التصبغات السطحية، وإعطاء إشراقة ولمعان فوري للبشرة.',
      tech: 'العلاجات المفضلة: تنظيف الهايدرافيشل الملكي، التقشير اللطيف، وسيرومات التفتيح.',
      beamHeight: '25%',
      beamColor: '#38bdf8'
    },
    dermis: {
      title: '2. تجديد الكولاجين والشباب (Collagen Layer)',
      depth: 'الهدف: مرونة الجلد ومقاومة التجاعيد',
      desc: 'تحفيز الكولاجين الطبيعي الذي يجعل البشرة مرنة ومشدودة ويعالج آثار وندبات حب الشباب والخطوط التعبيرية.',
      tech: 'العلاجات المفضلة: جلسات مورفيوس 8، إبر النضارة والبروفايلو، والفراكشنال ليزر.',
      beamHeight: '65%',
      beamColor: '#14b8a6'
    },
    hypodermis: {
      title: '3. تماسك ورفع ملامح الوجه (Lifting & Contouring)',
      depth: 'الهدف: تحديد الفك والخدين بمظهر طبيعي',
      desc: 'رفع الترهلات الخفيفة واستعادة تحديد خط الفك والخدين بطرق غير جراحية وبدون أي مبالغة.',
      tech: 'العلاجات المفضلة: جهاز الهايفو لشد الوجه، خيوط الشد التجميلية، وفيلر تحديد الفك.',
      beamHeight: '95%',
      beamColor: '#f59e0b'
    }
  };

  layerItems.forEach((item) => {
    item.addEventListener('click', () => {
      layerItems.forEach((l) => l.classList.remove('active'));
      item.classList.add('active');

      const key = item.dataset.layer;
      if (layerData[key]) {
        layerTitle.textContent = layerData[key].title;
        layerDepth.textContent = layerData[key].depth;
        layerDesc.textContent = layerData[key].desc;
        layerTech.textContent = layerData[key].tech;

        if (laserBeam) {
          laserBeam.style.height = layerData[key].beamHeight;
          laserBeam.style.backgroundColor = layerData[key].beamColor;
          laserBeam.style.boxShadow = `0 0 20px ${layerData[key].beamColor}`;
        }
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. SMART SKIN DIAGNOSTIC QUIZ
   -------------------------------------------------------------------------- */
function initSkinQuiz() {
  const quizOptions = document.querySelectorAll('.quiz-option');
  const nextBtn = document.getElementById('quiz-next-btn');
  const prevBtn = document.getElementById('quiz-prev-btn');
  const resultCard = document.getElementById('quiz-result-card');
  const steps = document.querySelectorAll('.quiz-step');
  const progressBar = document.getElementById('quiz-progress');

  let currentStep = 1;
  const totalSteps = 3;
  const userAnswers = {
    concern: '',
    skinType: '',
    ageGroup: ''
  };

  quizOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      const stepContainer = opt.closest('.quiz-step');
      const stepOptions = stepContainer.querySelectorAll('.quiz-option');
      stepOptions.forEach((o) => o.classList.remove('selected'));
      opt.classList.add('selected');

      const category = opt.dataset.category;
      const value = opt.dataset.value;
      userAnswers[category] = value;

      if (nextBtn) nextBtn.disabled = false;
    });
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        steps[currentStep - 1].classList.add('hidden');
        currentStep++;
        steps[currentStep - 1].classList.remove('hidden');

        if (progressBar) {
          progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
        }

        if (prevBtn) prevBtn.classList.remove('hidden');
        if (currentStep === totalSteps) {
          nextBtn.textContent = 'عرض التشخيص وخطة د. مريم سعد ✨';
        }
      } else {
        showQuizResult(userAnswers);
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        steps[currentStep - 1].classList.add('hidden');
        currentStep--;
        steps[currentStep - 1].classList.remove('hidden');

        if (progressBar) {
          progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
        }

        nextBtn.textContent = 'التالي';
        if (currentStep === 1) prevBtn.classList.add('hidden');
      }
    });
  }

  function showQuizResult(answers) {
    steps.forEach((s) => s.classList.add('hidden'));
    if (nextBtn) nextBtn.classList.add('hidden');
    if (prevBtn) prevBtn.classList.add('hidden');
    if (resultCard) resultCard.classList.remove('hidden');

    const treatmentTitle = document.getElementById('quiz-treatment-title');
    const treatmentDetails = document.getElementById('quiz-treatment-details');
    const applyToBookingBtn = document.getElementById('quiz-apply-booking-btn');

    let recommended = 'باقة النضارة الملكية الفائقة (Royal Glow)';
    let desc = 'جلسة هيدرافيشل عميقة مع بوستر فيتامينات وميزوثيرابي نضارة لتجديد خلايا البشرة مع د. مريم سعد.';

    if (answers.concern === 'acne') {
      recommended = 'بروتوكول علاج حب الشباب والندبات المتقدم (د. مريم سعد)';
      desc = 'مزيج من الفراكشنال ليزر مع التقشير العلاجي وجلسات البلازما الغنية بالصفائح لتحفيز التجديد.';
    } else if (answers.concern === 'pigment') {
      recommended = 'جلسات تفتيح التصبغات والكلف بالليزر الكربوني والبارد';
      desc = 'بروتوكول تفتيح مكثف بدون تقشير مزعج لتوحيد لون البشرة واستعادة الإشراقة الصحية.';
    } else if (answers.concern === 'aging') {
      recommended = 'برنامج شد ونضارة الوجه غير الجراحي (Morpheus8 + Profhilo)';
      desc = 'تحفيز عميق لإنتاج الكولاجين الطبيعي مع إبرة الشباب بروفايلو لشد الترهلات وتنعيم الخطوط.';
    }

    if (treatmentTitle) treatmentTitle.textContent = recommended;
    if (treatmentDetails) treatmentDetails.textContent = desc;

    if (applyToBookingBtn) {
      applyToBookingBtn.addEventListener('click', () => {
        const serviceSelect = document.getElementById('booking-service');
        if (serviceSelect) {
          serviceSelect.value = recommended;
        }
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
}

/* --------------------------------------------------------------------------
   6. SMART BOOKING SYSTEM & DIRECT WHATSAPP (د. مريم سعد)
   -------------------------------------------------------------------------- */
function initBookingSystem() {
  const bookingForm = document.getElementById('booking-form');
  const timeSlots = document.querySelectorAll('.time-slot-btn');
  let selectedTime = '05:00 مساءً';

  timeSlots.forEach((slot) => {
    slot.addEventListener('click', (e) => {
      e.preventDefault();
      timeSlots.forEach((s) => {
        s.classList.remove('bg-teal-600', 'text-white', 'border-teal-500');
        s.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
      });
      slot.classList.add('bg-teal-600', 'text-white', 'border-teal-500');
      slot.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
      selectedTime = slot.textContent.trim();
    });
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('booking-name')?.value || 'مراجع';
      const phone = document.getElementById('booking-phone')?.value || '';
      const branch = document.getElementById('booking-branch')?.value || 'الفرع الرئيسي';
      const service = document.getElementById('booking-service')?.value || 'استشارة جلدية وتجميل مع د. مريم سعد';
      const date = document.getElementById('booking-date')?.value || 'أقرب موعد متاح';
      const notes = document.getElementById('booking-notes')?.value || 'لا يوجد';

      const waText = encodeURIComponent(
        `مرحباً دكتورة مريم سعد، أود تأكيد حجز موعد في العيادة:\n` +
        `👤 الاسم: ${name}\n` +
        `📞 الهاتف: ${phone}\n` +
        `🏥 الفرع: ${branch}\n` +
        `💉 الخدمة المطلوبة: ${service}\n` +
        `📅 التاريخ: ${date}\n` +
        `⏰ الوقت المفضل: ${selectedTime}\n` +
        `📝 ملاحظات: ${notes}`
      );

      const clinicWhatsAppNumber = '9647700000000';

      const modal = document.getElementById('booking-modal');
      const modalDetails = document.getElementById('modal-booking-details');
      const modalWaLink = document.getElementById('modal-wa-link');

      if (modalDetails) {
        modalDetails.innerHTML = `
          <div class="space-y-2 text-sm text-slate-300 bg-slate-800/60 p-4 rounded-xl border border-teal-500/20 text-right">
            <p><strong class="text-teal-400">اسم الطبيب:</strong> د. مريم سعد (استشاري الجلدية والليزر)</p>
            <p><strong class="text-teal-400">اسم المراجع:</strong> ${name}</p>
            <p><strong class="text-teal-400">الخدمة:</strong> ${service}</p>
            <p><strong class="text-teal-400">الموعد:</strong> ${date} (${selectedTime})</p>
            <p><strong class="text-teal-400">الفرع:</strong> ${branch}</p>
          </div>
        `;
      }

      if (modalWaLink) {
        modalWaLink.href = `https://wa.me/${clinicWhatsAppNumber}?text=${waText}`;
      }

      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    });
  }

  const closeModalBtn = document.getElementById('close-modal-btn');
  const modal = document.getElementById('booking-modal');
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }
}

/* --------------------------------------------------------------------------
   7. SERVICES FILTER TABS
   -------------------------------------------------------------------------- */
function initServiceFilters() {
  const filterBtns = document.querySelectorAll('.service-filter-btn');
  const serviceCards = document.querySelectorAll('.service-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('bg-teal-600', 'text-white', 'shadow-md');
        b.classList.add('bg-slate-800/80', 'text-slate-300');
      });
      btn.classList.add('bg-teal-600', 'text-white', 'shadow-md');
      btn.classList.remove('bg-slate-800/80', 'text-slate-300');

      const filterValue = btn.dataset.filter;

      serviceCards.forEach((card) => {
        if (filterValue === 'all' || card.dataset.category === filterValue) {
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.classList.add('hidden');
          }, 300);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   8. FAQ ACCORDION
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const header = item.querySelector('.faq-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      faqItems.forEach((other) => {
        if (other !== item) other.classList.remove('open');
      });

      if (isOpen) {
        item.classList.remove('open');
      } else {
        item.classList.add('open');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   9. MOBILE MENU TOGGLE
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('close-mobile-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden-menu');
      mobileMenu.classList.add('active-menu');
    });
  }

  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.add('hidden-menu');
      mobileMenu.classList.remove('active-menu');
    });
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (mobileMenu) {
        mobileMenu.classList.add('hidden-menu');
        mobileMenu.classList.remove('active-menu');
      }
    });
  });
}
