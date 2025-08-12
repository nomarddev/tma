require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;  // <--- внимательно здесь

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey);

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');

fastify.register(cors, { origin: '*' });

fastify.get('/', async (request, reply) => {
  return { message: 'Backend is working!' };
});

const start = async () => {
  try {
    const port = process.env.PORT || 4000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Backend listening on http://0.0.0.0:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
