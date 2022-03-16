const multer = require("multer");

let fileName = "";

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      let Oname = file.originalname;
      let prefix = Oname.substring(0, Oname.lastIndexOf("."));
      let extension = Oname.substring(Oname.lastIndexOf("."));
      let ch = Date.now();
      fileName = req.body.title + extension;
      callback(null, "./media"+req.body.upload);
    },
    filename(req, file, callback) {
      callback(null, fileName);
    },
  }),
  // limits: {
  //   fileSize: 20000000 // max file size 1MB = 1000000 bytes
  // },
  // fileFilter(req, file, callback) {
  //   if (!file.originalname.match(/\.(jpeg|jpg|png|pdf)$/)) {
  //     return callback(
  //       new Error(
  //         'only upload files with jpg, jpeg, png format.'
  //       )
  //     );
  //   }
  //   callback(undefined, true); // continue with upload
  // }
});

module.exports = upload;