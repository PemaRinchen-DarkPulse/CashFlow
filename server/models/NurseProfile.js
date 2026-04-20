const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NurseProfile = sequelize.define("NurseProfile", {
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
  department: {
    type: DataTypes.STRING,
  },
  hospitalId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

module.exports = NurseProfile;
