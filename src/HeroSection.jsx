import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #020609;
    --surface:   #050e14;
    --cyan:      #00ffe7;
    --cyan-dim:  #00ffe740;
    --cyan-glow: #00ffe720;
    --red:       #ff2d55;
    --text:      #c8dde8;
    --muted:     #3a5a6a;
    --border:    #0d2a35;
  }

  html, body { height: 100%; background: var(--bg); }

  .hero-root {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--bg);
    font-family: 'JetBrains Mono', monospace;
    color: var(--text);
    cursor: crosshair;
  }

  /* ── Grid canvas ── */
  .grid-canvas {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  /* ── Scanline overlay ── */
  .scanlines {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(0,0,0,0.18) 3px,
      rgba(0,0,0,0.18) 4px
    );
    pointer-events: none;
  }

  /* ── Vignette ── */
  .vignette {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: radial-gradient(ellipse at center, transparent 40%, #000 100%);
    pointer-events: none;
  }

  /* ── Corner brackets ── */
  .corner {
    position: absolute;
    width: 48px;
    height: 48px;
    z-index: 10;
    opacity: 0;
    animation: fadeIn 0.4s ease forwards;
  }
  .corner svg { width: 100%; height: 100%; }
  .corner.tl { top: 24px; left: 24px; animation-delay: 0.8s; }
  .corner.tr { top: 24px; right: 24px; transform: scaleX(-1); animation-delay: 1.0s; }
  .corner.bl { bottom: 24px; left: 24px; transform: scaleY(-1); animation-delay: 1.2s; }
  .corner.br { bottom: 24px; right: 24px; transform: scale(-1,-1); animation-delay: 1.4s; }

  /* ── Nav bar ── */
  .nav {
    position: absolute;
    top: 0; left: 0; right: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    border-bottom: 1px solid var(--border);
    opacity: 0;
    animation: slideDown 0.6s ease 0.2s forwards;
  }
  .nav-logo {
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: var(--cyan);
    text-transform: uppercase;
  }
  .nav-links {
    display: flex;
    gap: 32px;
    list-style: none;
  }
  .nav-links a {
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--muted);
    text-decoration: none;
    text-transform: uppercase;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--cyan); }
  .nav-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.1em;
  }
  .status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 8px var(--cyan);
    animation: pulse 2s ease-in-out infinite;
  }

  /* ── Main content ── */
  .hero-content {
    position: relative;
    z-index: 10;
    text-align: center;
    max-width: 900px;
    padding: 0 32px;
  }

  .system-tag {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    letter-spacing: 0.25em;
    color: var(--cyan);
    text-transform: uppercase;
    margin-bottom: 32px;
    padding: 6px 16px;
    border: 1px solid var(--cyan-dim);
    background: var(--cyan-glow);
    opacity: 0;
    animation: fadeIn 0.5s ease 0.6s forwards;
  }
  .system-tag::before {
    content: '';
    width: 20px; height: 1px;
    background: var(--cyan);
  }
  .system-tag::after {
    content: '';
    width: 20px; height: 1px;
    background: var(--cyan);
  }

  .hero-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(48px, 8vw, 96px);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: #fff;
    margin-bottom: 8px;
    text-shadow: 0 0 60px rgba(0,255,231,0.2);
  }
  .hero-title .line { display: block; overflow: hidden; }
  .hero-title .line span {
    display: block;
    opacity: 0;
    transform: translateY(100%);
    animation: revealUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  .hero-title .line:nth-child(1) span { animation-delay: 0.9s; }
  .hero-title .line:nth-child(2) span { animation-delay: 1.05s; }
  .hero-title .line:nth-child(3) span { animation-delay: 1.2s; }

  .hero-title .accent {
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke: 1px var(--cyan);
    text-shadow: none;
  }

  .hero-subtitle {
    font-size: 14px;
    line-height: 1.8;
    color: var(--muted);
    max-width: 520px;
    margin: 28px auto 48px;
    letter-spacing: 0.04em;
    opacity: 0;
    animation: fadeIn 0.6s ease 1.6s forwards;
  }

  /* ── CTA buttons ── */
  .cta-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    opacity: 0;
    animation: fadeIn 0.6s ease 1.9s forwards;
  }

  .btn-primary {
    position: relative;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--bg);
    background: var(--cyan);
    border: none;
    padding: 14px 36px;
    cursor: pointer;
    clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
    transition: box-shadow 0.2s, transform 0.15s;
    font-weight: 500;
  }
  .btn-primary:hover {
    box-shadow: 0 0 30px var(--cyan-dim), 0 0 60px var(--cyan-glow);
    transform: translateY(-2px);
  }

  .btn-secondary {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--cyan);
    background: transparent;
    border: 1px solid var(--cyan-dim);
    padding: 13px 32px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .btn-secondary:hover {
    background: var(--cyan-glow);
    border-color: var(--cyan);
    transform: translateY(-2px);
  }

  /* ── Stats row ── */
  .stats-row {
    position: absolute;
    bottom: 48px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    gap: 64px;
    opacity: 0;
    animation: fadeIn 0.6s ease 2.2s forwards;
  }
  .stat { text-align: center; }
  .stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    margin-bottom: 6px;
  }
  .stat-value span { color: var(--cyan); }
  .stat-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .stat-divider {
    width: 1px;
    background: var(--border);
    align-self: stretch;
  }

  /* ── Glitch effect ── */
  .glitch {
    position: relative;
  }
  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    font-family: 'Orbitron', sans-serif;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
  }
  .glitch::before {
    color: var(--red);
    clip-path: polygon(0 30%, 100% 30%, 100% 50%, 0 50%);
    animation: glitch1 4s infinite;
  }
  .glitch::after {
    color: var(--cyan);
    clip-path: polygon(0 60%, 100% 60%, 100% 75%, 0 75%);
    animation: glitch2 4s infinite;
  }

  /* ── Scroll indicator ── */
  .scroll-indicator {
    position: absolute;
    right: 40px;
    bottom: 48px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0;
    animation: fadeIn 0.6s ease 2.4s forwards;
  }
  .scroll-line {
    width: 1px;
    height: 60px;
    background: linear-gradient(to bottom, var(--cyan), transparent);
    animation: scrollPulse 2s ease-in-out infinite;
  }
  .scroll-label {
    font-size: 9px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--muted);
    writing-mode: vertical-rl;
  }

  /* ── Keyframes ── */
  @keyframes fadeIn { to { opacity: 1; } }
  @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes revealUp { to { opacity:1; transform:translateY(0); } }
  @keyframes pulse {
    0%,100% { opacity:1; box-shadow: 0 0 8px var(--cyan); }
    50%      { opacity:0.4; box-shadow: 0 0 4px var(--cyan); }
  }
  @keyframes scrollPulse {
    0%,100% { opacity:0.6; transform:scaleY(1); }
    50%      { opacity:1;   transform:scaleY(1.15); }
  }
  @keyframes glitch1 {
    0%,92%,100% { transform:translate(0); opacity:0; }
    93%         { transform:translate(-3px, 1px); opacity:0.8; }
    96%         { transform:translate(2px, -1px); opacity:0.6; }
  }
  @keyframes glitch2 {
    0%,94%,100% { transform:translate(0); opacity:0; }
    95%         { transform:translate(3px, -1px); opacity:0.8; }
    98%         { transform:translate(-2px, 1px); opacity:0.5; }
  }
