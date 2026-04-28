const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isAudio = file.mimetype.startsWith('audio');
    return {
      folder: isAudio ? 'epic-ielts/audio' : 'epic-ielts/images',
      resource_type: isAudio ? 'video' : 'image', // Cloudinary uses 'video' for audio files
      format: isAudio ? 'mp3' : undefined,
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  },
});

module.exports = { cloudinary, storage };
