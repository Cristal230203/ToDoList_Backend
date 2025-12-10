// Simulación local del comportamiento del middleware de autenticación
// No requiere conexión a la base de datos; mockea la búsqueda de usuario.

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_123';
const jwt = require('jsonwebtoken');

const simulateMiddleware = (req) => {
  try {
    let token;
    if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return { ok: false, status: 401, error: 'No autorizado. Token no proporcionado.' };

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) return { ok: false, status: 401, error: 'Token inválido: usuario no especificado.' };

    // Mockear búsqueda de usuario en DB: devolvemos usuario sólo para ciertos ids
    const mockUsers = {
      'user123': { _id: 'user123', username: 'tester', email: 't@ex' },
      '507f1f77bcf86cd799439011': { _id: '507f1f77bcf86cd799439011', username: 'mongoUser' }
    };

    const user = mockUsers[userId] || null;
    if (!user) return { ok: false, status: 401, error: 'Usuario no encontrado.' };

    // Simular que middleware añade req.userId y req.user
    return { ok: true, userId, user };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return { ok: false, status: 401, error: 'Token inválido.' };
    if (error.name === 'TokenExpiredError') return { ok: false, status: 401, error: 'Token expirado.' };
    return { ok: false, status: 401, error: 'No autorizado.' };
  }
};

const secret = process.env.JWT_SECRET;

const tokenValidUserId = jwt.sign({ userId: 'user123' }, secret, { expiresIn: '7d' });
const tokenValidId = jwt.sign({ id: '507f1f77bcf86cd799439011' }, secret, { expiresIn: '7d' });
const tokenInvalid = tokenValidUserId + 'x';

const tokenShortLived = jwt.sign({ userId: 'user123' }, secret, { expiresIn: '1s' });

console.log('Secret used:', secret);

console.log('\n--- Test 1: token válido con payload { userId } ---');
console.log('Token:', tokenValidUserId);
console.log('Result:', simulateMiddleware({ headers: { authorization: `Bearer ${tokenValidUserId}` } }));

console.log('\n--- Test 2: token válido con payload { id } ---');
console.log('Token:', tokenValidId);
console.log('Result:', simulateMiddleware({ headers: { authorization: `Bearer ${tokenValidId}` } }));

console.log('\n--- Test 3: token inválido (tampered) ---');
console.log('Token:', tokenInvalid);
console.log('Result:', simulateMiddleware({ headers: { authorization: `Bearer ${tokenInvalid}` } }));

console.log('\n--- Test 4: token expirado (esperando 1.1s) ---');
console.log('Token (short-lived):', tokenShortLived);
setTimeout(() => {
  console.log('Result after wait:', simulateMiddleware({ headers: { authorization: `Bearer ${tokenShortLived}` } }));
  // Salir después del timeout para terminar el script
  process.exit(0);
}, 1100);
