import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    schemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schema",
      required: true,
    }, // Links to the schema
    entryData: { type: Object, required: true }, // JSON object storing form data based on the schema
  },
  { timestamps: true }
);

export default mongoose.model("Entry", entrySchema);
