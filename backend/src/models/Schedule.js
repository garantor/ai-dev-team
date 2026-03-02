import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true,
  },
  sets: {
    type: Number,
    required: [true, 'Number of sets is required'],
    min: [1, 'Sets must be at least 1'],
  },
  reps: {
    type: Number,
    required: [true, 'Number of reps is required'],
    min: [1, 'Reps must be at least 1'],
  },
});

const scheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Schedule title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Schedule date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format'],
      validate: {
        validator: function (value) {
          // Simple validation: endTime must be after startTime
          // More robust validation would consider date as well
          const start = parseInt(this.startTime.replace(':', ''));
          const end = parseInt(value.replace(':', ''));
          return end > start;
        },
        message: 'End time must be after start time',
      },
    },
    exercises: {
      type: [exerciseSchema],
      default: [],
    },
    // If user authentication were implemented, we would link schedules to users
    // user: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
  },
  {
    timestamps: true,
  }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;
