const express = require('express');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load database francis545@yahoo.com.tw
const User = require('../models/User');
const { ensureAuthenticated } = require('../config/auth');
const uuidv4 = require('uuid/v4');
const sharp = require('sharp'); // resize
const multer = require('multer'); // Multer upload image


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Multer storage
const storage = multer.diskStorage({
    // destination: './public/user-upload/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    // storage: storage,
    limits: { fileSize: 10000000 }
    // fileFilter: function (req, file, cb) {
    //     checkFileType(file, cb);
    // }
});
// Multer check type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Resize sharp
class Resize {
    constructor(folder) {
        this.folder = folder;
    }
    async save(buffer) {
        const filename = Resize.filename();
        const filepath = this.filepath(filename);

        await sharp(buffer)
            .resize(650, 380, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFile(filepath);

        return filename;
    }
    static filename() {
        return `${uuidv4()}.png`;
    }
    filepath(filename) {
        return path.resolve(`${this.folder}/${filename}`)
    }
}

let isLogin = false;

router.get('/', async function (req, res) {
    if (req.isAuthenticated()) {
        await res.render('community', { layout: false, isLogin: true, filename: undefined });
    }
    else {
        await res.render('community', { layout: false, isLogin: false, filename: undefined });
    }
});

router.post('/', upload.single('image'), async function (req, res) {
    if (req.isAuthenticated()) {
        isLogin = true;
    }
    else
        isLogin = false;
    if (!req.file) {
        res.render('community', {
            layout: false,
            isLogin: isLogin,
            msg: 'Error: No File Selected!'
        });
    }
    const imagePath = path.join(__dirname, '../public/user-upload');
    const fileUpload = new Resize(imagePath);
    const filename = await fileUpload.save(req.file.buffer);

    res.render('community', {
        layout: false,
        isLogin: isLogin,
        msg: 'File Uploaded!',
        filename: `user-upload/${filename}`
    });
});



module.exports = router;