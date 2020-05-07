import axios from 'axios'
import { getRepository } from 'typeorm';
import { CrawlerImages } from '../entity/CrawlerImages';

export default class VisuallyService {

    public async send(file: any) {
        let upload_id = 0;
        await axios(
            {
                method: 'post',
                url: `${process.env.VISUALLY_API}/image-upload-api/images/upload/image`,
                data: file,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ).then(res => {
            upload_id = res.data.nid;
        }).catch(err => console.log(err));
        return upload_id;
    }

    public async completeData() {

        const imageRepository: any = getRepository(CrawlerImages);
        const images = await imageRepository
            .createQueryBuilder()
            .select('id')
            .where('uploaded_at is null or transcribed_at is null or published_at is null')
            .getRawMany();
        const imagesTrait = await images.map((image: any) => {
            return image.id
        })
        await axios(
            {
                method: 'post',
                url: `${process.env.VISUALLY_API}/image-upload-api/images/list/all`,
                data: {
                    nids: imagesTrait,
                    "api_token": `${process.env.VISUALLY_TOKEN}`

                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ).then(res => {
            res.data.forEach((image:any) => {
                const imageDatabase = imageRepository.find(image.nid);

                if(imageDatabase){
                    imageDatabase.transcribed_at = image.transcribed == '1' ? new Date() : null;
                    imageRepository.save(imageDatabase);
                }
            });
        }).catch(err => console.log(err));

    }

}