export const convertWeight = (
  weight: number,
  from: "kg" | "lbs",
  to: "kg" | "lbs"
): number => {
  if (from === to) return weight;

  if (from === "kg" && to === "lbs") {
    return Math.round(weight * 2.205 * 100) / 100;
  }

  if (from === "lbs" && to === "kg") {
    return Math.round((weight / 2.205) * 100) / 100;
  }

  return weight;
};

export const formatWeight = (weight: number, unit: "kg" | "lbs"): string => {
  return `${weight} ${unit}`;
};

export const parseWeight = (
  weightString: string
): { value: number; unit: "kg" | "lbs" } | null => {
  const match = weightString.match(/^(\d+(?:\.\d+)?)\s*(kg|lbs?)$/i);
  if (!match) return null;

  return {
    value: parseFloat(match[1]),
    unit: match[2].toLowerCase().startsWith("lb") ? "lbs" : "kg",
  };
};
