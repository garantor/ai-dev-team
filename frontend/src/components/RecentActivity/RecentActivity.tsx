import React from 'react';
import { ActivityItem } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import styles from './RecentActivity.module.css';

interface RecentActivityProps {
  activity: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activity }) => {
  if (!activity || activity.length === 0) {
    return <p className={styles.noActivity}>No recent activity to display.</p>;
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'workout_completed': return '✅';
      case 'goal_achieved': return '🏆';
      case 'new_record': return '⚡';
      case 'measurement_updated': return '📏';
      default: return '📄';
    }
  };

  return (
    <ul className={styles.activityList}>
      {activity.map((item) => (
        <li key={item.id} className={styles.activityItem}>
          <span className={styles.activityIcon}>{getActivityIcon(item.type)}</span>
          <div className={styles.activityContent}>
            <p className={styles.activityDescription}>{item.description}</p>
            {item.details && <p className={styles.activityDetails}>{item.details}</p>}
            <span className={styles.activityTimestamp}>{formatDate(item.timestamp, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RecentActivity;
