function hexToRgbString(hex) {
  const value = parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `${red}, ${green}, ${blue}`;
}

function buildAtmosphericSky(colors) {
  const [top, upperMid, lowerMid, horizon] = colors;
  const topRgb = hexToRgbString(top);
  const upperMidRgb = hexToRgbString(upperMid);
  const lowerMidRgb = hexToRgbString(lowerMid);
  const horizonRgb = hexToRgbString(horizon);

  return `
    radial-gradient(circle at 50% 18%, rgba(${upperMidRgb}, 0.38) 0%, rgba(${upperMidRgb}, 0.16) 24%, transparent 58%),
    radial-gradient(circle at 22% 24%, rgba(${horizonRgb}, 0.28) 0%, transparent 38%),
    radial-gradient(circle at 78% 30%, rgba(${lowerMidRgb}, 0.22) 0%, transparent 42%),
    radial-gradient(circle at 50% 78%, rgba(${topRgb}, 0.16) 0%, transparent 48%),
    linear-gradient(
      to bottom,
      ${top} 0%,
      ${upperMid} 24%,
      ${lowerMid} 58%,
      ${horizon} 100%
    )
  `;
}

export function createSkySystem({ element, timeEngine }) {
  return {
    init() {
      timeEngine.subscribe(() => {
        const colors = timeEngine.getInterpolatedColors();
        element.style.background = buildAtmosphericSky(colors);
      });
    }
  };
}
