import axios from 'axios'
import { getRepository } from 'typeorm';
import { CrawlerImages } from '../entity/CrawlerImages';

export default class VisuallyService {

    public async send(file: any) {
        console.log("#########################")
        console.log('SEND_VISUALLY')
        console.log("#########################\n")
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
            console.log("############RETURN SEND-DATA ##################\n")
            console.log('res-visually', res.data)
            console.log("############UPLOAD_ID ##################")
            console.log(res.data.nid)
            console.log("#######################################\n")
            upload_id = res.data.nid;
        }).catch(err => console.log('visually-service-send-error', err.response.message));
        return upload_id;
    }

    public async completeData() {

        const imageRepository: any = getRepository(CrawlerImages);
        const images = await imageRepository
            .createQueryBuilder()
            .select('uploaded_id')
            .where('uploaded_id != 0 and transcribed_at is null')
            .getRawMany();

        const imagesTrait = await images.map((image: any) => {
            return image.uploaded_id
        })
        console.log("#########################COMPLETE DATA####################\n")
        console.log("#########################UPLOAD_IDS####################")
        console.log(imagesTrait)
        console.log("######################################################\n")
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
            console.log("#########################")
            console.log('COMPLETE_DATA_VISUALLY')
            console.log("#########################")
            console.log("RESPONSE")
            console.log(res);
            console.log("#########################")
            console.log("RESPONSE-data")
            console.log(res.data)



            console.log("#########################")
            console.log('FOREACH-RES.DATA')

            res.data.forEach(async (image: any) => {
                console.log("ID-VISUALLY:", image.nid)
                const imageDatabase = await imageRepository.
                    createQueryBuilder()
                    .where('uploaded_id = :id', { id: image.nid })
                    .getOne();

                if (imageDatabase) {
                    console.log("################MODEL#############");
                    imageDatabase.transcribed_at = image.transcribed == 1 ? new Date() : null;
                    console.log('image.databaseId.', imageDatabase.id)
                    console.log('image.uploaded_id.', imageDatabase.uploaded_id)
                    console.log('image.transcribed', image.transcribed == 1 ? new Date() : null)
                    console.log("################FIMMODEL##########\n");
                    imageRepository.save(imageDatabase);
                } else {
                    console.log("################UPLOAD_ID_NOT_FOUND#############");
                    console.log("upload_id:", image.nid);
                    console.log("################################################\n");
                }
            });
        }).catch(err => console.log('visually-service-completeData:', err.message));


    }

}