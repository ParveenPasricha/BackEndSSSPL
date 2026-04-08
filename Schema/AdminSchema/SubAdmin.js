const mongoose  = require("mongoose");
const bcrypt = require("bcryptjs");

const subAdminSchema = new mongoose.Schema({
    name: {type: String, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true},
    password: {type: String},
    permissions: { type: [String], default: [] }
},{timestamps: true})

subAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* PASSWORD COMPARE */
subAdminSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("SubAdmin", subAdminSchema)