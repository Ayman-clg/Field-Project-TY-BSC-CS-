import mongoose from 'mongoose';

let mongod = null;

export const connectDB = async () => {
  const defaultUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/enterprise_inventory';

  try {
    // Attempt standard MongoDB connection
    const conn = await mongoose.connect(defaultUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning]: Could not connect to local/remote MongoDB at ${defaultUri} (${error.message}).`);
    console.log(`[Database Engine] Starting embedded MongoMemoryServer for standalone zero-config environment...`);

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'enterprise_inventory',
        },
      });
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[Embedded Mongo Connected]: ${uri}`);
      return conn;
    } catch (memError) {
      console.error(`[Fatal DB Error]: Failed to start in-memory database fallback: ${memError.message}`);
      throw memError;
    }
  }
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
};
