/* Küçük yay (spring) animasyon motoru — Framer Motion benzeri API, Web Animations API üzerinde.
   Motion.animate(el, { opacity:[0,1], y:[12,0], scale:[.96,1] }, { stiffness, damping, mass, delay }) */
(function () {
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function springCurve({ stiffness = 380, damping = 32, mass = 1, velocity = 0 } = {}) {
    // 0 → 1 arası ilerlemeyi simüle et
    const dt = 1 / 120;
    let x = 0, v = velocity, t = 0;
    const pts = [0];
    while (t < 3) {
      const a = (-stiffness * (x - 1) - damping * v) / mass;
      v += a * dt; x += v * dt; t += dt;
      pts.push(x);
      if (Math.abs(x - 1) < 0.0008 && Math.abs(v) < 0.01) break;
    }
    pts[pts.length - 1] = 1;
    return { pts, duration: t * 1000 };
  }
  const cache = {};
  function curve(o) {
    const k = [o.stiffness, o.damping, o.mass].join(',');
    return cache[k] || (cache[k] = springCurve(o));
  }

  function frame(props, p) {
    const lerp = (a, b) => a + (b - a) * p;
    const tf = [];
    const out = {};
    if (props.x) tf.push(`translateX(${lerp(...props.x)}px)`);
    if (props.y) tf.push(`translateY(${lerp(...props.y)}px)`);
    if (props.scale) tf.push(`scale(${lerp(...props.scale)})`);
    if (props.rotate) tf.push(`rotate(${lerp(...props.rotate)}deg)`);
    if (tf.length) out.transform = tf.join(' ');
    if (props.opacity) out.opacity = Math.max(0, Math.min(1, lerp(...props.opacity)));
    if (props.blur) out.filter = `blur(${Math.max(0, lerp(...props.blur))}px)`;
    return out;
  }

  function animate(el, props, opts = {}) {
    if (!el) return Promise.resolve();
    if (reduce()) {
      const end = frame(props, 1);
      Object.assign(el.style, end.opacity != null ? { opacity: end.opacity } : {});
      return Promise.resolve();
    }
    const { pts, duration } = curve({ stiffness: 380, damping: 32, mass: 1, ...opts });
    const step = Math.max(1, Math.floor(pts.length / 60));
    const kf = [];
    for (let i = 0; i < pts.length; i += step) kf.push(frame(props, pts[i]));
    kf.push(frame(props, 1));
    // opaklık yaylanmasın
    if (props.opacity) kf.forEach((k, i) => (k.opacity = props.opacity[0] + (props.opacity[1] - props.opacity[0]) * Math.min(1, (i / (kf.length - 1)) * 2.2)));
    const a = el.animate(kf, { duration: opts.duration || duration, delay: opts.delay || 0, easing: 'linear', fill: opts.fill || 'both' });
    return a.finished.then(() => { if (!opts.keep) a.cancel(); }).catch(() => {});
  }

  function stagger(els, props, opts = {}) {
    return Promise.all([...els].map((el, i) => animate(el, props, { ...opts, delay: (opts.delay || 0) + i * (opts.each || 35) })));
  }

  window.Motion = { animate, stagger, springCurve, reduce };
})();
