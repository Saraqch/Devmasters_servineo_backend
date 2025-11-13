// Script para poblar la base de datos de testeo con datos falsos
// Ejecutar con: node seedDatabase.js

const { MongoClient, ObjectId } = require('mongodb');

// Configuración
const MONGO_URI =
  'mongodb+srv://devmasters:SN25CtNT3fLJstEJ@clusterservineo.yotr2ip.mongodb.net/testeo?retryWrites=true&w=majority&appName=ClusterServineo';
const DB_NAME = 'testeo';

// Datos base para generación
const nombres = [
  'Carlos',
  'María',
  'José',
  'Ana',
  'Luis',
  'Carmen',
  'Pedro',
  'Rosa',
  'Juan',
  'Teresa',
  'Miguel',
  'Elena',
  'Roberto',
  'Patricia',
  'Antonio',
  'Laura',
  'Jorge',
  'Isabel',
  'Francisco',
  'Verónica',
  'Raúl',
  'Silvia',
  'Fernando',
  'Mónica',
  'Ricardo',
  'Gabriela',
  'Alberto',
  'Daniela',
  'Sergio',
  'Adriana',
  'Rodrigo',
  'Paola',
  'Oscar',
  'Natalia',
  'Héctor',
  'Claudia',
  'Mauricio',
  'Sandra',
  'Guillermo',
  'Liliana',
  'Ramiro',
  'Beatriz',
  'Javier',
  'Mariana',
  'Eduardo',
  'Cecilia',
  'Hugo',
  'Diana',
  'Álvaro',
  'Fernanda',
  'Ernesto',
  'Victoria',
  'Iván',
  'Carla',
  'Felipe',
  'Lucía',
  'Marco',
  'Alejandra',
  'Pablo',
  'Andrea',
  'Gonzalo',
  'Soledad',
];

const apellidos = [
  'Mamani',
  'Quispe',
  'Condori',
  'López',
  'García',
  'Fernández',
  'Martínez',
  'Rojas',
  'Flores',
  'Torres',
  'Vargas',
  'Velásquez',
  'Morales',
  'Camacho',
  'Paredes',
  'Sánchez',
  'Gutiérrez',
  'Ramírez',
  'Pérez',
  'Rodríguez',
  'Mendoza',
  'Castro',
  'Herrera',
  'Silva',
  'Ramos',
  'Ortiz',
  'Delgado',
  'Molina',
  'Díaz',
  'Reyes',
  'Choque',
  'Huanca',
  'Yujra',
  'Apaza',
  'Nina',
  'Laura',
  'Gutierrez',
  'Carrasco',
  'Mercado',
  'Calle',
];

const provincias = [
  'Beni',
  'Chuquisaca',
  'Cochabamba',
  'La Paz',
  'Oruro',
  'Pando',
  'Potosí',
  'Santa Cruz',
  'Tarija',
];

const categorias = [
        'Albañil',
        'Carpintero',
        'Fontanero',
        'Electricista',
        'Pintor',
        'Soldador',
        'Jardinero',
        'Cerrajero',
        'Mecánico',
        'Vidriero',
        'Yesero',
        'Fumigador',
        'Limpiador',
        'Instalador',
        'Montador',
        'Decorador',
        'Pulidor',
        'Techador',
];

const servicios = [
  { title: 'Instalación de ducha eléctrica', category: 'Fontanero', price: [120, 250] },
  { title: 'Reparación de cañerías', category: 'Fontanero', price: [80, 180] },
  { title: 'Cambio de llaves', category: 'Fontanero', price: [50, 120] },
  { title: 'Instalación eléctrica completa', category: 'Electricista', price: [200, 500] },
  { title: 'Reparación de tomacorrientes', category: 'Electricista', price: [40, 100] },
  { title: 'Instalación de lámparas', category: 'Electricista', price: [60, 150] },
  { title: 'Fabricación de muebles', category: 'Carpintero', price: [300, 800] },
  { title: 'Reparación de puertas', category: 'Carpintero', price: [80, 200] },
  { title: 'Construcción de muros', category: 'Albañil', price: [150, 400] },
  { title: 'Revoque de paredes', category: 'Albañil', price: [100, 300] },
  { title: 'Pintura de habitaciones', category: 'Pintor', price: [120, 350] },
  { title: 'Pintura de fachadas', category: 'Pintor', price: [200, 600] },
  { title: 'Mantenimiento de jardines', category: 'Jardinero', price: [70, 180] },
  { title: 'Poda de árboles', category: 'Jardinero', price: [90, 220] },
  { title: 'Limpieza profunda de casa', category: 'Limpiador', price: [100, 250] },
  { title: 'Lavado de alfombras', category: 'Limpiador', price: [60, 150] },
  { title: 'Reparación de refrigerador', category: 'Instalador', price: [100, 280] },
  { title: 'Mantenimiento de lavadora', category: 'Instalador', price: [80, 200] },
  { title: 'Instalación de aire acondicionado', category: 'Instalador', price: [150, 400] },
  { title: 'Mantenimiento de aire acondicionado', category: 'Instalador', price: [80, 180] },
  { title: 'Formateo de computadora', category: 'Instalador', price: [60, 150] },
  { title: 'Cambio de cerraduras', category: 'Cerrajero', price: [70, 180] },
  { title: 'Tapizado de muebles', category: 'Decorador', price: [120, 350] },
  { title: 'Soldadura de rejas', category: 'Soldador', price: [100, 300] },
  { title: 'Instalación de ventanas', category: 'Vidriero', price: [150, 400] },
  { title: 'Fumigación de plagas', category: 'Fumigador', price: [80, 200] },
];

