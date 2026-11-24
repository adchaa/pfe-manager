import multer from "multer"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"
import fs from "fs"
import path from "path"

const uploadDir = "./uploads"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    )
  },
})

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true)
  } else {
    cb(new HttpError(400, errors.VALIDATION.INVALID_FILE_TYPE))
  }
}

//TODO :najmou n7adou taille mta3 m fichier
const limitSize = { fileSize: 5 * 1024 * 1024 } //5MB max

const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
  limits: limitSize,
})
export default upload
