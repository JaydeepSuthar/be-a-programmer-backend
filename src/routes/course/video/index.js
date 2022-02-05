const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../../middlewares/auth');

// * Prisma
const prisma = require('../../../helper/prisma');

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

router.post('/add', isLoggedIn, isAdmin, upload.single('video'), async (req, res) => {

	const filename = req.file.filename;
	const { chapterId, courseId, srno, title, is_visible } = req.body || {};

	if (req.uploadError) return res.status(401).json({ error: `${req.uploadError}` });

	// * Check weather chapter exists and if not create one

	// * CREATE VIDEO
	const video = {
		srno: parseInt(srno),
		title: title,
		src: filename,
		is_visible: is_visible || true,
		chaptersId: `61fbd6a30637ca1547b5fdb9`
	};

	try {
		const newVideo = await prisma.videos.create({ data: video });
		console.log(`New Video Created: ${newVideo.id}`);
		return res.status(200).json({ msg: `Video Uploaded Successfully`, data: newVideo });
	} catch (err) {
		console.error(`Error Occur: ${err}`);
		return res.status(400).json({ error: `Something went wrong` });
	}
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
				id: true,
				srno: true,
				title: true,
				src: true,
				chaptersId: true
			}
		});
		res.status(200).json({ data: video });
	} catch (err) {
		console.error(`Error Occur: ${err}`);
		return res.status(400).json({ error: `Something went wrong` });
	}

	res.end();

});

/**
 * @desc Edit Video
 */

router.put('/edit/:video_id', isLoggedIn, isAdmin, (req, res) => {
	return res.status(200).json({ msg: `Video updated Successfully` });
});


/**
 * @desc Delete Video
 */

router.delete('/delete/:video_id', isLoggedIn, isAdmin, async (req, res) => {

	const videoId = req.params.video_id || null;

	// * delete video
	try {
		const deletedVideo = await prisma.videos.delete({ where: { id: videoId }, select: { src: true } });
		console.log(deletedVideo);
		const filePath = deletedVideo.src;
		fs.unlinkSync(`upload/${filePath}`);
		return res.status(200).json({ msg: `Video deleted Successfully` });
	} catch (err) {
		console.error(`Error Occur: ${err}`);
		return res.status(400).json({ error: `Something went wrong` });
	}
});


module.exports = router;
