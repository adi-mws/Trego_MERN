import { User } from "./user.model.js";

export const getUserGlobalData = async (req, res, next) => {
    try {
        const userId = req.user?.userId;

        //uth check
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await User.findById(userId)
            .select("-profile") 
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {
        next(error);
    }
};

// update user profile
export const updateUser = async (req, res, next) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const { name, about, avatar, profile, prefrences } = req.body;

        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (about !== undefined) updateData.about = about;
        if (avatar !== undefined) updateData.avatar = avatar;

        if (profile) {
            if (profile.githubUrl !== undefined)
                updateData["profile.githubUrl"] = profile.githubUrl;

            if (profile.linkedinUrl !== undefined)
                updateData["profile.linkedinUrl"] = profile.linkedinUrl;

            if (profile.facebookUrl !== undefined)
                updateData["profile.facebookUrl"] = profile.facebookUrl;
        }

        if (prefrences) {
            if (prefrences.theme !== undefined)
                updateData["prefrences.theme"] = prefrences.theme;

            if (prefrences.accentColor !== undefined)
                updateData["prefrences.accentColor"] = prefrences.accentColor;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields to update",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
            }
        ).select("-__v"); 

        return res.status(200).json({
            success: true,
            data: updatedUser,
        });

    } catch (error) {
        next(error);
    }
};