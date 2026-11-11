const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigration() {
  const sql = fs.readFileSync(
    path.join(__dirname, 'supabase', 'migrations', '20261111000000_init_schema.sql'),
    'utf8'
  );

  const configs = [
    {
      name: 'Direct Connection (db.<ref>.supabase.co:5432)',
      host: 'db.uccrleyxuwyyfdtdkatc.supabase.co',
      port: 5432,
      user: 'postgres',
      password: 'ekzmna13!@#',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
    },
    {
      name: 'Transaction Pooler (aws-0-ap-northeast-2.pooler.supabase.com:6543)',
      host: 'aws-0-ap-northeast-2.pooler.supabase.com',
      port: 6543,
      user: 'postgres.uccrleyxuwyyfdtdkatc',
      password: 'ekzmna13!@#',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
    },
    {
      name: 'Session Pooler (aws-0-ap-northeast-2.pooler.supabase.com:5432)',
      host: 'aws-0-ap-northeast-2.pooler.supabase.com',
      port: 5432,
      user: 'postgres.uccrleyxuwyyfdtdkatc',
      password: 'ekzmna13!@#',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
    }
  ];

  let success = false;
  for (const config of configs) {
    console.log(`Trying ${config.name}...`);
    const client = new Client(config);
    try {
      await client.connect();
      console.log(`Connected successfully via ${config.name}! Executing migration...`);
      await client.query(sql);
      console.log('Migration executed successfully!');
      
      // 검증: 생성된 테이블 목록 조회
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
      `);
      console.log('Created tables in public schema:', res.rows.map(r => r.table_name));
      await client.end();
      success = true;
      break;
    } catch (err) {
      console.error(`Failed with ${config.name}:`, err.message);
      try { await client.end(); } catch (e) {}
    }
  }

  if (!success) {
    process.exit(1);
  }
}

runMigration();
