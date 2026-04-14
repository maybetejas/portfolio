export const phaseDefinitions = [
  {
    key: "sunrise",
    label: "Sunrise",
    rangeLabel: "5-7 AM",
    startHour: 5,
    endHour: 7,
    colors: ["#7f5a93", "#b07ca8", "#e1b0c6", "#8b7ad3"]
  },
  {
    key: "morning",
    label: "Morning",
    rangeLabel: "7-11 AM",
    startHour: 7,
    endHour: 11,
    colors: ["#7f7db0", "#9aa4d8", "#cfcdf0", "#9c89dc"]
  },
  {
    key: "midday",
    label: "Midday",
    rangeLabel: "11 AM-4 PM",
    startHour: 11,
    endHour: 16,
    colors: ["#736dc4", "#8d93df", "#cbc7f3", "#a38bdc"]
  },
  {
    key: "sunset",
    label: "Sunset",
    rangeLabel: "4-7 PM",
    startHour: 16,
    endHour: 19,
    colors: ["#8e5ea2", "#c07eb6", "#ebb0c8", "#a579e0"]
  },
  {
    key: "twilight",
    label: "Twilight",
    rangeLabel: "7-10 PM",
    startHour: 19,
    endHour: 22,
    colors: ["#4f3678", "#644c96", "#7b64b7", "#9a83e1"]
  },
  {
    key: "night",
    label: "Night",
    rangeLabel: "10 PM-5 AM",
    startHour: 22,
    endHour: 29,
    colors: ["#16091f", "#24103a", "#352259", "#4e357f"]
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
