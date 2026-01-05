import app from "../server.ts";
import { env } from "../env.ts";

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`server  is running on port ${PORT}`);
});
