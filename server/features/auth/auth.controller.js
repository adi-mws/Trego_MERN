export const sendVerififcationData = async (req, res) => {
    try {
        if (!req.auth) {
            return res.status(401).json({ message: "Unauthorised: Auth not found" });
        }
        return res.status(200).json({message: "Auth Verified", role: req.auth.role, data: req.auth.data})
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server error", error: error });
    }
}