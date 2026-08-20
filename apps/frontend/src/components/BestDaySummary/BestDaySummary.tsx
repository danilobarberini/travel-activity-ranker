import { getBestDayPerActivity } from '../../utils/best-day-per-activity';
import { ACTIVITY_LABELS } from '../../utils/activity-labels';
import type { ActivityType } from '../../graphql/generated/graphql';
import styles from './BestDaySummary.module.css';

interface BestDaySummaryProps {
  days: Array<{
    date: string;
    activities: Array<{ activity: ActivityType; score: number | null }>;
  }>;
}

function formatLongDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });
}

export function BestDaySummary({ days }: BestDaySummaryProps) {
  const bestByActivity = getBestDayPerActivity(days);
  const entries = Object.entries(bestByActivity) as Array<
    [ActivityType, { date: string; score: number }]
  >;

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className={styles.summary} aria-label="Melhor dia por atividade">
      <h2 className={styles.title}>Melhor dia pra cada atividade</h2>
      <ul className={styles.list}>
        {entries.map(([activity, best]) => (
          <li key={activity} className={styles.item}>
            <span className={styles.activity}>{ACTIVITY_LABELS[activity]}</span>
            <span className={styles.day}>{formatLongDate(best.date)}</span>
            <span className={styles.score}>{best.score}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
