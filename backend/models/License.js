const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const License = sequelize.define('License', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuidv4,
    },
    plan_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    tableName: 'licenses',
    timestamps: true,
    underscored: true,
  });

  License.associate = (models) => {
    License.hasMany(models.LicensedUser, {
      foreignKey: 'license_id',
      as: 'users',
    });
  };

  return License;
};
