require('dotenv').config();
const mongoose = require('mongoose');

console.log('=== DIAGNÓSTICO DE CONEXIÓN ===\n');

// 1. Verificar que dotenv cargó
console.log('1. ¿Se cargó el .env?');
console.log('   MONGODB_URI existe:', !!process.env.MONGODB_URI);
console.log('   JWT_SECRET existe:', !!process.env.JWT_SECRET);
console.log('   PORT existe:', !!process.env.PORT);
console.log('');

// 2. Mostrar la URI (censurada)
if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI;
  const censored = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log('2. URI de conexión (censurada):');
  console.log('   ', censored);
  console.log('');
} else {
  console.log('❌ ERROR: MONGODB_URI no está definida en .env\n');
  process.exit(1);
}

// 3. Intentar conexión
console.log('3. Intentando conectar a MongoDB...\n');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // 5 segundos de timeout
})
  .then(() => {
    console.log('✅ ¡CONEXIÓN EXITOSA!');
    console.log('   Base de datos:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ ERROR DE CONEXIÓN:\n');
    console.log('   Tipo de error:', error.name);
    console.log('   Mensaje:', error.message);
    console.log('');
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 SOLUCIÓN:');
      console.log('   1. Ve a MongoDB Atlas → Database Access');
      console.log('   2. Verifica que el usuario existe');
      console.log('   3. Edita el usuario y CAMBIA la contraseña');
      console.log('   4. Usa una contraseña SIN caracteres especiales');
      console.log('   5. Actualiza el .env con la nueva contraseña');
    }
    
    process.exit(1);
  });