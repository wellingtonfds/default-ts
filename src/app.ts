import express from 'express';
import dotenv from 'dotenv';
import GoogleRouter from './routes';


dotenv.config();

const app: express.Application = express();


const routes = new GoogleRouter().getRoutes();

app.use('/', routes);
app.set('ROOT_PATH', __dirname);

app.listen(process.env.PORT, () => {
  console.info(`Listening on port ${process.env.PORT}`);
});
