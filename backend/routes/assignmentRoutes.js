const express = require('express');
const router = express.Router();
const { TestAssignment, Test, sequelize } = require('../models');

// GET /api/assignments - Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await TestAssignment.findAll({
      include: [{
        model: Test,
        as: 'test',
        attributes: ['testId', 'name', 'description', 'status']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments'
    });
  }
});

// GET /api/assignments/:id - Get single assignment
router.get('/:id', async (req, res) => {
  try {
    const assignment = await TestAssignment.findByPk(req.params.id, {
      include: [{
        model: Test,
        as: 'test'
      }]
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignment'
    });
  }
});

module.exports = router;