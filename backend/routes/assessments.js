const express = require('express');
const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');

const router = express.Router();

// GET /api/assessments
// Optional query params:
//   - skill: filter assessments by skill name
router.get('/', async (req, res, next) => {
  try {
    const { skill } = req.query;

    const filter = {};
    if (skill) {
      filter.skill = skill;
    }

    const assessments = await Assessment.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, data: assessments });
  } catch (err) {
    next(err);
  }
});

// GET /api/assessments/:id
// Retrieve a single assessment by its MongoDB ObjectId
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid assessment id' });
    }

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, error: 'Assessment not found' });
    }

    res.json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
});

// POST /api/assessments
// Create a new assessment document
router.post('/', async (req, res, next) => {
  try {
    const { title, skill, difficulty, description } = req.body;

    if (!title || !skill) {
      return res.status(400).json({
        success: false,
        error: 'Both "title" and "skill" fields are required',
      });
    }

    const assessment = await Assessment.create({
      title: title.trim(),
      skill: skill.trim(),
      difficulty: difficulty || 'Beginner',
      description: description || '',
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: err.message });
    }

    next(err);
  }
});

module.exports = router;
