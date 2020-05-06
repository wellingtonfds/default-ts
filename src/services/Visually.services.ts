import axios from 'axios'

export default class VisuallyService {

    public send(file: any) {
        axios(
            {
                method: 'post',
                url: `${process.env.VISUALLY_API}`,
                data: {
                    "title": "teste thadeu",
                    "category": "Animals",
                    "source_url": "https://s2.glbimg.com/awo0fl0f3EL8UnWLjNfSsfVY3aQ=/0x0:2048x1365/1000x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2020/N/6/tIXvb8RfmiYIeW3xdsAg/posse-pf.jpg",
                    "email": "accounts+visually@visual.ly",
                    "api_token": `${process.env.VISUALLY_TOKEN}`
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ).then(res => {
            console.log(res);
        }).catch(err => console.log(err));
    }

}