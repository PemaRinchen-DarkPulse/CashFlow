const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SuperAdminProfile = sequelize.define("SuperAdminProfile", {
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
  avatar: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

module.exports = SuperAdminProfile;
