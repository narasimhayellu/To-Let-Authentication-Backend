const jwt = require("jsonwebtoken");

const requireSignIn = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).send({ message: "Unauthorized: No token provided" });
    }

    // Handle "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send({ message: "Token has expired" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).send({ message: "Invalid token" });
    }
    return res.status(401).send({ message: "Authentication failed" });
  }
};

module.exports = requireSignIn;
