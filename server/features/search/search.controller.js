import { searchWorkspaceEntities } from "./search.service.js";

export const searchWorkspaceController = async (req, res, next) => {
  try {
    const { workspaceSlug } = req.params;
    const { q } = req.query;
    const userId = req.user?.userId;

    const data = await searchWorkspaceEntities({
      workspaceSlug,
      query: q,
      userId,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
