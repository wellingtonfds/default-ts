import { getRepository } from "typeorm";
import CrawlerService from "../services/Crawler.services";
import axios from 'axios'
import { CrawlerKeyWords } from "../entity/CrawlerKeyWords";
import { CrawlerImages } from "../entity/CrawlerImages";
import mime from 'mime-types';
import * as fs from 'fs';
import GoogleDrive from "../services/GoogleDrive.service";
import { Readable } from "typeorm/platform/PlatformTools";

export default class CrawlerController {

    private path: string;

    constructor(path = "") {
        this.path = path;
    }
    public async index() {

        const crawlerKeyWordsRepository: any = getRepository(CrawlerKeyWords);
        const keyWords = await crawlerKeyWordsRepository.createQueryBuilder()
            .select("*")
            .where('ended_at is null')
            .limit(1)
            .orderBy('updated_at', 'ASC')
            .getRawMany();
        

        const crawlerService: CrawlerService = new CrawlerService();
        await crawlerService.addKeywords(keyWords[0].keyword)
        const listImages: any = await crawlerService.listImages(keyWords[0].keyword);



        for (const keyImage in listImages) {
            let hasError = false;
            //get image
            const response: any = await axios({
                method: 'get',
                url: listImages[keyImage].source,
                responseType: 'stream'
            }).catch(err => { hasError = true })

            if (!hasError) {
                //find category 

                console.log('category', keyWords[0].keyword)
                // console.log('category', listImages[keyImage].keyword_id.keyword)
                // const category: any = await crawlerKeyWordsRepository
                //     .createQueryBuilder()
                //     .where('keyword like :keyword', { keyword: `%${listImages[keyImage].keyword_id.keyword}%` })
                //     .getOne();

                const crawlerImages: CrawlerImages = new CrawlerImages();
                crawlerImages.crawler_keyword = keyWords[0];
                crawlerImages.description = listImages[keyImage].description;
                crawlerImages.source = listImages[keyImage].source

                const filename: string = crawlerImages.source.substring(crawlerImages.source.lastIndexOf('/') + 1);
                const onlyFileName : string = filename.substr(0, filename.lastIndexOf('.'));
                // const newExtension = path.extname(filename);
                const ext = mime.extension(mime.contentType(filename) || 'image/png');
                console.log('only-filename', `${onlyFileName}`);
                console.log('original-filename', `${filename}`);
                console.log('original-filename-clear', `${onlyFileName}.${ext}`)
                console.log('extension', ext)




                const imageRepository: any = getRepository(CrawlerImages);
                const newImage = await imageRepository.save(crawlerImages);

                const headerType = response.data.headers['content-type'];
                const mimeTypeFile = headerType == undefined ? 'image/png' : headerType;
                // const ext = mime.extension(mimeTypeFile);
                console.log('google-filename', `${newImage.id}.${ext}\n`);
                const file = {
                    path: `${this.path}/storage/temp/${newImage.id}.${ext}`,
                    name: `${newImage.id}.${ext}`,
                    mimeType: mimeTypeFile
                }
                const dest = fs.createWriteStream(file.path);
                const streamy = response.data as Readable;


                const promiseStreamy = new Promise((resolve: any, reject: any) => {
                    streamy.pipe(dest)
                        .on('finish', resolve())
                        .on('error', reject())
                });

                await promiseStreamy.then(async () => {
                    //store image on google drive
                    const googleService = new GoogleDrive();
                    const fileGoogle: any = await googleService.uploadFile(file, this.path);

                    //fill data


                    //updated a new image
                    if (fileGoogle.webContentLink != undefined) {
                        newImage.source_url = fileGoogle.webContentLink;
                        newImage.original_filename = `${onlyFileName}.${ext}`;
                        newImage.location = fileGoogle.parents.length ? fileGoogle.parents[0] : "";
                        imageRepository.save(newImage)
                    } else {
                        console.log('delete id:', newImage.id);
                        await imageRepository
                            .createQueryBuilder()
                            .delete()
                            .where("id = :id", { id: newImage.id })
                            .execute();
                    }

                }).catch(err => console.log(err))


            }



        }

        keyWords[0].crawled_total++;
        crawlerKeyWordsRepository.save(keyWords[0]);
        return listImages;
    }

}