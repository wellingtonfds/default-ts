import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            const ROOT_PATH = req.app.get('ROOT_PATH');
            cb(null, ROOT_PATH + "/storage/uploads/");
        } catch (error) {
            console.error('error', error);

        }

    },
    filename: function (req, file, cb) {
        try {
            cb(null, file.originalname);
        } catch (error) {
            console.error('error', error);
        }
    }
});

const uploads = multer({ storage: storage });

export default uploads;