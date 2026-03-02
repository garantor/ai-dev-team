import mongoose from 'mongoose';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
const EQUIPMENT_TYPES = ['Barbell', 'Dumbbell', 'Machine', 'Bodyweight', 'Kettlebell', 'Resistance Band', 'Cable', 'Other'];
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Exercise name must be at least 3 characters long'],
      maxlength: [100, 'Exercise name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    muscleGroup: {
      type: [String],
      required: [true, 'At least one muscle group is required'],
      enum: {
        values: MUSCLE_GROUPS,
        message: `{VALUE} is not a valid muscle group. Allowed values: ${MUSCLE_GROUPS.join(', ')}`,
      },
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one muscle group must be selected',
      },
    },
    equipment: {
      type: [String],
      required: [true, 'At least one equipment type is required'],
      enum: {
        values: EQUIPMENT_TYPES,
        message: `{VALUE} is not a valid equipment type. Allowed values: ${EQUIPMENT_TYPES.join(', ')}`,
      },
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one equipment type must be selected',
      },
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: {
        values: DIFFICULTY_LEVELS,
        message: `{VALUE} is not a valid difficulty level. Allowed values: ${DIFFICULTY_LEVELS.join(', ')}`,
      },
    },
    isCompound: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;
