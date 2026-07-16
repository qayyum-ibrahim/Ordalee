import 'dotenv/config';
import { connectDB } from './config/db';
import { createApp } from './app';

async function main() {
  await connectDB();
  const app = createApp();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Ordalee API listening on port ${port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});