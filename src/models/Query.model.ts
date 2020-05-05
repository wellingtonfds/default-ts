export default class QueryModel {
    public id: string
    public idParent: string
    public name: string
    public mimeType: string
    public trashed: boolean = false
    public getParents:boolean = false
    public raw:string; 
    /**
     * 
     * @param mineType default = application/vnd.google-apps.folder'
     */
    constructor (mineType:string = 'application/vnd.google-apps.folder'){
        if(mineType){
            this.mimeType = mineType;
        }  
    }

}