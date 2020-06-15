import { IRouter, Router } from 'express';
import ExampleController from '../controllers/example.controller';


const exampleRoutes: IRouter = Router();

exampleRoutes.route('/')
  .get(async (req, res) => {
    res.send('Hello Word');
  });

exampleRoutes.route('/test')
  .get(async (req, res) => {
    const controller = new ExampleController();
    res.send(await controller.index());
  });


export default exampleRoutes;
