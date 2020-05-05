import { IRouter , Router} from 'express';
import GoogleDrive from '../services/GoogleDrive.service';
import upload from '../middlewares/upload.middleware';
import { getRepository } from "typeorm";
import { CrawlerImages } from '../entity/CrawlerImages';
import { CrawlerKeyWords } from '../entity/CrawlerKeyWords';


const authGoole: IRouter = Router();

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
        const imageRepository : any = getRepository(CrawlerImages);
        const crawlerKeyWordsRepository : any = getRepository(CrawlerKeyWords);
        const category : any = await crawlerKeyWordsRepository.find(1);
        
        const crawlerImages :CrawlerImages= new CrawlerImages();
        crawlerImages.crawler_keyword = category[0];
        crawlerImages.source_url = 'http://source_url';
        crawlerImages.original_filename = 'orginal_filename.jpg';
        crawlerImages.checksum = 'asdasdas4d45a45sd45a4s45d';
        crawlerImages.location = 'http://location';
        // crawlerImages.created_at = new Date();
        crawlerImages.uploaded_id = 1;
        
        console.log(await imageRepository.save(crawlerImages));

        res.send(file);
    });
authGoole.get('/init', async (req: any, res) => {
    const googleService = new GoogleDrive();
    res.send(await googleService.init(req.app.get('ROOT_PATH')));
});




export default authGoole;
