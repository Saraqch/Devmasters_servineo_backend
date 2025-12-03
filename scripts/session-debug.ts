#!/usr/bin/env ts-node
import 'dotenv/config';
import mongoose from 'mongoose';
import { appConfig } from '../src/config/app.config';
import { SearchHistory } from '../src/modules/devmaster/models/search-history.model';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log(
      'Usage: ts-node scripts/session-debug.ts <fromSessionId> <toSessionId> [--migrate]',
    );
    process.exit(1);
  }

  const from = args[0];
  const to = args[1];
  const doMigrate = args.includes('--migrate');

  console.log('Connecting to Mongo...');
  await mongoose.connect(appConfig.mongoUri as string);
  console.log('Connected.');

  try {
    const countFrom = await SearchHistory.countDocuments({ sessionId: from });
    const countTo = await SearchHistory.countDocuments({ sessionId: to });

    console.log(`Documents with fromSessionId (${from}): ${countFrom}`);
    console.log(`Documents with toSessionId   (${to}): ${countTo}`);

    if (countFrom > 0) {
      const samples = await SearchHistory.find({ sessionId: from }).limit(5).lean();
      console.log('Sample documents for fromSessionId:');
      console.dir(samples, { depth: 3 });
    } else {
      console.log('No sample documents for fromSessionId');
    }

    if (doMigrate) {
      console.log('Running migration (updateMany)...');
      const res = await SearchHistory.updateMany({ sessionId: from }, { $set: { sessionId: to } });
      // Mongoose 6 returns { acknowledged, matchedCount, modifiedCount, upsertedId, upsertedCount }
      console.log('Migration result:', res);
    } else {
      console.log('To perform migration add the --migrate flag');
    }
  } catch (err) {
    console.error('Error during diagnostic/migration:', err);
    process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

main();
