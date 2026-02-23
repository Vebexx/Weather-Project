import { useEffect, useRef } from "react";

const WEATHER_CONFIGS = {
  sunny: {
    bg: "linear-gradient(160deg, #0f1f3d 0%, #1a3a6b 50%, #0a0f1e 100%)",
    particles: { count: 6, type: "ray" },
  },
  cloudy: {
    bg: "linear-gradient(160deg, #0d1b2a 0%, #1b2a3d 50%, #080e1d 100%)",
    particles: { count: 18, type: "cloud-particle" },
  },
  rain: {
    bg: "linear-gradient(160deg, #080f1a 0%, #0f1e30 50%, #050a10 100%)",
    particles: { count: 80, type: "rain" },
  },
  snow: {
    bg: "linear-gradient(160deg, #0d1520 0%, #1a2640 50%, #080e1d 100%)",
    particles: { count: 50, type: "snow" },
  },
  night: {
    bg: "linear-gradient(160deg, #020509 0%, #080e1d 50%, #030710 100%)",
    particles: { count: 80, type: "star" },
  },
  storm: {
    bg: "linear-gradient(160deg, #050810 0%, #0a0f1a 50%, #030508 100%)",
    particles: { count: 60, type: "rain" },
  },
};

export function getWeatherType(code, timeOfDay) {
  if (timeOfDay === "night" && code === 0) return "night";
  if (code === 0) return "sunny";
  if ([1, 2, 3].includes(code)) return "cloudy";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return timeOfDay === "night" ? "night" : "cloudy";
}

export default function WeatherBackground({ weatherType = "night" }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const config = WEATHER_CONFIGS[weatherType] || WEATHER_CONFIGS.night;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const { count, type } = config.particles;
    particlesRef.current = Array.from({ length: count }, (_, i) => {
      if (type === "rain") {
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          len: Math.random() * 18 + 10,
          speed: Math.random() * 8 + 10,
          opacity: Math.random() * 0.4 + 0.1,
          width: Math.random() * 1 + 0.5,
        };
      }
      if (type === "snow") {
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 2.5 + 0.5,
          speed: Math.random() * 0.8 + 0.2,
          drift: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.6 + 0.2,
        };
      }
      if (type === "star") {
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 1.2 + 0.2,
          opacity: Math.random() * 0.8 + 0.1,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
        };
      }
      if (type === "ray") {
        return {
          angle: (i / count) * Math.PI * 0.4 - 0.2,
          opacity: Math.random() * 0.04 + 0.01,
          width: Math.random() * 120 + 60,
          speed: Math.random() * 0.0003 + 0.0001,
          offset: Math.random() * Math.PI * 2,
        };
      }
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.6,
        r: Math.random() * 60 + 30,
        opacity: Math.random() * 0.04 + 0.01,
        speed: Math.random() * 0.15 + 0.05,
      };
    });

    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const p = particlesRef.current;

      if (type === "rain" || type === "storm") {
        p.forEach((drop) => {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(174, 214, 241, ${drop.opacity})`;
          ctx.lineWidth = drop.width;
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.len);
          ctx.stroke();
          drop.y += drop.speed;
          drop.x -= 1.5;
          if (drop.y > canvas.height) {
            drop.y = -drop.len;
            drop.x = Math.random() * canvas.width;
          }
        });
        if (type === "storm" && Math.random() < 0.002) {
          ctx.fillStyle = "rgba(200, 220, 255, 0.03)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      if (type === "snow") {
        p.forEach((flake) => {
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220, 235, 255, ${flake.opacity})`;
          ctx.fill();
          flake.y += flake.speed;
          flake.x += flake.drift;
          if (flake.y > canvas.height) {
            flake.y = -5;
            flake.x = Math.random() * canvas.width;
          }
        });
      }

      if (type === "star") {
        p.forEach((star) => {
          const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
          const op = star.opacity * (0.6 + 0.4 * twinkle);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210, 225, 255, ${op})`;
          ctx.fill();
        });
      }

      if (type === "ray") {
        const cx = canvas.width * 0.7;
        const cy = -50;
        p.forEach((ray) => {
          const wobble = Math.sin(frame * ray.speed + ray.offset) * 0.05;
          const a = ray.angle + wobble;
          const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * canvas.height * 1.5, cy + Math.sin(a) * canvas.height * 1.5);
          grad.addColorStop(0, `rgba(255, 220, 100, ${ray.opacity * 2})`);
          grad.addColorStop(1, "rgba(255, 200, 50, 0)");
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a - ray.width / 10000) * canvas.height * 2, cy + Math.sin(a - ray.width / 10000) * canvas.height * 2);
          ctx.lineTo(cx + Math.cos(a + ray.width / 10000) * canvas.height * 2, cy + Math.sin(a + ray.width / 10000) * canvas.height * 2);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        });
      }

      if (type === "cloud-particle") {
        p.forEach((cloud) => {
          const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r);
          grad.addColorStop(0, `rgba(180, 200, 220, ${cloud.opacity})`);
          grad.addColorStop(1, "rgba(180,200,220,0)");
          ctx.beginPath();
          ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          cloud.x += cloud.speed;
          if (cloud.x - cloud.r > canvas.width) cloud.x = -cloud.r;
        });
      }

      frame++;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [weatherType]);

 return (
  <>
    <div
      className="fixed inset-0 transition-all duration-[2000ms]"
      style={{ background: config.bg, zIndex: -100 }}
    />
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -99 }}
    />
  </>
);}