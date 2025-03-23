import mongoose from "mongoose";

const schemaModel = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    version: { type: String, required: true },
    type: { type: String, enum: ["schema"], default: "schema" },
    children: { type: Array, required: true },
    isValidated: { type: Boolean, default: false },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    }, // Reference
  },
  { timestamps: true }
);

export default mongoose.model("Schema", schemaModel);
