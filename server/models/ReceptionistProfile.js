const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReceptionistProfile = sequelize.define("ReceptionistProfile", {
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
  department: {
    type: DataTypes.STRING,
  },
  avatar: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

module.exports = ReceptionistProfile;