const comentarios = [
  'Excelente servicio, muy profesional',
  'Llegó puntual y trabajó muy bien',
  'Buen trabajo pero un poco caro',
  'Muy recomendable, volveré a contratarlo',
  'No quedé del todo satisfecho con el resultado',
  'Trabajo impecable y a buen precio',
  'Cumplió con lo acordado',
  'Persona responsable y educada',
  'El trabajo estuvo bien pero tardó más de lo esperado',
  'Superó mis expectativas',
  'Regular, esperaba mejor calidad',
  'Muy buena atención al cliente',
  'Trabajo rápido y eficiente',
  'No volvería a contratarlo',
  'Excelente relación calidad-precio',
  'Muy satisfecho con el servicio',
  'Podría mejorar en algunos aspectos',
  'Trabajo profesional y garantizado',
  'Buenos resultados en general',
  'Servicio aceptable',
];

const direcciones = [
  'Av. Heroínas',
  'Av. Blanco Galindo',
  'Av. América',
  'Calle España',
  'Av. Ayacucho',
  'Calle Esteban Arce',
  'Av. Circunvalación',
  'Calle Baptista',
  'Av. Melchor Pérez de Olguín',
  'Calle Sucre',
  'Av. Papa Paulo',
  'Calle Junín',
  'Av. Oquendo',
  'Calle Nataniel Aguirre',
  'Av. San Martin',
  'Calle Lanza',
  'Av. Villarroel',
  'Calle Potosí',
  'Av. Beijing',
  'Calle Colombia',
  'Av. Petrolera',
  'Calle Antezana',
  'Av. Ramón Rivero',
];

