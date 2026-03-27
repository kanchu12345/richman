/**
 * tsParticles Configuration
 * - Dark theme background
 * - Glowing nodes in light blue (#00c6ff) and deep blue (#0072ff)
 * - Smooth, slow movement for premium feel
 * - Subtle mouse interaction (grab mode)
 */

tsParticles.load("tsparticles", {
  fpsLimit: 60,
  fullScreen: {
    enable: true,
    zIndex: -1
  },
  particles: {
    number: {
      value: 70,
      density: {
        enable: true,
        area: 800
      }
    },
    color: {
      value: ["#00c6ff", "#0072ff"]
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.4,
      random: true,
      animation: {
        enable: true,
        speed: 1,
        minimumValue: 0.1,
        sync: false
      }
    },
    size: {
      value: { min: 1, max: 3 },
      random: true,
      animation: {
        enable: true,
        speed: 2,
        minimumValue: 0.1,
        sync: false
      }
    },
    links: {
      enable: true,
      distance: 150,
      color: "#00c6ff",
      opacity: 0.3,
      width: 1,
      triangles: {
        enable: false,
        opacity: 0.05
      }
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none",
      random: false,
      straight: false,
      outModes: {
        default: "out"
      },
      attract: {
        enable: true,
        rotateX: 600,
        rotateY: 1200
      }
    }
  },
  interactivity: {
    detectsOn: "canvas",
    events: {
      onHover: {
        enable: true,
        mode: "grab"
      },
      onClick: {
        enable: true,
        mode: "push"
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 180,
        links: {
          opacity: 0.8
        }
      },
      push: {
        quantity: 3
      }
    }
  },
  detectRetina: true,
  background: {
    color: "#050510"
  }
});
