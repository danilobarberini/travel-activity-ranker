export interface ScoreTier {
  label: string;
  className: 'excellent' | 'good' | 'fair' | 'poor' | 'unavailable';
}

/**
 * Never rely on color alone to convey the tier (accessibility) — every tier also
 * carries a short text label that the badge renders alongside the color.
 */
export function getScoreTier(score: number | null): ScoreTier {
  if (score === null) {
    return { label: 'Sem dados', className: 'unavailable' };
  }
  if (score >= 80) {
    return { label: 'Ótimo', className: 'excellent' };
  }
  if (score >= 60) {
    return { label: 'Bom', className: 'good' };
  }
  if (score >= 40) {
    return { label: 'Regular', className: 'fair' };
  }
  return { label: 'Ruim', className: 'poor' };
}
