/**
 * Conexion a PostgreSQL.
 *
 * Exporta un pool de conexiones reutilizable y dos ayudas:
 *   · consultar(sql, parametros)  → ejecuta una consulta simple
 *   · probarConexion()            → verifica al arrancar que la BD responde
 *
 * Siempre se usan consultas parametrizadas ($1, $2, ...) para evitar
 * inyeccion SQL. Nunca concatenes valores dentro del string del SQL.
 */

import pg from 'pg';

const { Pool } = pg;

// Si existe BD_URL se usa esa cadena completa; si no, se arma con las piezas.
const configuracionConexion = process.env.BD_URL
  ? {
      connectionString: process.env.BD_URL,
      /*
       * Neon, como cualquier Postgres gestionado, solo acepta conexiones
       * cifradas. rejectUnauthorized va en false porque el certificado lo
       * firma una CA que Node no trae de serie: la conexion sigue yendo
       * cifrada, lo unico que se omite es validar la cadena del certificado.
       */
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.BD_HOST || 'localhost',
      port: Number(process.env.BD_PUERTO) || 5432,
      user: process.env.BD_USUARIO || 'postgres',
      password: process.env.BD_CLAVE || 'postgres',
      database: process.env.BD_NOMBRE || 'arigatours_bd',
    };

/*
 * El tamano del pool depende de donde corra esto.
 *
 * Con un servidor propio hay UN proceso y un pool de 10 conexiones que se
 * reparten entre todas las peticiones. En Vercel conviven muchas instancias
 * de la funcion, cada una con su propio pool: 10 por instancia agotaria el
 * limite de conexiones de Neon en cuanto entrara algo de trafico. Por eso
 * alli se baja a 1 y la conexion ociosa se suelta enseguida.
 *
 * Aun asi conviene apuntar BD_URL a la cadena "pooled" de Neon (la que lleva
 * -pooler en el host): pone un pgbouncer delante que absorbe los picos.
 */
const enServerless = Boolean(process.env.VERCEL);

export const pool = new Pool({
  ...configuracionConexion,
  max: enServerless ? 1 : 10,
  idleTimeoutMillis: enServerless ? 5000 : 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (error) => {
  console.error('[base-datos] Error inesperado en el pool:', error.message);
});

/** Ejecuta una consulta y devuelve el resultado completo de pg. */
export function consultar(sql, parametros = []) {
  return pool.query(sql, parametros);
}

/**
 * Ejecuta varias operaciones dentro de una transaccion.
 * Recibe una funcion que trabaja con el cliente y hace COMMIT/ROLLBACK sola.
 */
export async function conTransaccion(operaciones) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await operaciones(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
}

/** Comprueba que la base de datos esta accesible. Se llama al arrancar. */
export async function probarConexion() {
  const { rows } = await pool.query('SELECT NOW() AS ahora');
  console.log('[base-datos] Conectado correctamente —', rows[0].ahora.toISOString());
}
