const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  try {
    console.log(
      'Intentando conectar a MongoDB con URI:',
      process.env.MONGO_URI?.slice(0, 60) + '...',
    );
    await mongoose.connect(process.env.MONGO_URI, {});

    const Test = mongoose.model(
      'TestConnection',
      new mongoose.Schema({ msg: String }),
      'test_connection',
    );

    const doc = await Test.create({ msg: `backend-test-${new Date().toISOString()}` });
    console.log('✅ Documento insertado con ID:', doc._id.toString());

    await mongoose.disconnect();
    console.log('🔌 Conexión cerrada correctamente');
  } catch (err) {
    console.error('❌ Error al conectar o insertar:', err);
    process.exit(1);
  }
}

main();
