// Middleware to protect admin routes
export const adminMiddleware = (req, res, next) => {
  const userRole = req.user?.role;
  if (userRole !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin role required." });
  }
  next();
};

export default adminMiddleware;
