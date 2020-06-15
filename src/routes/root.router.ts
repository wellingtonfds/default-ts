import { Router, IRouter } from 'express';
import exampleRouter from './example.router';

export default class RootRouter {
    route:IRouter = null

    constructor() {
      this.route = Router();
      this.route.use('/', exampleRouter);
    }

    getRoutes() {
      return this.route;
    }
}
