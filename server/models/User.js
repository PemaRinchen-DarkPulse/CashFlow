const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
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
    cid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: "Citizen ID number",
    },
    healthId: {
      type: DataTypes.STRING,
      unique: true,
      comment: "App-generated health ID (e.g. BT-AIM-20260418-0042)",
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATEONLY,
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
    role: {
      type: DataTypes.ENUM("patient", "health_provider", "pharmacy"),
      defaultValue: "patient",
      allowNull: false,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        if (!user.healthId) {
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          const seq = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
          user.healthId = `BT-AIM-${date}-${seq}`;
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toSafeJSON = function () {
  const values = { ...this.toJSON() };
  delete values.password;
  return values;
};

module.exports = User;
