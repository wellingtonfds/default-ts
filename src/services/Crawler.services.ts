import axios from 'axios'

export default class CrawlerService {

    private headers: any = {}

    constructor() {
        this.headers = {
            'Authorization': `Token ${process.env.CRAWLER_TOKEN}`,
            'Content-Type': 'application/json'
        }
    }



    public async addKeywords(keyword: string, limit:number = 50) {

        axios({
            method: 'post',
            url:`${process.env.CRAWLER_API}/google/crawler`,
            data: {
                "params": [
                    {
                        "keyword": keyword,
                        "limit": limit
                    }
                ]
            },
            headers: this.headers
        })
        .catch(err=>console.log(err))
    }




    public async listImages(keyword: string, limit:number = 20) {
        let list: [] = [];
        await axios.get(`${process.env.CRAWLER_API}/image/list?valid=false&limit=${limit}`, {
            headers:this.headers
        }
        ).then(res => {
            list = res.data.list
        }).catch(err => console.log(err));

        return list;
    }

}