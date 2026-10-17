const SOFT_LIGHTS = [
  {
    top: "18%",
    left: "20%",
    size: "95vmin",
    core: "rgba(168, 85, 255, 1)",
    mid: "rgba(168, 85, 255, 0.55)",
    delay: "0s",
    duration: "16s",
    mobile: true,
  },
  {
    top: "70%",
    left: "78%",
    size: "110vmin",
    core: "rgba(255, 20, 180, 1)",
    mid: "rgba(255, 20, 180, 0.5)",
    delay: "-4s",
    duration: "20s",
    mobile: true,
  },
  {
    top: "48%",
    left: "52%",
    size: "100vmin",
    core: "rgba(0, 245, 255, 0.95)",
    mid: "rgba(0, 245, 255, 0.45)",
    delay: "-8s",
    duration: "18s",
    mobile: true,
  },
  {
    top: "12%",
    left: "82%",
    size: "80vmin",
    core: "rgba(80, 255, 90, 0.9)",
    mid: "rgba(80, 255, 90, 0.4)",
    delay: "-2s",
    duration: "17s",
    mobile: false,
  },
  {
    top: "86%",
    left: "28%",
    size: "88vmin",
    core: "rgba(192, 132, 255, 1)",
    mid: "rgba(192, 132, 255, 0.48)",
    delay: "-11s",
    duration: "22s",
    mobile: false,
  },
] as const;

export function WorldBackdrop() {
  return (
    <div className="world-underlay" aria-hidden="true">
      <div className="soft-lights">
        {SOFT_LIGHTS.map((light, index) => (
          <span
            key={index}
            className={light.mobile ? "soft-light" : "soft-light soft-light--desktop"}
            style={{
              top: light.top,
              left: light.left,
              width: light.size,
              height: light.size,
              background: `radial-gradient(circle, ${light.core} 0%, ${light.mid} 32%, transparent 74%)`,
              animationDelay: light.delay,
              animationDuration: light.duration,
            }}
          />
        ))}
      </div>
    </div>
  );
}
