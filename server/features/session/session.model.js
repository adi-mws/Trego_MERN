import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    deviceId: {
      type: String,
      required: true,
      index: true,
    },

    ipAddress: String,
    browser: String,
    os: String,
    userAgent: String,

    tokenHash: String,

    status: {
      type: String,
      enum: ["PENDING_2FA", "ACTIVE", "REVOKED", "EXPIRED"],
      default: "PENDING_2FA",
      index: true,
    },

    twoFactor: {
      enabled: { type: Boolean, default: false },
      tokenHash: String,
      expiresAt: Date,
      verifiedAt: Date,
    },

    loggedInAt: {
      type: Date,
      default: Date.now,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

sessionSchema.index({ userId: 1, deviceId: 1 })

sessionSchema.methods.isExpired = function () {
  return this.expiresAt < new Date()
}

sessionSchema.methods.isActive = function () {
  return this.status === "ACTIVE" && !this.isExpired()
}

export default mongoose.model("Session", sessionSchema)