import app from "../server.ts";
import { env } from "../env.ts";
import connectDB from "./config/db.ts";

const PORT = env.PORT;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server  is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
