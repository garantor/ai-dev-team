import mongoose from 'mongoose';

const workoutSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    userId: {
      // This could be a reference to a User model, but for this task, a simple string is sufficient.
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;