// Funciones auxiliares
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone() {
  const prefijos = ['7', '6'];
  const prefijo = randomElement(prefijos);
  const numero = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefijo}${numero}`;
}

function generateEmail(nombre, apellido) {
  const dominios = ['gmail.com'];
  const nombreLimpio = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const apellidoLimpio = apellido
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const variaciones = [
    `${nombreLimpio}.${apellidoLimpio}`,
    `${nombreLimpio}${apellidoLimpio}`,
    `${nombreLimpio}_${apellidoLimpio}`,
    `${nombreLimpio}${randomInt(1, 99)}`,
  ];
  return `${randomElement(variaciones)}@${randomElement(dominios)}`;
}

function generatePassword() {
  return (
    '$2b$10$' +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

async function seedDatabase() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✓ Conectado a MongoDB Atlas');

    const db = client.db(DB_NAME);

    // Limpiar colecciones existentes
    const collections = [
      'users',
      'jobs',
      'booking',
      'activities',
      'reviewers',
      'notifications',
      'payments',
      'searches',
      'profiles',
      'authCreds',
      'oauths',
      'tokens',
      'offers',
    ];

    for (const col of collections) {
      await db.collection(col).deleteMany({});
      console.log(`✓ Limpiada colección: ${col}`);
    }

    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    const endDate = new Date();

    // 1. CREAR USUARIOS (80 usuarios)
    console.log('\n📝 Creando usuarios...');
    const users = [];
    const roles = ['fixer', 'requester', 'visitor'];
    const languages = ['es', 'en'];

    for (let i = 0; i < 80; i++) {
      const nombre = randomElement(nombres);
      const apellido = randomElement(apellidos);
      const role = i < 40 ? 'fixer' : i < 70 ? 'requester' : 'visitor';

      users.push({
        _id: new ObjectId(),
        name: `${nombre} ${apellido}`,
        email: generateEmail(nombre, apellido),
        passwordHash: generatePassword(),
        role: role,
        language: randomElement(languages),
        createdAt: randomDate(startDate, endDate),
      });
    }
    await db.collection('users').insertMany(users);
    console.log(`✓ Creados ${users.length} usuarios`);

    const fixers = users.filter((u) => u.role === 'fixer');
    const requesters = users.filter((u) => u.role === 'requester');

    // 2. CREAR PERFILES
    console.log('\n📝 Creando perfiles...');
    const profiles = users.map((user) => ({
      userId: user._id,
      phone: generatePhone(),
      location: {
        direction: `${randomElement(direcciones)} #${randomInt(100, 999)}`,
        coordinates: {
          type: 'Point',
          coordinates: [
            -66.1568 + (Math.random() - 0.5) * 0.1,
            -17.3935 + (Math.random() - 0.5) * 0.1,
          ],
        },
      },
      biography:
        user.role === 'fixer'
          ? `Profesional con ${randomInt(2, 15)} años de experiencia en ${randomElement(categorias)}`
          : `Usuario de la plataforma desde ${user.createdAt.getFullYear()}`,
      lastchange: randomDate(user.createdAt, endDate),
      profilephoto: `https://i.pravatar.cc/150?u=${user._id}`,
    }));
    await db.collection('profiles').insertMany(profiles);
    console.log(`✓ Creados ${profiles.length} perfiles`);

    // 3. CREAR CREDENCIALES DE AUTENTICACIÓN
    console.log('\n📝 Creando credenciales de autenticación...');
    const authCreds = users.map((user) => ({
      userId: user._id,
      hashPassword: user.passwordHash,
      LastchangePassword: randomDate(user.createdAt, endDate),
      failedattempsLogin: randomInt(0, 3),
      lockedup: Math.random() > 0.95 ? randomDate(user.createdAt, endDate) : null,
    }));
    await db.collection('authCreds').insertMany(authCreds);
    console.log(`✓ Creadas ${authCreds.length} credenciales`);

    // 4. CREAR OFERTAS (50-80 ofertas de fixers)
    console.log('\n📝 Creando ofertas...');
    const offers = [];
    for (let i = 0; i < 65; i++) {
      const servicio = randomElement(servicios);
      const fixer = randomElement(fixers);
      const profile = profiles.find((p) => p.userId.equals(fixer._id));

      offers.push({
        _id: new ObjectId(),
        fixerId: fixer._id,
        title: servicio.title,
        description: `Servicio profesional de ${servicio.category.toLowerCase()}. ${randomInt(1, 10)} años de experiencia. Trabajo garantizado.`,
        category: servicio.category,
        tags: [servicio.category.toLowerCase(), 'profesional', 'garantizado'],
        price: randomInt(servicio.price[0], servicio.price[1]),
        city: randomElement(provincias),
        phone: profile.phone,
        createdAt: randomDate(startDate, endDate),
      });
    }
    await db.collection('offers').insertMany(offers);
    console.log(`✓ Creadas ${offers.length} ofertas`);

    // 5. CREAR TRABAJOS (100 trabajos)
    console.log('\n📝 Creando trabajos...');
    const jobs = [];
    const statuses = ['pending', 'in_progress', 'completed'];

    for (let i = 0; i < 100; i++) {
      const servicio = randomElement(servicios);
      const requester = randomElement(requesters);
      const fixer = Math.random() > 0.3 ? randomElement(fixers) : null;
      const status = fixer ? randomElement(statuses) : 'pending';
      const createdAt = randomDate(startDate, endDate);

      jobs.push({
        _id: new ObjectId(),
        title: servicio.title,
        description: `Se necesita ${servicio.title.toLowerCase()} en zona ${randomElement(provincias)}`,
        status: status,
        requesterId: requester._id,
        fixerId: fixer ? fixer._id : null,
        price: randomInt(servicio.price[0], servicio.price[1]),
        createdAt: createdAt,
      });
    }
    await db.collection('jobs').insertMany(jobs);
    console.log(`✓ Creados ${jobs.length} trabajos`);

    // 6. CREAR RESERVAS (60-80 reservas)
    console.log('\n📝 Creando reservas...');
    const bookings = [];
    const completedJobs = jobs.filter((j) => j.fixerId && j.status !== 'pending');

    for (const job of completedJobs) {
      if (Math.random() > 0.2) {
        const bookingDate = new Date(job.createdAt);
        bookingDate.setDate(bookingDate.getDate() + randomInt(1, 7));

        bookings.push({
          _id: new ObjectId(),
          jobId: job._id,
          requesterId: job.requesterId,
          fixerId: job.fixerId,
          date: bookingDate,
          status:
            job.status === 'completed' ? 'completed' : randomElement(['confirmed', 'completed']),
        });
      }
    }
    await db.collection('booking').insertMany(bookings);
    console.log(`✓ Creadas ${bookings.length} reservas`);

    // 7. CREAR PAGOS (para trabajos completados)
    console.log('\n📝 Creando pagos...');
    const payments = [];
    const completedBookings = bookings.filter((b) => b.status === 'completed');
    const paymentMethods = ['QR', 'Tarjeta de Crédito', 'Efectivo'];
    const banks = [
      'Banco Nacional de Bolivia',
      'Banco Mercantil Santa Cruz',
      'Banco Unión',
      'BCP Bolivia',
    ];

    for (const booking of completedBookings) {
      const job = jobs.find((j) => j._id.equals(booking.jobId));
      const method = randomElement(paymentMethods);
      const paymentDate = new Date(booking.date);
      paymentDate.setHours(paymentDate.getHours() + randomInt(1, 48));

      const subTotal = job.price;
      const service_fee = Math.round(subTotal * 0.1);
      const discount = Math.random() > 0.9 ? Math.round(subTotal * 0.05) : 0;
      const total = subTotal + service_fee - discount;

      const payment = {
        _id: new ObjectId(),
        jobId: job._id,
        payerId: job.requesterId,
        paymentMethods: method,
        status: Math.random() > 0.05 ? 'paid' : 'pending',
        paymentDate: paymentDate,
        commissionRate: 0.1,
        amount: {
          subTotal: subTotal,
          service_fee: service_fee,
          discount: discount,
          total: total,
          currency: 'BOB',
        },
        cuentaEmpresa: {
          bankName: randomElement(banks),
          accountNumber: `${randomInt(1000000000, 9999999999)}`,
          accountHolder: 'Servineo SRL',
        },
        cuentaFixer: {
          bankName: randomElement(banks),
          accountNumber: `${randomInt(1000000000, 9999999999)}`,
          accountHolder: users.find((u) => u._id.equals(job.fixerId)).name,
        },
      };

      if (method === 'Tarjeta de Crédito') {
        payment.cardPayment = {
          brand: randomElement(['visa', 'mastercard', 'amex']),
          last4: randomInt(1000, 9999),
          holderName: users.find((u) => u._id.equals(job.requesterId)).name,
        };
      } else if (method === 'QR') {
        payment.qrPayment = {
          qrCode: `https://qr.example.com/${payment._id}`,
          qrExpires: new Date(paymentDate.getTime() + 3600000),
        };
      }

      payments.push(payment);
    }
    await db.collection('payments').insertMany(payments);
    console.log(`✓ Creados ${payments.length} pagos`);

    // 8. CREAR RESEÑAS
    console.log('\n📝 Creando reseñas...');
    const reviews = [];
    const paidPayments = payments.filter((p) => p.status === 'paid');

    for (const payment of paidPayments) {
      if (Math.random() > 0.3) {
        const job = jobs.find((j) => j._id.equals(payment.jobId));
        const reviewDate = new Date(payment.paymentDate);
        reviewDate.setHours(reviewDate.getHours() + randomInt(1, 72));

        reviews.push({
          _id: new ObjectId(),
          jobId: job._id,
          reviewerId: job.requesterId,
          reviewedId: job.fixerId,
          rating: randomInt(0, 3),
          comment: randomElement(comentarios),
          createdAt: reviewDate,
        });
      }
    }
    await db.collection('reviewers').insertMany(reviews);
    console.log(`✓ Creadas ${reviews.length} reseñas`);

    // 9. CREAR NOTIFICACIONES
    console.log('\n📝 Creando notificaciones...');
    const notifications = [];
    const notificationTypes = [
      'booking_update',
      'payment_received',
      'new_message',
      'job_completed',
      'new_review',
    ];

    for (let i = 0; i < 150; i++) {
      const user = randomElement(users);
      const type = randomElement(notificationTypes);
      let message = '';

      switch (type) {
        case 'booking_update':
          message = 'Tu cita ha sido confirmada';
          break;
        case 'payment_received':
          message = `Has recibido un pago de ${randomInt(50, 500)} BOB`;
          break;
        case 'new_message':
          message = 'Tienes un nuevo mensaje';
          break;
        case 'job_completed':
          message = 'El trabajo ha sido completado';
          break;
        case 'new_review':
          message = 'Has recibido una nueva reseña';
          break;
      }

      notifications.push({
        _id: new ObjectId(),
        userId: user._id,
        type: type,
        message: message,
        read: Math.random() > 0.4,
        createdAt: randomDate(startDate, endDate),
      });
    }
    await db.collection('notifications').insertMany(notifications);
    console.log(`✓ Creadas ${notifications.length} notificaciones`);

    // 10. CREAR ACTIVIDADES
    console.log('\n📝 Creando actividades...');
    const activities = [];
    const activityTypes = ['login', 'search', 'click', 'review', 'session_start', 'session_end'];

    for (let i = 0; i < 300; i++) {
      const user = randomElement(users);
      const type = randomElement(activityTypes);
      const metadata = {};

      if (type === 'search') {
        metadata.searchTerm = randomElement(categorias).toLowerCase();
      } else if (type === 'click') {
        metadata.button = randomElement([
          'Publicar trabajo',
          'Ver perfil',
          'Contactar',
          'Reservar',
        ]);
      } else if (type === 'session_start' || type === 'session_end') {
        metadata.duration = randomInt(60, 3600);
      }

      activities.push({
        _id: new ObjectId(),
        userId: user._id,
        date: randomDate(startDate, endDate),
        role: user.role,
        type: type,
        metadata: metadata,
        timestamp: randomDate(startDate, endDate),
      });
    }
    await db.collection('activities').insertMany(activities);
    console.log(`✓ Creadas ${activities.length} actividades`);

    // 11. CREAR BÚSQUEDAS
    console.log('\n📝 Creando búsquedas...');
    const searches = [];

    for (let i = 0; i < 120; i++) {
      const user = randomElement(users);
      const categoria = randomElement(categorias);

      searches.push({
        _id: new ObjectId(),
        UserName: user.name,
        UserTypes: user.role === 'fixer' ? 'Fixer' : 'Requester',
        search: categoria,
        typeOfService: 'buscador',
        scope: randomInt(10, 50).toString(),
        searchFound: randomInt(0, 10).toString(),
        createdAt: randomDate(startDate, endDate),
        updateAt: randomDate(startDate, endDate),
      });
    }
    await db.collection('searches').insertMany(searches);
    console.log(`✓ Creadas ${searches.length} búsquedas`);

    // 12. CREAR SESIONES/TOKENS
    console.log('\n📝 Creando tokens de sesión...');
    const tokens = [];

    for (let i = 0; i < 80; i++) {
      const createdAt = randomDate(startDate, endDate);
      const expiresAt = new Date(createdAt);
      expiresAt.setHours(expiresAt.getHours() + randomInt(1, 24));

      tokens.push({
        _id: new ObjectId(),
        ip: `${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`,
        createdAt: createdAt,
        expiresAt: expiresAt,
      });
    }
    await db.collection('tokens').insertMany(tokens);
    console.log(`✓ Creados ${tokens.length} tokens`);

    // 13. CREAR CUENTAS OAUTH (algunas)
    console.log('\n📝 Creando cuentas OAuth...');
    const oauths = [];
    const providers = ['google', 'facebook'];

    for (let i = 0; i < 25; i++) {
      const user = randomElement(users);
      const provider = randomElement(providers);

      oauths.push({
        _id: new ObjectId(),
        userId: user._id,
        provider: provider,
        providerId: `${provider}_${Math.random().toString(36).substring(7)}`,
        email: user.email,
        createdAt: randomDate(user.createdAt, endDate),
      });
    }
    await db.collection('oauths').insertMany(oauths);
    console.log(`✓ Creadas ${oauths.length} cuentas OAuth`);

    console.log('\n✅ Base de datos poblada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Usuarios: ${users.length}`);
    console.log(`   - Perfiles: ${profiles.length}`);
    console.log(`   - Ofertas: ${offers.length}`);
    console.log(`   - Trabajos: ${jobs.length}`);
    console.log(`   - Reservas: ${bookings.length}`);
    console.log(`   - Pagos: ${payments.length}`);
    console.log(`   - Reseñas: ${reviews.length}`);
    console.log(`   - Notificaciones: ${notifications.length}`);
    console.log(`   - Actividades: ${activities.length}`);
    console.log(`   - Búsquedas: ${searches.length}`);
    console.log(`   - Tokens: ${tokens.length}`);
    console.log(`   - OAuth: ${oauths.length}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
seedDatabase();
