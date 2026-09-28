import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/northwind_market';

export async function connectDB(uri = MONGO_URI) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('[db] connected:', uri.replace(/:[^:@]+@/, ':***@'));
  return mongoose.connection;
}

export async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[db] disconnected');
  }
}
