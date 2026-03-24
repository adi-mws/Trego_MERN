import { markAsRead, markAsCleared } from "../services/notification.service.js";

export async function markNotificationsRead(req, res) {
    try {
        const userId = req.auth?.data?._id;
        const { ids } = req.body;
        console.log(ids)
        const result = await markAsRead(ids, userId);

        return res.json({
            success: true,
            result
        });

    } catch (err) {
        console.error("markNotificationsRead:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
}



export async function markNotificationsCleared(req, res) {
    try {
        const userId = req.auth?.data?._id;
        const { ids } = req.body;

        const result = await markAsCleared(ids, userId);

        return res.json({
            success: true,
            result
        });

    } catch (err) {
        console.error("markNotificationsCleared:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
}

