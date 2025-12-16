const jwt = require('jsonwebtoken');
const User = require('../models/usuario');

const auth = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No autorizado - Token no proporcionado' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario (compatible con ambas versiones)
    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        error: 'No autorizado - Usuario no encontrado' 
      });
    }

    // Agregar usuario a la request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'No autorizado - Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'No autorizado - Token expirado' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error en la autenticación' 
    });
  }
};

module.exports = auth;