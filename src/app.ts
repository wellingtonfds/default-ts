import express from 'express';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
// import cors from 'cors';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as bodyParser from 'body-parser';
import GoogleRouter from './routes';

createConnection()
  .then(async () => {
    const app: express.Application = express();
    dotenv.config();

    // Call midlewares
    // app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());
    const routes = new GoogleRouter().getRoutes();
    app.use('/', routes);
    app.set('ROOT_PATH', __dirname);

    app.listen(process.env.PORT, () => {
      console.info(`Listening on port ${process.env.PORT}`);
    });
  }).catch((error) => { console.error(error); });
