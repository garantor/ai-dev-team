import React from 'react';
import { Workout } from '../../types';
import { formatOnlyDate, formatOnlyTime } from '../../utils/dateUtils';
import styles from './UpcomingWorkouts.module.css';

interface UpcomingWorkoutsProps {
  workouts: Workout[];
}

const UpcomingWorkouts: React.FC<UpcomingWorkoutsProps> = ({ workouts }) => {
  if (!workouts || workouts.length === 0) {
    return <p className={styles.noWorkouts}>No upcoming workouts scheduled. Time to plan one!</p>;
  }

  return (
    <ul className={styles.workoutList}>
      {workouts.map((workout) => (
        <li key={workout.id} className={styles.workoutItem}>
          <div className={styles.workoutHeader}>
            <span className={styles.workoutType}>{workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}</span>
            <span className={styles.workoutDate}>{formatOnlyDate(workout.date)}</span>
          </div>
          <div className={styles.workoutDetails}>
            <h3 className={styles.workoutName}>{workout.name}</h3>
            <p className={styles.workoutTimeLocation}>
              <span className={styles.time}>{formatOnlyTime(workout.date)}</span> at <span className={styles.location}>{workout.location}</span>
            </p>
          </div>
          <button className={styles.viewDetailsButton}>View Details</button>
        </li>
      ))}
    </ul>
  );
};

export default UpcomingWorkouts;
