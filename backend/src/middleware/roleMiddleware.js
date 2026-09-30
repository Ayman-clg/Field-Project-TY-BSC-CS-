/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if req.user role is in the allowed roles list
 * @param  {...string} roles - e.g. 'Admin', 'Manager', 'Clerk'
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};
