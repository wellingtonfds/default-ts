import express, { Router } from 'express';
import GoogleDrive from '../services/GoogleDrive.service';
import upload from '../middlewares/upload.middleware';
import path from 'path';

const authGoole: express.IRouter = Router();

authGoole.route('/login')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        const authUrl = await googleService.init();
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
        await googleService.createFolder();
        res.send("created");

    })
authGoole
    .post('/images',upload.single('file') , async (req: any, res) => {
        
        try {
            res.send(200).json({msg:"File added with success", file:{name:req.file.filename}});
        } catch (error) {
            console.log(error);
            res.send(200).json({msg:error});
        }
        //console.log('path',path);
        
        
        
    });



export default authGoole;
