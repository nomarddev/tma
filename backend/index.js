if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { verifyTelegramAuth } = require("./utils/verifyTelegramAuth");


const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY;

console.log('SUPABASE_URL:', supabaseUrl ? '[set]' : '[missing]');
console.log('SUPABASE_KEY:', supabaseKey ? '[set]' : '[missing]');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase config (SUPABASE_URL or SUPABASE_KEY). Exiting.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

fastify.post("/auth", async (request, reply) => {
  const { initData } = request.body;

  if (!initData || !verifyTelegramAuth(initData)) {
    return reply.code(403).send({ error: "Auth check failed" });
  }

  return { ok: true };
});


// CRUD API
fastify.post('/orders', async (request, reply) => {
  const payload = request.body;
  const { data, error } = await supabase.from('orders').insert([payload]).select();
  if (error) {
    request.log.error(error);
    return reply.code(500).send({ error: error.message });
  }
  return reply.code(201).send(data[0]);
});

fastify.get('/orders', async () => {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) {
    console.error('Error fetching orders:', error);
    return { error: 'Ошибка базы' };
  }
  return data;
});

fastify.get('/me', async (request, reply) => {
  const initData = request.query.initData;
  const user = verifyTelegramAuth(initData); // твоя функция проверки
  return user; // { id, first_name, last_name, username }
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

fastify.get('/me', async (request, reply) => {
  const initData = request.query.initData;

  if (!initData) {
    return reply.code(400).send({ error: 'No initData provided' });
  }

  const user = verifyTelegramAuth(initData);
  if (!user) {
    return reply.code(401).send({ error: 'Invalid auth data' });
  }

  return { 
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    photo_url: user.photo_url
  };
});


start();
