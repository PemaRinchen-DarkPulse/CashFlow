const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Hospital = sequelize.define(
  "Hospital",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "National Referral Hospital",
        "Regional Referral Hospital",
        "District Hospital",
        "Traditional Medicine Hospital",
      ),
      allowNull: false,
    },
    addressLine: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dzongkhag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gewog: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue: "Active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Hospital;
