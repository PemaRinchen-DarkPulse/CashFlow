const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LabTechnicianProfile = sequelize.define("LabTechnicianProfile", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: { model: "Users", key: "id" },
  },
  licenseNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  hospitalId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING,
  },
  avatar: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

module.exports = LabTechnicianProfile;
