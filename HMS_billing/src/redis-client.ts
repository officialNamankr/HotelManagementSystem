import { createClient } from "redis";

const client = createClient({
  url: "redis://hms-billing-redis-srv:6379",
  legacyMode: true,
});
client.on("error", (err) => console.log("Redis Client Error", err));

async function connectRedis() {
  try {
    await client.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
}

connectRedis();

export default client;
