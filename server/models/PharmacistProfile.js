const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PharmacistProfile = sequelize.define("PharmacistProfile", {
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
  pharmacyName: {
    type: DataTypes.STRING,
  },
  pharmacyLocation: {
    type: DataTypes.STRING,
  },
  avatar: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

module.exports = PharmacistProfile;
