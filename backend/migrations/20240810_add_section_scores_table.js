const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('section_scores', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      test_session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'test_sessions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sections',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      marks_obtained: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      max_marks: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      answers: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      result_json: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'not_started'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('section_scores', ['test_session_id', 'section_id'], {
      unique: true,
      name: 'unique_session_section'
    });

    await queryInterface.addIndex('section_scores', ['test_session_id'], {
      name: 'idx_section_scores_test_session_id'
    });

    await queryInterface.addIndex('section_scores', ['section_id'], {
      name: 'idx_section_scores_section_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('section_scores');
  }
};
