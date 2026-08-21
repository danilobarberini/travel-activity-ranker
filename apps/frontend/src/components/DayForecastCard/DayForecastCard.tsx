import { ActivityScoreBadge } from '../ActivityScoreBadge/ActivityScoreBadge';
import {
  getBestActivityForDay,
  type ActivityScoreEntry,
} from '../../utils/best-activity-for-day';
import { getScoreTier } from '../../utils/score-tier';
import { ACTIVITY_LABELS } from '../../utils/activity-labels';
import styles from './DayForecastCard.module.css';

interface DayForecastCardProps {
  date: string;
  temperatureMaxC: number;
  temperatureMinC: number;
  precipitationSumMm: number;
  snowfallSumCm: number;
  activities: ActivityScoreEntry[];
}

// Non-breaking space, not a plain ' ' — browsers collapse whitespace-only
// text nodes to zero height, which broke this row's placeholder alignment.
const PLACEHOLDER_TEXT = ' ';

function formatWeekday(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('pt-BR', { weekday: 'short' });
}

function formatDayMonth(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatPrecipitation(
  precipitationSumMm: number,
  snowfallSumCm: number,
): string | null {
  const parts: string[] = [];
  if (precipitationSumMm > 0) parts.push(`${precipitationSumMm}mm de chuva`);
  if (snowfallSumCm > 0) parts.push(`${snowfallSumCm}cm de neve`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function DayForecastCard({
  date,
  temperatureMaxC,
  temperatureMinC,
  precipitationSumMm,
  snowfallSumCm,
  activities,
}: DayForecastCardProps) {
  const best = getBestActivityForDay(activities);
  const bestTier = getScoreTier(best?.score ?? null);
  const precipitationText = formatPrecipitation(
    precipitationSumMm,
    snowfallSumCm,
  );
  const reasoningText =
    best && best.reasoning.length > 0 ? best.reasoning[0] : null;

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <p className={styles.weekday}>{formatWeekday(date)}</p>
        <p className={styles.dayMonth}>{formatDayMonth(date)}</p>
      </header>

      <p className={styles.sectionLabel}>Recomendado</p>

      {/*
        Every row below is always rendered — when a piece of info doesn't apply
        (no rain/snow, no reasoning), it renders invisible (`visibility: hidden`)
        instead of being omitted. Combined with a reserved 2-line height on the
        activity name (long names like "Passeios ao ar livre" can wrap on some
        days and not others), that's what keeps every row's position fixed
        across all 7 cards without resorting to CSS `position` tricks.
      */}
      <div className={styles.summary} data-tier={bestTier.className}>
        <p
          className={`${styles.summaryActivity} ${best ? '' : styles.placeholder}`}
        >
          {best ? ACTIVITY_LABELS[best.activity] : PLACEHOLDER_TEXT}
        </p>

        <p className={styles.weatherLine}>
          {Math.round(temperatureMinC)}° – {Math.round(temperatureMaxC)}°C
        </p>

        <p
          className={`${styles.weatherLine} ${styles.precipLine} ${precipitationText ? '' : styles.placeholder}`}
        >
          {precipitationText ?? PLACEHOLDER_TEXT}
        </p>

        <p
          className={`${styles.reasoning} ${reasoningText ? '' : styles.placeholder}`}
        >
          {reasoningText ?? PLACEHOLDER_TEXT}
        </p>
      </div>

      <p className={styles.sectionLabel}>Todas as atividades</p>

      <div className={styles.allScores}>
        {activities.map((activity) => (
          <ActivityScoreBadge
            key={activity.activity}
            activity={activity.activity}
            score={activity.score}
            reasoning={activity.reasoning}
          />
        ))}
      </div>
    </article>
  );
}
