const jwt = require('jsonwebtoken');
const User = require('../models/usuario');

const protect = async (req, res, next) => {
  try {
    let token;

    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar si existe el token
    if (!token) {
      return res.status(401).json({
        error: 'No autorizado. Token no proporcionado.'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Soportar distintos nombres de payload: preferir userId, luego id
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ error: 'Token inválido: usuario no especificado.' });
    }

    // Agregar usuario y userId a la request para compatibilidad
    req.userId = userId;
    req.user = await User.findById(userId).select('-password');

    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no encontrado.'
      });
    }

    next();
  } catch (error) {
    console.error('Error de autenticación:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.' });
    }

    res.status(401).json({ error: 'No autorizado.' });
  }
};

module.exports = protect;