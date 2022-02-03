const router = require('express').Router();
const multer = require('multer');
const path = require('path');

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../../middlewares/auth');

// * Prisma
const prisma = require('../../../helper/prisma');
const { runInNewContext } = require('vm');

// * MULTER CONFIG
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// console.log(file);
		cb(null, `upload/`);
	},

	filename: (req, file, cb) => {
		// console.log(file);
		cb(null, `${Date.now()}${path.extname(file.originalname)}`);
	}
});

const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		if (!file.originalname.match(/\.(mp4|mkv)$/)) {
			req.uploadError = new Error('Only Video file is Allowed');
		}
		cb(undefined, true);
	}
});

/**
 * @desc Add Single Video
 */

router.post('/add', upload.single('video'), async (req, res) => {

	const filename = req.file.filename;
	const { chapterId, courseId, srno, is_visible } = req.body || {};

	if (req.uploadError) console.log(req.uploadError.message);


	// * Check weather chapter exists and if not create one

	// * CREATE VIDEO
	const video = {
		srno: parseInt(srno),
		src: filename,
		is_visible: is_visible || true,
		chaptersId: `61fbd6a30637ca1547b5fdb9`
	};

	try {
		const newVideo = await prisma.videos.create({ data: video });
		console.log(`New Video Created: ${newVideo.id}`);
		res.status(200).json({ data: newVideo });
	} catch (err) {
		console.error(`Error Occur: ${err}`);
	}

	// res.status(200).json({ msg: `video uploaded` });
	res.end();
});

/**
 * @desc Get Video
 */

router.get('/:video_id', async (req, res) => {
	const videoId = req.params.video_id || null;

	// * Check wheater video is exists

	try {
		const video = await prisma.videos.findUnique({
			where: {
				id: videoId
			},
			select: {
				srno: true,
				title: true,
				src: true,
			}
		});
		res.status(200).json({ data: video });
	} catch (err) {
		console.error(`Error Occur: ${err}`);
	}

	res.end();

});

module.exports = router;
