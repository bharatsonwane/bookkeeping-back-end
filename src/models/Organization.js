import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    establishedDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
