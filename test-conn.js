const { Client } = require('pg');

async function testUsEast() {
  const hosts = [
    { host: 'aws-0-us-east-1.pooler.supabase.com', port: 5432 },
    { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543 },
    { host: 'aws-0-us-east-2.pooler.supabase.com', port: 6543 },
  ];

  for (const h of hosts) {
    console.log(`Testing ${h.host}:${h.port}...`);
    const client = new Client({
      host: h.host,
      port: h.port,
      user: 'postgres.uccrleyxuwyyfdtdkatc',
      password: 'ekzmna13!@#',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000
    });

    try {
      await client.connect();
      console.log(`CONNECTED SUCCESSFULLY to ${h.host}:${h.port}!`);
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed ${h.host}:${h.port}: ${err.message}`);
      try { await client.end(); } catch (e) {}
    }
  }
}

testUsEast();
