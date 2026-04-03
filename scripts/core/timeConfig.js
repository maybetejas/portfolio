export const phaseDefinitions = [
  {
    key: "sunrise",
    label: "Sunrise",
    rangeLabel: "5-7 AM",
    startHour: 5,
    endHour: 7,
    colors: ["#b86a5a", "#d89a84", "#e8cfc0", "#6f78b8"]
  },
  {
    key: "morning",
    label: "Morning",
    rangeLabel: "7-11 AM",
    startHour: 7,
    endHour: 11,
    colors: ["#7f9bb8", "#a9c2d6", "#d6e6f2", "#7a84c9"]
  },
  {
    key: "midday",
    label: "Midday",
    rangeLabel: "11 AM-4 PM",
    startHour: 11,
    endHour: 16,
    colors: ["#5f9fcc", "#8fc2e0", "#c7e4f2", "#8c96d6"]
  },
  {
    key: "sunset",
    label: "Sunset",
    rangeLabel: "4-7 PM",
    startHour: 16,
    endHour: 19,
    colors: ["#b86a5a", "#d89a84", "#e8cfc0", "#7d86c9"]
  },
  {
    key: "twilight",
    label: "Twilight",
    rangeLabel: "7-10 PM",
    startHour: 19,
    endHour: 22,
    colors: ["#2a3a4f", "#3c4f6b", "#5a6f9a", "#7f86d9"]
  },
  {
    key: "night",
    label: "Night",
    rangeLabel: "10 PM-5 AM",
    startHour: 22,
    endHour: 29,
    colors: ["#020111", "#0a1a2f", "#101c33", "#2a2f5a"]
  }
];

export const phasePreviewHours = phaseDefinitions.map(phase => ({
  key: phase.key,
  label: phase.label,
  rangeLabel: phase.rangeLabel,
  previewHour: phase.startHour
}));

export function normalizeHour(hour) {
  return hour < phaseDefinitions[0].startHour ? hour + 24 : hour;
}

export function getPhaseByHour(hour) {
  const normalizedHour = normalizeHour(hour);
  const phase =
    phaseDefinitions.find(
      item =>
        normalizedHour >= item.startHour && normalizedHour < item.endHour
    ) || phaseDefinitions[phaseDefinitions.length - 1];

  return phase;
}

export function getPhaseStartHour(phaseKey) {
  const phase = phaseDefinitions.find(item => item.key === phaseKey);
  return phase ? phase.startHour : phaseDefinitions[0].startHour;
}
