import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'Admin') return res.status(403).json({ error: 'Administrator access required' });
  next();
};

export const generateToken = (userId, username, role) => {
  return jwt.sign(
    { userId, username, role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};
