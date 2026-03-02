import React from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import Card from '../Card/Card';
import UpcomingWorkouts from '../UpcomingWorkouts/UpcomingWorkouts';
import RecentActivity from '../RecentActivity/RecentActivity';
import QuickActions from '../QuickActions/QuickActions';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { data, loading, error, refetch } = useDashboardData();

  if (loading) {
    return (
      <div className={`${styles.dashboardContainer} ${styles.loadingState}`}>
        <p className="loading-message">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.dashboardContainer} ${styles.errorState}`}>
        <p className="error-message">Error: {error}</p>
        <button onClick={refetch} className={styles.retryButton}>Retry</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${styles.dashboardContainer} ${styles.emptyState}`}>
        <p className="text-muted">No dashboard data available.</p>
        <button onClick={refetch} className={styles.retryButton}>Load Data</button>
      </div>
    );
  }

  const { upcomingWorkouts, recentActivity, quickActions } = data;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.quickActionsSection}>
        <Card title="Quick Actions" className={styles.fullWidthCard}>
          <QuickActions actions={quickActions} />
        </Card>
      </div>

      <div className={styles.mainGrid}>
        <Card title="Upcoming Workouts">
          <UpcomingWorkouts workouts={upcomingWorkouts} />
        </Card>
        <Card title="Recent Activity">
          <RecentActivity activity={recentActivity} />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
