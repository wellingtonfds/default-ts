import { Router, IRouter } from 'express';
import testRoutes from './test.route';

export default class CrawlerRouter {
    route:IRouter = null

    constructor(){
        this.route = Router();

        this.route.use('/test', testRoutes);
    }

    getRoutes(){
        return this.route;
    }
}
