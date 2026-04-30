import mongoose from "mongoose";
import slugify from "slugify";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    avatar: String,

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    about: String,

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

  },
  {
    timestamps: true,
  }
);


workspaceSchema.pre("validate", async function () {
  if (!this.isModified("name") && this.slug) return;

  const baseSlug = slugify(this.name, {
    lower: true,
    strict: true,
  });

  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const existing = await this.constructor.findOne({
      slug,
      _id: { $ne: this._id },
    });

    if (!existing) break;

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  this.slug = slug;
});

export const Workspace = mongoose.model("Workspace", workspaceSchema);