`;

/* ── Animated grid canvas ── */
function GridCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Perspective grid
      const horizon = H * 0.58;
      const vp = { x: W / 2, y: horizon };
      const cols = 16;
      const rows = 14;
      const speed = 0.4;
      const offset = (t * speed) % (H / rows);

      ctx.strokeStyle = "rgba(0,255,231,0.07)";
      ctx.lineWidth = 1;

      // Vertical lines
      for (let i = 0; i <= cols; i++) {
        const xBase = (W / cols) * i;
        const xTop = vp.x + (xBase - vp.x) * 0.01;
        ctx.beginPath();
        ctx.moveTo(xTop, horizon);
        ctx.lineTo(xBase, H);
        ctx.stroke();
      }

      // Horizontal lines
      for (let j = 0; j <= rows; j++) {
        const yFrac = j / rows;
        const yPos = horizon + (H - horizon) * Math.pow(yFrac, 1.8) + offset * Math.pow(yFrac, 1.8);
        if (yPos > H) continue;
        const xLeft = vp.x + (0 - vp.x) * (1 - yFrac * 0.99);
        const xRight = vp.x + (W - vp.x) * (1 - yFrac * 0.99);
        const alpha = yFrac * 0.18;
        ctx.strokeStyle = `rgba(0,255,231,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(xLeft, yPos);
        ctx.lineTo(xRight, yPos);
        ctx.stroke();
      }

      // Horizon glow
      const grd = ctx.createLinearGradient(0, horizon - 60, 0, horizon + 40);
      grd.addColorStop(0, "transparent");
      grd.addColorStop(0.5, "rgba(0,255,231,0.06)");
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(0, horizon - 60, W, 100);

      // Stars
      ctx.fillStyle = "rgba(200,221,232,0.5)";
      const stars = [
        [0.1,0.05],[0.25,0.12],[0.4,0.03],[0.6,0.08],[0.75,0.15],
        [0.88,0.04],[0.15,0.22],[0.55,0.18],[0.9,0.25],[0.32,0.28],
        [0.68,0.30],[0.05,0.38],[0.82,0.35],[0.47,0.40],[0.22,0.44],
      ];
      stars.forEach(([sx, sy]) => {
        const blink = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.5 + sx * 10));
        ctx.globalAlpha = blink * 0.7;
        ctx.fillRect(sx * W, sy * horizon, 1.5, 1.5);
      });
      ctx.globalAlpha = 1;

      t += 0.016;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="grid-canvas" />;
}

