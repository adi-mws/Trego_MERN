import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      required: true,
    },

    providerAccountId: {
      type: String,
      required: true,
    },

    password: {
      type: String, 
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* Prevent duplicate accounts */
accountSchema.index(
  { provider: 1, providerAccountId: 1 },
  { unique: true }
);

export const Account = mongoose.model("Account", accountSchema);