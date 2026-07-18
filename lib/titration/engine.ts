export type TitrationState = { addedMl: number; initialBaseMl: number; baseM: number; acidM: number; pH: number; equivalenceMl: number; excess: "hydroxide" | "hydronium" | "none"; totalMl: number; };
export function calculateTitration(addedMl: number, initialBaseMl = 25, baseM = 0.1, acidM = 0.1): TitrationState {
  const baseMoles = baseM * initialBaseMl / 1000; const acidMoles = acidM * addedMl / 1000; const totalMl = initialBaseMl + addedMl; const delta = acidMoles - baseMoles; const equivalenceMl = baseMoles / acidM * 1000;
  let pH = 7; let excess: TitrationState["excess"] = "none";
  if (delta > 1e-9) { excess = "hydronium"; pH = -Math.log10(delta / (totalMl / 1000)); }
  if (delta < -1e-9) { excess = "hydroxide"; pH = 14 + Math.log10((-delta) / (totalMl / 1000)); }
  return { addedMl, initialBaseMl, baseM, acidM, pH: Math.max(0, Math.min(14, pH)), equivalenceMl: Number(equivalenceMl.toFixed(8)), excess, totalMl };
}
