import { ActivityScoreBadge } from '../ActivityScoreBadge/ActivityScoreBadge';
import type { ActivityType } from '../../graphql/generated/graphql';
import styles from './DayForecastCard.module.css';

interface DayForecastCardProps {
  date: string;
  temperatureMaxC: number;
  temperatureMinC: number;
  precipitationSumMm: number;
  activities: Array<{
    activity: ActivityType;
    score: number | null;
    reasoning: string[];
  }>;
}

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

export function DayForecastCard({
  date,
  temperatureMaxC,
  temperatureMinC,
  precipitationSumMm,
  activities,
}: DayForecastCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.date}>{formatDate(date)}</h3>
        <p className={styles.weatherSummary}>
          {Math.round(temperatureMinC)}° – {Math.round(temperatureMaxC)}°C
          {precipitationSumMm > 0 ? ` · ${precipitationSumMm}mm de chuva` : ''}
        </p>
      </header>
      <div className={styles.activitiesGrid}>
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
