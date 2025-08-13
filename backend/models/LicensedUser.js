const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const LicensedUser = sequelize.define('LicensedUser', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuidv4,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    sin_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    activated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    license_id: {
      type: DataTypes.UUID,
      allowNull: false,
    }
  }, {
    tableName: 'license_user',
    timestamps: true,
    underscored: true,
  });

  LicensedUser.associate = (models) => {
    LicensedUser.belongsTo(models.License, {
      foreignKey: 'license_id',
      as: 'license',
    });
  };

  return LicensedUser;
};
