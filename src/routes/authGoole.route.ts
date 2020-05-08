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
import path from 'path';
import VisuallyService from '../services/Visually.services';
import CrawlerController from '../controllers/Crawler.controller';
import VisuallyController from '../controllers/Visually.controller';
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
        console.log("#############IMAGES CHECKED######################\n\n")
        const controller = new VisuallyController(req.app.get('ROOT_PATH'))
        controller.index();
        res.send('Your request will be processed');

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
    console.log("#############CRAWLER IMAGES######################\n\n")
    const controller = new CrawlerController(req.app.get('ROOT_PATH'))
    controller.index();
    res.send('Your request will be processed')
})




export default authGoole;
