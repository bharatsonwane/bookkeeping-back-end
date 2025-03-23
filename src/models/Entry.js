import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    schemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schema",
      required: true,
    }, // Links to the schema
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // User who created the entry
    entryData: { type: Object, required: true }, // JSON object storing form data based on the schema
  },
  { timestamps: true }
);

export default mongoose.model("Entry", entrySchema);
