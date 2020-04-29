import { Router, IRouter } from 'express';
import authGoole from './authGoole.route';

export default class GoogleRouter {
    route:IRouter = null

    constructor(){
        this.route = Router();

        this.route.use('/', authGoole);
    }

    getRoutes(){
        return this.route;
    }
}
