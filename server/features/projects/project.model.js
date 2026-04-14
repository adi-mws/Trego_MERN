import mongoose from "mongoose";
import slugify from "slugify";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: String,
    avatar: String,

    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    slug: {
      type: String,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

projectSchema.pre("validate", async function () {
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
      workspace: this.workspace,
    });

    if (!existing) break;

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  this.slug = slug;
});

export const Project = mongoose.model("Project", projectSchema);