import express, { Router } from 'express';
import GoogleDrive from '../services/GoogleDrive.service';

const testRoutes: express.IRouter = Router();

testRoutes.route('/')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        const authUrl = await googleService.init();
        res.redirect(authUrl);
        //res.status(200).json({ msg: authUrl })
    })


testRoutes.route('/list')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        await googleService.listFiles();
        res.status(200).json({})
    })
testRoutes.route('/callback')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        await googleService.storeToken(req.query);
        res.status(200).json(req.query)
    })



export default testRoutes;
