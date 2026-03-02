import mongoose from 'mongoose';

const exerciseSchema = mongoose.Schema(
  {
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Workout',
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    sets: {
      type: Number,
      required: true,
      min: 1,
    },
    reps: {
      type: Number,
      required: true,
      min: 1,
    },
    weight: {
      type: Number,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs', 'bodyweight'],
      default: 'kg',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;
