import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(403).json({ message: "No access token provided." });
    }
    try {
      const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = data.id;
      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return res
            .status(401)
            .json({ message: "No refresh token provided." });
        }
        try {
          const user = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
          );
          const accessToken = jwt.sign(
            { id: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
          );
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
          });
          req.user = user.id;
          return next();
        } catch (refreshError) {
          return res.status(403).json({ message: "Invalid refresh token." });
        }
      } else {
        return res
          .status(403)
          .json({ message: "You do not have permission to view this page." });
      }
    }
  } catch (unexpectedError) {
    console.error("Authentication error:", unexpectedError);
    return res
      .status(500)
      .json({ message: "Authentication failed due to server error." });
  }
};

export default authenticateToken;
