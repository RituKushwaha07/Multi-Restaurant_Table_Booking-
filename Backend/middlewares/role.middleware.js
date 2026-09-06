const authorize = (...roles) => {
    return (req, res, next) => {
         console.log("Logged User Role:", req.user.role);
         console.log("Allowed Roles:", roles);
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not authorized.",
            });
        }

        next();
    };
};

module.exports = authorize;