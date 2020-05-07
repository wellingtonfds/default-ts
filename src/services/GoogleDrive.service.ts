import { google } from 'googleapis';
import * as fs from 'fs';
import * as util from 'util';
import QueryModel from '../models/Query.model';
import { Readable } from 'stream';
import { CrawlerImages } from '../entity/CrawlerImages';
import { getRepository } from 'typeorm';
import VisuallyService from './Visually.services';
import { CrawlerKeyWords } from '../entity/CrawlerKeyWords';
import { json } from 'body-parser';




const TOKEN_PATH = 'token.json';
const CONFIG_FILES = 'files.json'
const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.metadata',
    'https://www.googleapis.com/auth/drive.photos.readonly'

];
const readPromisify = util.promisify(fs.readFile);
const writePromisify = util.promisify(fs.writeFile);
const unlinkPromisify = util.promisify(fs.unlink);


export default class GoogleDrive {

    private content: any;

    constructor() {
        this.content = {
            "installed": {
                "client_id": process.env.CLIENT_ID,
                "project_id": process.env.PROJECT_ID,
                "auth_uri": process.env.AUTH_URI,
                "token_uri": process.env.TOKEN_URI,
                "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_x509_CERT_URL,
                "client_secret": process.env.CLIENTE_SECRET,
                "redirect_uris": [
                    "urn:ietf:wg:oauth:2.0:oob",
                    process.env.REDIRECT_URIS
                ]
            }
        }
    }

    async init(rootPath: any) {
        let query: QueryModel = new QueryModel();
        query.name = "crawler";
        const files: any = await this.searchFolder(query);

        let config: any = await this.getConfigFile(rootPath);
        //Main folder init
        if (!config.main.id) {
            //create a folder crawler
            if (!files.legth) {
                config.main.id = await this.createFolder('crawler')
            } else {
                config.main.id = files[0].id
            }
            config.main.name = 'crawler'
        }

        //create a folter to images
        if (!config.current_position.id) {
            config.current_position.name = `${config.folder_prefix}_${config.folder_number}`;
            config.current_position.id = await this.createFolder(
                config.current_position.name,
                config.main.id
            );
            config.folder_number++;
        }

        //write config
        await writePromisify(`${rootPath}/storage/${CONFIG_FILES}`, JSON.stringify(config))
    }
    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */

