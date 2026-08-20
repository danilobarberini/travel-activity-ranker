import { getScoreTier } from '../../utils/score-tier';
import { ACTIVITY_LABELS } from '../../utils/activity-labels';
import type { ActivityType } from '../../graphql/generated/graphql';
import styles from './ActivityScoreBadge.module.css';

interface ActivityScoreBadgeProps {
  activity: ActivityType;
  score: number | null;
  reasoning: string[];
}

export function ActivityScoreBadge({
  activity,
  score,
  reasoning,
}: ActivityScoreBadgeProps) {
  const tier = getScoreTier(score);

  return (
    <div
      className={`${styles.badge} ${styles[tier.className]}`}
      title={reasoning.length > 0 ? reasoning.join(' ') : undefined}
    >
      <span className={styles.activityName}>{ACTIVITY_LABELS[activity]}</span>
      <span className={styles.scoreRow}>
        <span className={styles.scoreValue}>{score ?? '—'}</span>
        <span className={styles.tierLabel}>{tier.label}</span>
      </span>
    </div>
  );
}
