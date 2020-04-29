import express from 'express';
import dotenv from 'dotenv';
import CrawlerRouter from './routes';

dotenv.config();

const app: express.Application = express();

const routes = new CrawlerRouter().getRoutes();

app.use('/api', routes);

app.listen(process.env.PORT, () => {
  console.info(`Listening on port ${process.env.PORT}`);
});
