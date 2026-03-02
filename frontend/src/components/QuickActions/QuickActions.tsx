import React from 'react';
import { QuickAction } from '../../types';
import styles from './QuickActions.module.css';

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  if (!actions || actions.length === 0) {
    return <p className={styles.noActions}>No quick actions available.</p>;
  }

  return (
    <div className={styles.actionsGrid}>
      {actions.map((action) => (
        <button key={action.id} className={styles.actionButton} onClick={action.action}>
          <span className={styles.actionIcon}>{action.icon}</span>
          <span className={styles.actionLabel}>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