    private async getOauth2Client() {
        const { client_secret, client_id, redirect_uris } = this.content.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[1]);
        oAuth2Client.setCredentials(this.content);
        return oAuth2Client;
    }
    public async authorize(credentials: any = this.content) {
        const oAuth2Client = await this.getOauth2Client();
        oAuth2Client.setCredentials(this.content);
        return await this.getAccessToken(oAuth2Client);
    }

    public async storeToken(transitionToke: any) {
        let oAuth2Client = await this.getOauth2Client();
        oAuth2Client.getToken(transitionToke.code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
        });

    }
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    public async getAccessToken(oAuth2Client: any) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        return authUrl;
    }

    private async getConfigFile(rootPath: string) {
        const pathFileConfig: string = `${rootPath}/storage/${CONFIG_FILES}`;
        let config: any = {};
        await readPromisify(pathFileConfig, 'utf8').then(data => {
            config = JSON.parse(data);
        });
        return config;
    }
    private async getValidAuth() {
        const auth = await this.getOauth2Client();

        let token: any = {};
        await readPromisify(TOKEN_PATH, 'utf8').then(data => {
            token = JSON.parse(data);
        });
        auth.setCredentials(token);
        return auth;
    }

    private async getValidDrive() {
        const auth = await this.getValidAuth();
        return google.drive({ version: 'v3', auth });
    }

    /**
     * Lists the names and IDs of up to 10 files.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    public async listFiles() {
        const drive = await this.getValidDrive();
        drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name)',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;
            if (files.length) {
                console.log('Files:');
                files.map((file) => {
                    console.log(`${file.name} (${file.id})`);
                });
            } else {
                console.log('No files found.');
            }
        });
    }


    private async getCurrentFolderUpload(rootPath: any) {
        const config = await this.getConfigFile(rootPath);
        let query: QueryModel = new QueryModel();
        query.name = config.current_position.name;
        query.getParents = true;
        const folder: any = await this.searchFolder(query);
        // return config.main.id;
        if (folder.length) {
            if (folder[0].children.length < config.qty) {
                return folder[0].id;
            }
        }

        return await this.improveFolderUpload(rootPath);

    }
    public async imagesChecked(rootPath: any) {
        const visuallyService: VisuallyService = new VisuallyService();
        let query: QueryModel = new QueryModel();
        query.raw = "fullText contains 'ok'";
        const folders: any = await this.searchFolder(query);

        //Random e-mail
        let emails: any = [];
        await readPromisify(`${rootPath}/storage/emails.list.json`, 'utf8').then(data => {
            emails = JSON.parse(data)
        });

        for (const folder in folders) {
            //query files
            query.raw = `'${folders[folder].id}' in parents`
            query.mimeType = '';
            const files = await this.searchFolder(query);
            files.forEach(async (file: any) => {
                const crawlerKeyWordsRepository: any = getRepository(CrawlerKeyWords);
                const imageRepository: any = getRepository(CrawlerImages);

                //find category 
                const { id, crawlerKeywordId }: any = await imageRepository
                    .createQueryBuilder()
                    .select('*')
                    .where('original_filename = :filename', { filename: `${file.name}` })
                    .getRawOne();
                const image = await imageRepository.findOne(id);
                const category: any = await crawlerKeyWordsRepository.findOne(crawlerKeywordId);

                //random emails
                const index = Math.floor(Math.random() * (emails.list.length ));

                const dataByVisually = {
                    "title": image.description,
                    "source": image.source,
                    "category": category.category,
                    "url": image.source_url,
                    "email": emails.list[index].email,
                    "api_token": `${process.env.VISUALLY_TOKEN}`
                }
                image.uploaded_at = new Date();
                const upload_id = visuallyService.send(dataByVisually)
                image.upload_id = upload_id;
                image.published_at = new Date();
                imageRepository.save(image);

            });
            const folerName = folders[folder].name.replace('_ok', '') + '_uploaded';
            this.renameFolder(folders[folder].id, folerName)
        };
        visuallyService.completeData();
        return folders;

    }
    private async downloadImage(rootPath: any, file: any) {
        const drive = await this.getValidDrive();
        const dest = fs.createWriteStream(`${rootPath}/storage/temp/${file.name}`);
        const res = await drive.files.get({
            fileId: file.id,
            alt: 'media',
        }, {
            responseType: 'stream'
        });
        const streamy = res.data as Readable;
        streamy.pipe(dest);
    }
    private async deleteFile(file: any) {
        const drive = await this.getValidDrive();
        drive.files.delete({
            fileId: file.id
        })
            .catch(err => console.log(err))

    }
    private async improveFolderUpload(rootPath: any) {
        const config = await this.getConfigFile(rootPath);
        //create a history
        config.last_position.id = config.current_position.id
        config.last_position.name = config.current_position.name


        //create a new folder
        config.current_position.name = `${config.folder_prefix}_${config.folder_number}`;
        config.current_position.id = await this.createFolder(
            config.current_position.name,
            config.main.id
        );
        config.folder_number++;
        //write config
        await writePromisify(`${rootPath}/storage/${CONFIG_FILES}`, JSON.stringify(config))
        return config.current_position.id;
    }
    public async uploadFile(file: any, rootPath: any) {
        const drive = await this.getValidDrive();
        const idCurrentFolder = await this.getCurrentFolderUpload(rootPath);

        let fileMetadata = {
            name: file.name,
            parents: [`${idCurrentFolder}`],
        };

        const media = {
            mimeType: file.mimeType,
            body: fs.createReadStream(file.path)
        };

        let fileGoogle: any = {};
        await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: '*'
        }).then(res => {
            //delete file
            unlinkPromisify(file.path)
            fileGoogle = res.data
        })
            .catch(err => console.log(err))
        return fileGoogle
    }

    public async searchFolder(query: any) {
        //Make Query
        let queryDrive: String = "trashed=false";
        for (const key in query) {
            const and = queryDrive != "" ? " and " : ""
            if (query[key] && key != 'getParents' && key != 'raw') {
                let value = query[key];
                if (key == 'trashed') {
                    value = query[key] ? 'true' : 'false'
                }
                queryDrive += `${and}${key} = '${value}'`
            } else if (key == 'raw') {
                queryDrive += `${and} ${query[key]}`
            }


        }

        const drive = await this.getValidDrive();
        let files: any = [];
        await drive.files.list({
            q: `${queryDrive}`,
            fields: 'nextPageToken, files(*)',
            spaces: 'drive',
            pageToken: null
        }).then(res => { files = res.data.files })
            .catch(err => { files = err });
        //add children files on father folder
        if (query.getParents && files.length) {
            let children: any = {}

            if (files[0].mimeType = 'application/vnd.google-apps.folder') {
                const idFolder = files[0].id
                children = await this.searchFolder({ raw: `'${idFolder}' in parents` })
            }
            files[0].children = children;
        }
        return files;
    }
    private async renameFolder(idFolder: string, name: string) {
        const drive = await this.getValidDrive();
        await drive.files.update({
            fileId: idFolder,
            requestBody: {
                name,
            }
        }).catch(err => console.log(err))
    }

    private async createFolder(name: string, parent: string = null) {
        const drive = await this.getValidDrive();
        let newfolder: any = {};
        let fileMetadata: any = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder'
        };
        if (parent) {
            fileMetadata.parents = [`${parent}`];
        }
        await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id'
        }).then(folder => {
            newfolder = folder.data.id;
        }).catch(err => console.log(err))
        return newfolder;
    }

}
