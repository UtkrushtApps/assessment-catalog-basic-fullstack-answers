const mongoose = require('mongoose');

const { Schema } = mongoose;

const AssessmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    skill: {
      type: String,
      required: true,
      trim: true,
      index: true, // single-field index on commonly queried field
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Extra explicit index in case you want to ensure its presence even
// if you remove `index: true` from the field definition above.
AssessmentSchema.index({ skill: 1 });

module.exports = mongoose.model('Assessment', AssessmentSchema);
