import multer from "multer";

const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits:{
        fileSize: 5 * 1024 * 1024 //5MB
    }
})

function uploadProductImage(req, res, next) {
    upload.single("image")(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            const message = error.code === "LIMIT_FILE_SIZE"
                ? "Product image must be 5 MB or smaller"
                : error.message
            return res.status(400).json({ message })
        }
        if (error) {
            return next(error)
        }
        next()
    })
}

export default uploadProductImage