import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["superAdmin", "admin", "manager", "user"], default: "user" },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
//   if (!this.isModified("passwordHash")) return next();
//   this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

export default mongoose.model("User", userSchema);
