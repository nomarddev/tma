// backend/index.js
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const { createClient } = require('@supabase/supabase-js');

// берем ключи: подпарсим все возможные имена (совместимость локаль/прод)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY   // рекомендовано на проде
                  || process.env.SUPABASE_ANON_KEY
                  || process.env.SUPABASE_KEY; // запасной вариант

console.log('SUPABASE_URL:', supabaseUrl ? '[set]' : '[missing]');
console.log('SUPABASE_KEY:', supabaseKey ? '[set]' : '[missing]');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase config (SUPABASE_URL or SUPABASE_KEY). Exiting.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

fastify.register(cors, { origin: '*' });

// --- CRUD для orders ---

// Create order
fastify.post('/orders', async (request, reply) => {
  const payload = request.body;
  const { data, error } = await supabase.from('orders').insert([payload]).select();
  if (error) {
    request.log.error(error);
    return reply.code(500).send({ error: error.message });
  }
  return reply.code(201).send(data[0]);
});

// Read all orders (с базовой пагинацией)
fastify.get('/orders', async (request, reply) => {
  const { data, error } = await supabase.from('orders').select('*');
  console.log('orders from db:', data);
  if (error) {
    console.error('Error fetching orders:', error);
    return reply.status(500).send({ error: 'Ошибка базы' });
  }
  return data;
});


// Read single order
fastify.get('/orders/:id', async (request, reply) => {
  const id = request.params.id;
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error) {
    request.log.error(error);
    return reply.code(404).send({ error: error.message });
  }
  return data;
});

// Update order (partial)
fastify.patch('/orders/:id', async (request, reply) => {
  const id = request.params.id;
  const payload = request.body;
  const { data, error } = await supabase.from('orders').update(payload).eq('id', id).select();
  if (error) {
    request.log.error(error);
    return reply.code(500).send({ error: error.message });
  }
  return data[0];
});

// Delete order
fastify.delete('/orders/:id', async (request, reply) => {
  const id = request.params.id;
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) {
    request.log.error(error);
    return reply.code(500).send({ error: error.message });
  }
  return { ok: true };
});

// health
fastify.get('/', async () => ({ message: 'Backend is working!' }));

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
