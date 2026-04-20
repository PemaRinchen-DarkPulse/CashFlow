const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PatientProfile = sequelize.define("PatientProfile", {
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
  cid: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    comment: "Citizen ID number",
  },
  healthId: {
    type: DataTypes.STRING,
    unique: true,
    comment: "App-generated health ID (e.g. BT-AIM-20260418-0042)",
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  bloodType: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  allergies: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  emergencyContactName: {
    type: DataTypes.STRING,
  },
  emergencyContactRelation: {
    type: DataTypes.STRING,
  },
  emergencyContactPhone: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (profile) => {
      if (!profile.healthId) {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const seq = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
        profile.healthId = `BT-AIM-${date}-${seq}`;
      }
    },
  },
});

module.exports = PatientProfile;
