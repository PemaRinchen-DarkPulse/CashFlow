const User = require("./User");
const PatientProfile = require("./PatientProfile");
const DoctorProfile = require("./DoctorProfile");
const PharmacistProfile = require("./PharmacistProfile");
const NurseProfile = require("./NurseProfile");
const ReceptionistProfile = require("./ReceptionistProfile");
const LabTechnicianProfile = require("./LabTechnicianProfile");
const HospitalAdminProfile = require("./HospitalAdminProfile");
const SuperAdminProfile = require("./SuperAdminProfile");
const Hospital = require("./Hospital");

// Associations
User.hasOne(PatientProfile, { foreignKey: "userId", as: "patientProfile" });
PatientProfile.belongsTo(User, { foreignKey: "userId" });

User.hasOne(DoctorProfile, { foreignKey: "userId", as: "doctorProfile" });
DoctorProfile.belongsTo(User, { foreignKey: "userId" });

User.hasOne(PharmacistProfile, { foreignKey: "userId", as: "pharmacistProfile" });
PharmacistProfile.belongsTo(User, { foreignKey: "userId" });

User.hasOne(NurseProfile, { foreignKey: "userId", as: "nurseProfile" });
NurseProfile.belongsTo(User, { foreignKey: "userId" });

User.hasOne(ReceptionistProfile, { foreignKey: "userId", as: "receptionistProfile" });
ReceptionistProfile.belongsTo(User, { foreignKey: "userId" });

User.hasOne(LabTechnicianProfile, { foreignKey: "userId", as: "labTechnicianProfile" });
LabTechnicianProfile.belongsTo(User, { foreignKey: "userId" });

User.hasOne(HospitalAdminProfile, { foreignKey: "userId", as: "hospitalAdminProfile" });
HospitalAdminProfile.belongsTo(User, { foreignKey: "userId" });

User.hasOne(SuperAdminProfile, { foreignKey: "userId", as: "superAdminProfile" });
SuperAdminProfile.belongsTo(User, { foreignKey: "userId" });

// Map role to profile model and association alias
const roleProfileMap = {
  patient: { model: PatientProfile, alias: "patientProfile" },
  doctor: { model: DoctorProfile, alias: "doctorProfile" },
  pharmacist: { model: PharmacistProfile, alias: "pharmacistProfile" },
  nurse: { model: NurseProfile, alias: "nurseProfile" },
  receptionist: { model: ReceptionistProfile, alias: "receptionistProfile" },
  lab_technician: { model: LabTechnicianProfile, alias: "labTechnicianProfile" },
  hospital_admin: { model: HospitalAdminProfile, alias: "hospitalAdminProfile" },
  super_admin: { model: SuperAdminProfile, alias: "superAdminProfile" },
};

module.exports = {
  User,
  PatientProfile,
  DoctorProfile,
  PharmacistProfile,
  NurseProfile,
  ReceptionistProfile,
  LabTechnicianProfile,
  HospitalAdminProfile,
  SuperAdminProfile,
  Hospital,
  roleProfileMap,
};
