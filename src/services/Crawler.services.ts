import axios from 'axios'

export default class CrawlerService {

    public async listImages(keyword:string) {
        let list: [] = [];
        await axios.get(`${process.env.CRAWLER_API}/image/list?valid=false&keyword:${keyword}`,
            {
                headers: {
                    'Authorization': `Token ${process.env.CRAWLER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        ).then(res => {
            list = res.data.list
        }).catch(err => console.log(err));

        //return list;
        return [
            {
                "valid": false,
                "_id": "5eab07e6465cc50143a1a385",
                "keyword_id": "5ea9d572bed4a8035f538a43",
                "source": "https://code.visualstudio.com/assets/docs/languages/typescript/overview.png",
                "created_at": "2020-04-30T17:16:22.993Z",
                "__v": 0,
                "keyword_term": 'carro'
            }
        ]
    }

}