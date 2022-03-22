const multer = require("multer");

let fileName = "";

const upload = multer({
//   storage: multer.diskStorage({
//     destination(req, file, callback) {
//       let Oname = file.originalname;
//       let prefix = Oname.substring(0, Oname.lastIndexOf("."));
//       let extension = Oname.substring(Oname.lastIndexOf("."));
//       let ch = Date.now();
//       fileName = req.body.title + extension;
//       callback(null, "./media");
//     },
//     filename(req, file, callback) {
//       callback(null, fileName);
//     },
//   }),
storage: multer.diskStorage({
    destination(req, file, cb) {
        let Oname = file.originalname;
        let extension = Oname.substring(Oname.lastIndexOf('.'));
        let prefix = Oname;
        prefix = prefix.replace(/^\s+|\s+$/g, '');
        prefix = prefix.replace(/\s\s+/g, '_');
        prefix = prefix.replace(/ /g, '_');
    //   let d = new Date();
    //   let suffix = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`
      fileName = prefix;
      cb(null, './media');
    },
    filename(req, file, cb) {
      
      cb(null, fileName);
    }
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