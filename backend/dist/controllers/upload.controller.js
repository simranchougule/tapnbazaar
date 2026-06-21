"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleImages = exports.uploadSingleImage = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadSingleImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No image provided' });
            return;
        }
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const result = await cloudinary_1.v2.uploader.upload(fileStr, {
            folder: 'tapnbazaar/products',
            transformation: [
                { width: 1200, height: 900, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
            ],
        });
        res.status(200).json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: "Image upload failed. Please try again." });
    }
};
exports.uploadSingleImage = uploadSingleImage;
const uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({ success: false, message: 'No images provided' });
            return;
        }
        if (req.files.length > 5) {
            res.status(400).json({ success: false, message: 'Maximum 5 images allowed' });
            return;
        }
        const uploadPromises = req.files.map(async (file) => {
            const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const result = await cloudinary_1.v2.uploader.upload(fileStr, {
                folder: 'tapnbazaar/products',
                transformation: [
                    { width: 1200, height: 900, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' },
                ],
            });
            return result.secure_url;
        });
        const urls = await Promise.all(uploadPromises);
        res.status(200).json({
            success: true,
            urls,
            message: `${urls.length} images uploaded successfully`,
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: "Image upload failed. Please try again." });
    }
};
exports.uploadMultipleImages = uploadMultipleImages;
//# sourceMappingURL=upload.controller.js.map