import express, { Router } from 'express';
import GoogleDrive from '../services/GoogleDrive.service';
import upload from '../middlewares/upload.middleware';
import { runInNewContext } from 'vm';


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

authGoole.route('/images/checked')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        const folders: any = {
            description: 'Folders checked',
            folders: await googleService.imagesChecked(req.app.get('ROOT_PATH'))
        }
        folders.folders = folders.folders.map((folder: any) => {
            return {
                'name': folder.name,
                'created':folder.createdTime,
                'modified':folder.modifiedTime
            }
        });
        res.send(folders);

    })
authGoole
    .post('/images', upload.single('file'), async (req: any, res) => {
        const googleService = new GoogleDrive();
        const file = await googleService.uploadFile(req.file, req.app.get('ROOT_PATH'));
        res.send(file);
    });
authGoole.get('/init', async (req: any, res) => {
    const googleService = new GoogleDrive();
    res.send(await googleService.init(req.app.get('ROOT_PATH')));
});




export default authGoole;
