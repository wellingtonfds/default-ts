import express from 'express';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as bodyParser from 'body-parser';
import Router from './routes/root.router';

const bootStrap = () => {
  const app: express.Application = express();
  dotenv.config();

  // Call midlewares
  // app.use(cors());
  app.use(helmet());
  app.use(bodyParser.json());
  const routes = new Router().getRoutes();
  app.use('/', routes);
  app.set('ROOT_PATH', __dirname);

  app.listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.info(`Listening on port ${process.env.PORT}`);
  });
};


createConnection()
  .then(async () => {
    bootStrap();
  // eslint-disable-next-line no-console
  }).catch((error) => {
    console.error(error);
    bootStrap();
  });
