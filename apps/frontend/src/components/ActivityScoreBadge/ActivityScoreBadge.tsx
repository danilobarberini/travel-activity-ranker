import { useId } from 'react';
import { getScoreTier } from '../../utils/score-tier';
import { ACTIVITY_LABELS } from '../../utils/activity-labels';
import type { ActivityType } from '../../graphql/generated/graphql';
import tierStyles from '../../styles/tierColors.module.css';
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
  const tooltipId = useId();
  const hasReasoning = reasoning.length > 0;

  return (
    <div className={`${styles.badge} ${tierStyles[tier.className]}`}>
      {hasReasoning && (
        <span className={styles.infoWrapper}>
          <button
            type="button"
            className={styles.infoButton}
            aria-describedby={tooltipId}
          >
            i<span className={styles.srOnly}>Por que essa nota?</span>
          </button>
          <span id={tooltipId} role="tooltip" className={styles.tooltip}>
            {reasoning.join(' ')}
          </span>
        </span>
      )}
      <span className={styles.activityName}>{ACTIVITY_LABELS[activity]}</span>
      <span className={styles.scoreValue}>{score ?? '—'}</span>
      <span className={styles.tierLabel}>{tier.label}</span>
    </div>
  );
}
