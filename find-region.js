const { Client } = require('pg');

const regions = [
  'ap-northeast-2', // Seoul
  'ap-northeast-1', // Tokyo
  'ap-southeast-1', // Singapore
  'us-east-1',      // N. Virginia
  'us-west-1',      // N. California
  'eu-central-1',   // Frankfurt
  'eu-west-1',      // Ireland
  'ap-south-1',     // Mumbai
  'ap-southeast-2'  // Sydney
];

async function findRegion() {
  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    const client = new Client({
      host,
      port: 6543,
      user: 'postgres.uccrleyxuwyyfdtdkatc',
      password: 'ekzmna13!@#',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000
    });

    try {
      await client.connect();
      console.log(`FOUND REGION: ${r}`);
      await client.end();
      return r;
    } catch (err) {
      if (!err.message.includes('tenant/user') && !err.message.includes('ENOTFOUND')) {
        console.log(`Region ${r} responded with: ${err.message}`);
        await client.end();
        return r;
      }
      try { await client.end(); } catch(e){}
    }
  }
  console.log('Region not matched in standard AWS regions.');
}

findRegion();
