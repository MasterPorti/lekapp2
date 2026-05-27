import { Pool } from "pg";
import crypto from "crypto";
import { hashPassword } from "./crypto";

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes("supabase") || 
       connectionString?.includes("neon.tech") || 
       connectionString?.includes("render.com") ||
       connectionString?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false
});

let isInitialized = false;

// Auto-initialization function
export async function initDatabase() {
  if (isInitialized) return;

  const client = await pool.connect();
  try {
    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        unlocked BOOLEAN DEFAULT FALSE,
        kit_code VARCHAR(255) DEFAULT NULL
      );
    `);

    // Upgrade users table to add email verification and password reset columns
    try {
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10) DEFAULT NULL;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expiry TIMESTAMP DEFAULT NULL;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10) DEFAULT NULL;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expiry TIMESTAMP DEFAULT NULL;
      `);
      // Upgrade existing users to be verified so they don't get locked out
      await client.query(`
        UPDATE users SET verified = TRUE WHERE verified IS NULL;
      `);
      console.log("Upgraded users table with verification and reset columns.");
    } catch (e) {
      console.error("Error migrating users table columns:", e);
    }

    // 2. Projects (User Workspace LekCodes) Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
        user_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Learning Projects Table (e.g. Lek 2, Lek 3)
    await client.query(`
      CREATE TABLE IF NOT EXISTS learning_projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Courses Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        badge VARCHAR(100) NOT NULL,
        description TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Upgrade courses table to add project_id if not present
    try {
      await client.query(`
        ALTER TABLE courses ADD COLUMN project_id INTEGER REFERENCES learning_projects(id) ON DELETE CASCADE;
      `);
      console.log("Added project_id to courses table successfully.");
    } catch (e) {
      // Column already exists, safe to ignore
    }

    // Drop unique constraint on course title to allow multiple projects to have similar course titles
    try {
      await client.query(`
        ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_title_key;
      `);
      console.log("Dropped unique constraint on course title successfully.");
    } catch (e) {
      // Ignore error if it doesn't exist
    }

    // 5. Videos Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id VARCHAR(255) PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        description TEXT DEFAULT NULL,
        url VARCHAR(2048) NOT NULL,
        video_order INTEGER DEFAULT 0,
        is_free BOOLEAN DEFAULT FALSE
      );
    `);

    // Upgrade videos table to add is_free if not present
    try {
      await client.query(`
        ALTER TABLE videos ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
      `);
      console.log("Added is_free to videos table successfully.");
    } catch (e) {
      // Column already exists, safe to ignore
    }

    // Migrate existing Course 1 videos to be free by default
    try {
      await client.query(`
        UPDATE videos SET is_free = TRUE WHERE course_id IN (
          SELECT id FROM courses WHERE badge = 'Curso 1'
        );
      `);
      console.log("Migrated Course 1 videos to be free.");
    } catch (e) {
      // Ignore
    }

    // 6. Access Codes Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS access_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) UNIQUE NOT NULL,
        project_id INTEGER REFERENCES learning_projects(id) ON DELETE CASCADE,
        used_by_email VARCHAR(255) DEFAULT NULL,
        used_at TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. User Unlocked Projects (Join Table)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_unlocked_projects (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES learning_projects(id) ON DELETE CASCADE,
        is_free_plan BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, project_id)
      );
    `);

    // SEEDING
    // 1. Seed Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@lekrobotics.com").toLowerCase().trim();
    const adminCheck = await client.query("SELECT * FROM users WHERE email = $1", [adminEmail]);
    let adminUserId = null;
    if (adminCheck.rows.length === 0) {
      const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomUUID();
      const hashedPassword = hashPassword(adminPassword);
      const adminInsert = await client.query(`
        INSERT INTO users (username, email, password, role, unlocked, kit_code)
        VALUES ('Master Admin', $1, $2, 'admin', TRUE, 'ADMIN-MASTER')
        RETURNING id
      `, [adminEmail, hashedPassword]);
      adminUserId = adminInsert.rows[0].id;
      console.log(`\n==================================================`);
      console.log(`Admin user seeded successfully.`);
      console.log(`EMAIL: ${adminEmail}`);
      console.log(`PASSWORD: ${adminPassword}`);
      console.log(`==================================================\n`);
    } else {
      adminUserId = adminCheck.rows[0].id;
    }

    // 2. Seed Default Learning Project (Lek 2)
    let lek2ProjectId = null;
    const projectCheck = await client.query("SELECT id FROM learning_projects WHERE name = 'Lek 2'");
    if (projectCheck.rows.length === 0) {
      const projInsert = await client.query(`
        INSERT INTO learning_projects (name, description)
        VALUES ('Lek 2', 'Kit de robótica educativa Lek 2: Estructura, programación por bloques y simulador interactivo.')
        RETURNING id
      `);
      lek2ProjectId = projInsert.rows[0].id;
      console.log("Learning project 'Lek 2' seeded.");
    } else {
      lek2ProjectId = projectCheck.rows[0].id;
    }

    // 3. Ensure Admin has Lek 2 unlocked
    if (adminUserId && lek2ProjectId) {
      await client.query(`
        INSERT INTO user_unlocked_projects (user_id, project_id, is_free_plan)
        VALUES ($1, $2, FALSE)
        ON CONFLICT DO NOTHING
      `, [adminUserId, lek2ProjectId]);
    }

    // 4. Seed Default Access Codes for Lek 2
    await client.query(`
      INSERT INTO access_codes (code, project_id)
      VALUES ('LEK-EASY-ARMADO', $1), ('LEK-MASTER-CODE', $1)
      ON CONFLICT DO NOTHING
    `, [lek2ProjectId]);    // Ensure all existing courses without a project are associated with Lek 2
    if (lek2ProjectId) {
      await client.query(`
        UPDATE courses SET project_id = $1 WHERE project_id IS NULL;
      `, [lek2ProjectId]);
    }

    // 5. Seed Courses associated with Lek 2
    const courseCheck = await client.query("SELECT COUNT(*) FROM courses WHERE project_id = $1", [lek2ProjectId]);
    if (parseInt(courseCheck.rows[0].count, 10) === 0) {
      // Insert Course 1
      const c1 = await client.query(`
        INSERT INTO courses (project_id, title, badge, description)
        VALUES ($1, 'Arma tu Lek 2', 'Curso 1', 'Tutorial paso a paso para ensamblar la estructura mecánica, motores y placas de tu kit de robótica sin soldadura.')
        RETURNING id
      `, [lek2ProjectId]);
      const c1Id = c1.rows[0].id;

      // Insert Course 2
      const c2 = await client.query(`
        INSERT INTO courses (project_id, title, badge, description)
        VALUES ($1, 'Inicio de Programacion', 'Curso 2', 'Aprende a mover motores, crear secuencias sencillas y usar eventos para controlar tu primer código.')
        RETURNING id
      `, [lek2ProjectId]);
      const c2Id = c2.rows[0].id;

      // Insert Course 3
      const c3 = await client.query(`
        INSERT INTO courses (project_id, title, badge, description)
        VALUES ($1, 'Intermedio de Programacion', 'Curso 3', 'Domina variables, bucles complejos, sensores de distancia y lógica condicional para automatizar tu robot.')
        RETURNING id
      `, [lek2ProjectId]);
      const c3Id = c3.rows[0].id;

      // Insert Course 4
      const c4 = await client.query(`
        INSERT INTO courses (project_id, title, badge, description)
        VALUES ($1, 'Programacion avanzada', 'Curso 4', 'Descubre cómo analizar los desafíos, estructurar tus soluciones y subir tu puntaje en la comunidad.')
        RETURNING id
      `, [lek2ProjectId]);
      const c4Id = c4.rows[0].id;

      // Seed Videos for Course 1
      const c1Videos = [
        { id: "v1", title: "Unboxing y Reconocimiento de Componentes", duration: "5:10", desc: "Descubre todas las piezas, sensores, motores y tornillos incluidos en tu kit de robótica Lek 2 antes de comenzar el ensamble.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", order: 1 },
        { id: "v2", title: "Montaje del Chasis Base", duration: "8:25", desc: "Ensambla la estructura inferior de acrílico/plástico y asegura los soportes principales para sostener el peso de la batería.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", order: 2 },
        { id: "v3", title: "Instalación de Motores de Tracción", duration: "7:40", desc: "Acopla los motores reductores a los soportes laterales del chasis y aprieta los tornillos de fijación de los ejes.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", order: 3 },
        { id: "v4", title: "Colocación de Ruedas y Rueda Loca", duration: "6:15", desc: "Monta las ruedas principales con neumático de goma y ajusta la rueda loca delantera para un giro fluido en curvas.", url: "https://commondatachasis.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", order: 4 },
        { id: "v5", title: "Fijación de la Placa de Control Lek Brain", duration: "9:30", desc: "Posiciona y atornilla la tarjeta controladora principal sobre los espaciadores de nylon para evitar cortocircuitos con la estructura.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", order: 5 },
        { id: "v6", title: "Cableado de Motores y Alimentación", duration: "10:15", desc: "Conecta los cables de los motores de tracción a las terminales correspondientes de la placa y asegura el portabaterías.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", order: 6 },
        { id: "v7", title: "Montaje de Sensores Infrarrojos Inferiores", duration: "8:50", desc: "Posiciona los sensores infrarrojos de rastreo en la parte frontal inferior del chasis para detectar líneas negras en la pista.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", order: 7 },
        { id: "v8", title: "Instalación de Sensor de Distancia Ultrasónico", duration: "11:05", desc: "Acopla el sensor de distancia ultrasónico frontal mediante su soporte y conéctalo al puerto de expansión de la placa Lek Brain.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", order: 8 },
        { id: "v9", title: "Organización del Cableado y Seguridad", duration: "6:40", desc: "Utiliza cinchos plásticos para organizar y de forma segura sujetar los cables, evitando que rocen con las ruedas principales.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", order: 9 },
        { id: "v10", title: "Prueba de Encendido y Autodiagnóstico", duration: "7:20", desc: "Enciende el interruptor de energía y verifica los códigos de luces LED para asegurar que todas las conexiones de tus sensores y motores sean correctas.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", order: 10 }
      ];

      for (const v of c1Videos) {
        await client.query(`
          INSERT INTO videos (id, course_id, title, duration, description, url, video_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [v.id, c1Id, v.title, v.duration, v.desc, v.url, v.order]);
      }

      // Seed Videos for Course 2
      const c2Videos = [
        { id: "c2v1", title: "Primeros Pasos en LekCode", duration: "4:30", desc: "Conoce la interfaz de programación, cómo arrastrar bloques al lienzo y las categorías de movimiento.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", order: 1 },
        { id: "c2v2", title: "Avanzar y Retroceder Motores", duration: "6:15", desc: "Configura la velocidad y dirección de los motores izquierdo y derecho para realizar traslaciones lineales.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", order: 2 },
        { id: "c2v3", title: "Giros y Ángulos de Rotación", duration: "5:50", desc: "Aprende a programar giros sobre el propio eje (giros pivotantes) y curvas amplias variando la velocidad relativa.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", order: 3 },
        { id: "c2v4", title: "Uso del Bloque Esperar (Delays)", duration: "4:10", desc: "Controla los tiempos de ejecución de las acciones de movimiento usando retardos en segundos.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", order: 4 },
        { id: "c2v5", title: "Estructuras de Secuencia Lineal", duration: "7:25", desc: "Crea rutinas completas (ej. dibujar un cuadrado) combinando de forma lógica bloques secuenciales.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", order: 5 }
      ];

      for (const v of c2Videos) {
        await client.query(`
          INSERT INTO videos (id, course_id, title, duration, description, url, video_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [v.id, c2Id, v.title, v.duration, v.desc, v.url, v.order]);
      }

      // Seed Videos for Course 3
      const c3Videos = [
        { id: "c3v1", title: "Introducción a los Sensores del Lek 2", duration: "5:45", desc: "Aprende cómo operan los sensores ópticos infrarrojos y el transductor de distancia ultrasónico por rebote.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", order: 1 },
        { id: "c3v2", title: "Condicionales Simples (Si / Sino)", duration: "8:10", desc: "Haz que tu robot tome decisiones en tiempo real analizando la lectura de presencia de obstáculos.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", order: 2 },
        { id: "c3v3", title: "Bucles Infinitos y de Condición", duration: "9:20", desc: "Crea lazos de control continuos para que el robot responda indefinidamente a su entorno.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", order: 3 },
        { id: "c3v4", title: "Algoritmo Seguidor de Línea Básico", duration: "11:30", desc: "Programa la lógica para que los sensores infrarrojos sigan una pista negra de forma autónoma.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", order: 4 }
      ];

      for (const v of c3Videos) {
        await client.query(`
          INSERT INTO videos (id, course_id, title, duration, description, url, video_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [v.id, c3Id, v.title, v.duration, v.desc, v.url, v.order]);
      }

      // Seed Videos for Course 4
      const c4Videos = [
        { id: "c4v1", title: "Qué es la Comunidad Lek y los Retos", duration: "3:40", desc: "Explora la sección de retos semanales y cómo funcionan los sistemas de puntaje e insignias.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", order: 1 },
        { id: "c4v2", title: "Optimización de Código para Menor Espacio", duration: "6:55", desc: "Aprende técnicas para usar bucles repetir en lugar de secuencias repetitivas redundantes.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", order: 2 },
        { id: "c4v3", title: "Análisis y Estrategia de un Circuito", duration: "7:50", desc: "Planifica la trayectoria óptima y los puntos de decisión antes de arrastrar el primer bloque de programación.", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", order: 3 }
      ];

      for (const v of c4Videos) {
        await client.query(`
          INSERT INTO videos (id, course_id, title, duration, description, url, video_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [v.id, c4Id, v.title, v.duration, v.desc, v.url, v.order]);
      }

      console.log("Database seeded with Lek 2 courses and videos successfully.");
    }

    isInitialized = true;
  } catch (err) {
    console.error("Error initializing database schema/seeding:", err);
  } finally {
    client.release();
  }
}

// Main query helper that ensures initialization first
export async function query(text: string, params?: any[]) {
  if (!isInitialized) {
    await initDatabase();
  }
  return pool.query(text, params);
}
