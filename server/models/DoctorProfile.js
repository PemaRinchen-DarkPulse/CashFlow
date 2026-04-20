const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoctorProfile = sequelize.define("DoctorProfile", {
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
  specialization: {
    type: DataTypes.STRING,
  },
  licenseNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  hospitalId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  experience: {
    type: DataTypes.INTEGER,
    comment: "Years of experience",
  },
  avatar: {
    type: DataTypes.STRING,
  },
  bio: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = DoctorProfile;
