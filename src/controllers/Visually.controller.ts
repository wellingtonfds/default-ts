import GoogleDrive from "../services/GoogleDrive.service";

export default class VisuallyController {
    private path: string;

    constructor(path = "") {
        this.path = path;
    }

    public async index()  {
        let googleService = new GoogleDrive();
        googleService.imagesChecked(this.path);
    }

}