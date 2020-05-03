import express, { Router } from 'express';
import GoogleDrive from '../services/GoogleDrive.service';
import upload from '../middlewares/upload.middleware';
import path from 'path';

const authGoole: express.IRouter = Router();

authGoole.route('/login')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        const authUrl = await googleService.authorize();
        res.redirect(authUrl);
    })


authGoole.route('/list')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        await googleService.listFiles();
        res.status(200).json({})
    })
authGoole.route('/callback')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        await googleService.storeToken(req.query);
        res.status(200).json(req.query)
    })

authGoole.route('/create')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        //await googleService.createFolder();
        res.send("created");

    })
authGoole
    .post('/images', upload.single('file'), async (req: any, res) => {

        // try {
            const googleService = new GoogleDrive();
            const file = await googleService.uploadFile(req.file, req.app.get('ROOT_PATH') );
            
            res.send(file);
        // } catch (error) {
        //     console.log(error);
        //     res.sendStatus(200).json({ msg: error });
        // }
    });
authGoole.get('/init', async (req:any, res)=>{
    const googleService = new GoogleDrive();
    res.send(await googleService.init(req.app.get('ROOT_PATH')));
    // const files :any = await googleService.searchFolder('invoices');
    // res.send(files);
    // await googleService.createFolder();

});




export default authGoole;