/* ── Typewriter stat counter ── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const delay = setTimeout(() => requestAnimationFrame(tick), 2400);
    return () => clearTimeout(delay);
  }, [target]);
  return <>{count}{suffix}</>;
}

/* ── Corner bracket SVG ── */
const BracketCorner = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <path d="M2 24 L2 2 L24 2" stroke="#00ffe7" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/* ── Hero Section ── */
export default function HeroSection() {
  return (
    <>
      <style>{styles}</style>
      <section className="hero-root">

        <GridCanvas />
        <div className="scanlines" />
        <div className="vignette" />

        {/* Corners */}
        {["tl","tr","bl","br"].map(cls => (
          <div key={cls} className={`corner ${cls}`}><BracketCorner /></div>
        ))}

        {/* Nav */}
        <nav className="nav">
          <div className="nav-logo">NXVS // SYS</div>
          <ul className="nav-links">
            {["Protocol","Systems","Deploy","Docs"].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
          <div className="nav-status">
            <div className="status-dot" />
            ALL SYSTEMS NOMINAL
          </div>
        </nav>

        {/* Main content */}
        <div className="hero-content">
          <div className="system-tag">INITIALIZING // BUILD 2.9.4</div>

          <h1 className="hero-title">
            <div className="line"><span>BEYOND</span></div>
            <div className="line">
              <span className="glitch accent" data-text="HORIZON">HORIZON</span>
            </div>
            <div className="line"><span>PROTOCOL</span></div>
          </h1>

          <p className="hero-subtitle">
            Next-generation infrastructure for the systems that matter.
            Built at the edge of what machines can do — deployed where
            no framework has gone before.
          </p>

          <div className="cta-group">
            <button className="btn-primary">_ INITIALIZE</button>
            <button className="btn-secondary">VIEW DOCS →</button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat">
            <div className="stat-value"><Counter target={99} suffix="." /><span>9%</span></div>
            <div className="stat-label">Uptime SLA</div>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <div className="stat-value"><Counter target={412} /><span>ms</span></div>
            <div className="stat-label">Avg Latency</div>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <div className="stat-value"><Counter target={2} /><span>.4B</span></div>
            <div className="stat-label">Events / Day</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-label">Scroll</div>
          <div className="scroll-line" />
        </div>

      </section>
    </>
  );
}
