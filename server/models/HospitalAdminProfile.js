const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HospitalAdminProfile = sequelize.define("HospitalAdminProfile", {
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

module.exports = HospitalAdminProfile;
