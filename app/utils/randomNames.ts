const NOUNS = [
  "Robot", "Motor", "Tornillo", "Tuerca", "Cable", "Sensor", "Circuito", "Chip",
  "Bocina", "Engrane", "Imán", "Eje", "Chasis", "Botón", "Led", "Rueda",
  "Control", "Batería", "Lek", "Bloque"
];

const ADJECTIVES = [
  "Asombroso", "Veloz", "Brillante", "Feliz", "Valiente", "Chispeante", "Radiante",
  "Increíble", "Giga", "Sónico", "Poderoso", "Inteligente", "Silencioso", "Rápido",
  "Fuerte", "Aventurero", "Luminoso", "Dinámico", "Magistral", "Curioso"
];

export const generateRandomName = (): string => {
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  return `${noun} ${adj}`;
};
