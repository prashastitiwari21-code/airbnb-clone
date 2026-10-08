
import jwt from "jsonwebtoken";
export const protect = (req, res, next) => {
      const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
    try {
    const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
    next();
      } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
export const hostOnly = (req, res, next) => {
  if (req.user.role !== "host") {
    return res.status(403).json({ message: "Only hosts can do this" });
  }
  next();
};