import { IRouter, Router } from 'express';
import GoogleDrive from '../services/GoogleDrive.service';
import upload from '../middlewares/upload.middleware';
import { getRepository } from "typeorm";
import { CrawlerImages } from '../entity/CrawlerImages';
import { CrawlerKeyWords } from '../entity/CrawlerKeyWords';
import CrawlerService from '../services/Crawler.services';
import axios from 'axios'
import * as fs from 'fs';
import { Readable } from 'typeorm/platform/PlatformTools';
import mime from 'mime-types';
import VisuallyService from '../services/Visually.services';
const authGoole: IRouter = Router();

authGoole.route('/login')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        const authUrl = await googleService.authorize();
        res.redirect(authUrl);
    })


authGoole.route('/list')
    .get(async (req, res) => {
        const visuallyService = new VisuallyService();
        res.send(await visuallyService.completeData())

    })
authGoole.get('/init', async (req: any, res) => {
    const googleService = new GoogleDrive();
    await googleService.init(req.app.get('ROOT_PATH'));
    res.send('Your application has been actived')
});
authGoole.route('/callback')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        await googleService.storeToken(req.query);
        res.redirect('/init');
    })

authGoole.route('/images/checked')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        const folders: any = {
            description: 'Folders checked',
            folders: await googleService.imagesChecked(req.app.get('ROOT_PATH'))
        }
        // folders.folders = folders.folders.map((folder: any) => {
        //     return {
        //         'name': folder.name,
        //         'created': folder.createdTime,
        //         'modified': folder.modifiedTime
        //     }
        // });
        res.send(folders);

    })
authGoole
    .post('/images', upload.single('file'), async (req: any, res) => {
        const googleService = new GoogleDrive();

        const file = await googleService.uploadFile(req.file, req.app.get('ROOT_PATH'));
        const imageRepository: any = getRepository(CrawlerImages);
        const crawlerKeyWordsRepository: any = getRepository(CrawlerKeyWords);
        const category: any = await crawlerKeyWordsRepository.find(1);

        const crawlerImages: CrawlerImages = new CrawlerImages();
        crawlerImages.crawler_keyword = category[0];
        crawlerImages.source_url = file.webContentLink;
        crawlerImages.original_filename = req.file.originalname;
        crawlerImages.location = file.parents.length ? file.parents[0] : "";
        crawlerImages.published_at = new Date();
        crawlerImages.uploaded_at = new Date();
        imageRepository.save(crawlerImages);

        res.send(file);
    });


authGoole.get('/crawler/images', async (req: any, res) => {

    const crawlerKeyWordsRepository: any = getRepository(CrawlerKeyWords);
    const keyWords = await crawlerKeyWordsRepository.createQueryBuilder()
        .select("*")
        .where('ended_at is null')
        .limit(1)
        .orderBy('updated_at', 'ASC')
        .getRawMany();


    const crawlerService: CrawlerService = new CrawlerService();
    await crawlerService.addKeywords(keyWords[0].keyword)
    const listImages:any = await crawlerService.listImages(keyWords[0].keyword);

    

    for(const keyImage in listImages){
    
        //get image
        const response = await axios({
            method: 'get',
            url: listImages[keyImage].source,
            responseType: 'stream'
        })
        
        

        //find category 
        const category: any = await crawlerKeyWordsRepository
            .createQueryBuilder()
            .where('keyword like :keyword', { keyword: `%${listImages[keyImage].keyword_id.keyword}%` })
            .getOne();

        const crawlerImages: CrawlerImages = new CrawlerImages();
        crawlerImages.crawler_keyword = category;
        crawlerImages.description = listImages[keyImage].description;
        crawlerImages.source = listImages[keyImage].source

        const imageRepository: any = getRepository(CrawlerImages);
        const newImage = await imageRepository.save(crawlerImages);

        const headerType = response.data.headers['content-type'];
        const mimeTypeFile =  headerType == undefined ? 'image/png' : headerType;
        const ext = mime.extension(mimeTypeFile);
        const file = {
            path: `${res.app.get('ROOT_PATH')}/storage/temp/${newImage.id}.${ext}`,
            name: `${newImage.id}.${ext}`,
            mimeType: mimeTypeFile
        }
        const dest = fs.createWriteStream(file.path);
        const streamy = response.data as Readable;


        const promiseStreamy = new Promise((resolve:any, reject:any) => {
            streamy.pipe(dest)
            .on('finish',resolve())
            .on('error', reject())
        });

        await promiseStreamy.then(async ()=>{
             //store image on google drive
             const googleService = new GoogleDrive();
             const fileGoogle: any = await googleService.uploadFile(file, req.app.get('ROOT_PATH'));

             //fill data
             newImage.source_url = fileGoogle.webContentLink;
             newImage.original_filename = file.name;
             newImage.location = fileGoogle.parents.length ? fileGoogle.parents[0] : "";

             //updated a new image
             await imageRepository.save(crawlerImages);
        }).catch(err => console.log(err))
        

    }

    keyWords[0].crawled_total++;
    crawlerKeyWordsRepository.save(keyWords[0]);
    res.send(listImages)
})




export default authGoole;
