import express from 'express';

export function createServer() {
  const app = express();

  app.use(express.json());

  // Simple healthcheck endpoint for sanity/tests
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}

if (require.main === module) {
  const app = createServer();
  const port = process.env.PORT || 4000;

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
