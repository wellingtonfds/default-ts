import { google } from 'googleapis';
import * as fs from 'fs';
import * as util from 'util';



const TOKEN_PATH = 'token.json';
const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.metadata',
    'https://www.googleapis.com/auth/drive.photos.readonly'

];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.



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

    async init() {
        return await this.authorize(this.content);
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
    public async authorize(credentials: any) {
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


    private async getValidAuth() {
        const auth = await this.getOauth2Client();
        const readPromisify = util.promisify(fs.readFile);
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
        //  const auth = await this.getOauth2Client();

        // const readPromisify = util.promisify(fs.readFile);
        // let token: any = {};
        // await readPromisify(TOKEN_PATH, 'utf8').then(data => {
        //     token = JSON.parse(data);
        // });
        // auth.setCredentials(token)

        // const drive = google.drive({ version: 'v3',  auth});
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

    public async createFolder() {
        const drive = await this.getValidDrive();
        let fileMetadata = {
            'name': 'Invoices',
            'mimeType': 'application/vnd.google-apps.folder'
        };
        drive.files.create({
            requestBody: fileMetadata,
            fields: 'id'
        }, function (err :any, file :any) {
            if (err) {
                // Handle error
                console.error(err);
            } else {
                console.log('Folder Id: ', file.id);
            }
        });
    }
    
}
