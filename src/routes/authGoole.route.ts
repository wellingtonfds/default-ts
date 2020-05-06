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
const authGoole: IRouter = Router();

authGoole.route('/login')
    .get(async (req, res) => {
        let googleService = new GoogleDrive();
        const authUrl = await googleService.authorize();
        res.redirect(authUrl);
    })


authGoole.route('/list')
    .get(async (req, res) => {
        // let googleService = new GoogleDrive();
        // await googleService.renameFolder('1x5bjHVRnpBeYNQXBA2XkuCY_tS_bnxUo', 'images_17_uploaded');

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
                'created': folder.createdTime,
                'modified': folder.modifiedTime
            }
        });
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

        imageRepository.save(crawlerImages);

        res.send(file);
    });
authGoole.get('/init', async (req: any, res) => {
    const googleService = new GoogleDrive();
    res.send(await googleService.init(req.app.get('ROOT_PATH')));
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
    const listImages = await crawlerService.listImages(keyWords[0].keyword);

    listImages.forEach(async (image: any) => {

        //get image
        const response = await axios({
            method: 'get',
            url: image.source,
            responseType: 'stream'
        })

        //find category 
        const category: any = await crawlerKeyWordsRepository
        .createQueryBuilder()
        .where('keyword like :keyword', { keyword: `%${image.keyword_term}%` })
        .getOne();

        const crawlerImages: CrawlerImages = new CrawlerImages();
        crawlerImages.crawler_keyword = category;

        const imageRepository: any = getRepository(CrawlerImages);
        const newImage = await imageRepository.save(crawlerImages);
        
        const mimeTypeFile = response.data.headers['content-type'];
        const ext = mime.extension(mimeTypeFile);
        const file = {
            path: `${res.app.get('ROOT_PATH')}/storage/temp/${newImage.id}.${ext}`,
            name: `${newImage.id}.${ext}`,
            mimeType: mimeTypeFile
        }
        const dest = fs.createWriteStream(file.path);
        const streamy = response.data as Readable;
        streamy.pipe(dest)
            .on('finish', async () => {

                //store image on google drive
                const googleService = new GoogleDrive();
                const fileGoogle: any = await googleService.uploadFile(file, req.app.get('ROOT_PATH'));
                

                //fill data
                
                newImage.source_url = fileGoogle.webContentLink;
                newImage.original_filename = file.name;
                newImage.location = fileGoogle.parents.length ? fileGoogle.parents[0] : "";

                //updated a new image
                imageRepository.save(crawlerImages);
            });

    })

    keyWords[0].crawled_total++;
    crawlerKeyWordsRepository.save(keyWords[0]);

    res.send({
        'msg':'Your request will be processed'
    });
})




export default authGoole;
