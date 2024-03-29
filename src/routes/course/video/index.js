const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// * VALIDATION
const { isLoggedIn, isAdmin } = require("../../../middlewares/auth");

// * Prisma
const prisma = require("../../../helper/prisma");

// * MULTER CONFIG
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// console.log(file);
		cb(null, `upload/`);
	},

	filename: (req, file, cb) => {
		// console.log(file);
		cb(null, `${Date.now()}${path.extname(file.originalname)}`);
	},
});

const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		if (!file.originalname.match(/\.(mp4|mkv)$/)) {
			req.uploadError = new Error("Only Video file is Allowed");
		}
		cb(undefined, true);
	},
});

/**
 * @desc Get All Videos By Course
 */
router.get("/all/:course_id", async (req, res) => {
	const course_id = req.params.course_id || 0;
	let chaptersWithVideos = [];

	try {
		const fetchAllChapterWithVideo = await prisma.chapters.findMany({
			where: {
				course_detailsId: course_id,
			},
			include: {
				videos: true
			},
		});

		for (
			let videos = 0;
			videos < fetchAllChapterWithVideo.length;
			videos++
		) {
			if (fetchAllChapterWithVideo[videos].videos.length > 0) {
				// console.log(fetchAllChapterWithVideo[videos])
				chaptersWithVideos.push(fetchAllChapterWithVideo[videos]);
			}
		}

		// return res.status(200).json({ data: chaptersWithVideos });

		return res
			.status(200)
			.json({ msg: `All Videos`, data: chaptersWithVideos });
	} catch (err) {
		console.error(`Error Occur: ${err}`);
		return res
			.status(404)
			.json({
				is_succes: false,
				msg: `Videos Not Found`,
				error: err.message,
			});
	}
});

/**
 * @desc Get All Videos By Chapter
 */
router.get("/:chapter_id", async (req, res) => {
	const chapter_id = req.params.chapter_id || 0;

	try {
		const videos = await prisma.videos.findMany({
			where: {
				chaptersId: chapter_id,
			},
		});
		return res.status(200).json({ msg: `Video Found`, data: videos });
	} catch (err) {
		console.error(`Error Occur: ${err}`);
		return res
			.status(404)
			.json({
				is_succes: false,
				msg: `Videos Not Found`,
				error: err.message,
			});
	}
});

/**
 * @desc Get Single Video
 */

router.get("/:video_id", async (req, res) => {
	const videoId = req.params.video_id || null;

	// * Check wheater video is exists

	try {
		const video = await prisma.videos.findUnique({
			where: {
				id: videoId,
			},
			include: {
				Chapters: true,
			},
		});
		return res.status(200).json({ msg: `Video Found`, data: video });
	} catch (err) {
		console.error(`Error Occur: ${err}`);
		return res.status(400).json({ error: `Something went wrong` });
	}
});

/**
 * @desc Add Single Video
 */

router.post(
	"/add",
	isLoggedIn,
	isAdmin,
	upload.single("video"),
	async (req, res) => {
		const filename = req.file.filename;
		console.log(filename);
		const { chapterId, courseId, srno, title, is_visible } = req.body || {};

		console.log(chapterId);
		if (req.uploadError)
			return res.status(401).json({ error: `${req.uploadError}` });

		// * Check weather chapter exists and if not create one

		// * CREATE VIDEO
		const video = {
			srno: parseInt(srno),
			title: title,
			src: filename,
			is_visible: is_visible || true,
			chaptersId: chapterId,
		};

		try {
			const newVideo = await prisma.videos.create({ data: video });
			console.log(newVideo);
			console.log(`New Video Created: ${newVideo.id}`);
			return res
				.status(200)
				.json({
					is_succes: true,
					msg: `Video Uploaded Successfully`,
					data: newVideo,
				});
		} catch (err) {
			console.error(`Error Occur: ${err}`);
			return res
				.status(418)
				.json({
					is_success: false,
					msg: `Something went wrong`,
					error: err,
				});
		}
	}
);

/**
 * @desc Edit Video
 */

router.put(
	"/edit/:video_id",
	isLoggedIn,
	isAdmin,
	upload.single("video"),
	async (req, res) => {
		const { video_id } = req.params;
		const { filename } = req.file || "";
		const { srno, title, is_visible } = req.body || {};

		if (req.uploadError)
			return res.status(401).json({ error: `${req.uploadError}` });

		// * Check weather chapter exists and if not create one

		// * CREATE VIDEO
		const video = {
			srno: srno,
			title: title,
			src: filename,
			is_visible: is_visible,
		};

		try {
			const oldVideo = await prisma.videos.findUnique({
				where: { id: video_id },
				select: { src: true },
			});
			const oldVideoPath = oldVideo.src;
			fs.unlink(`upload/${oldVideoPath}`, (err) => {
				if (err)
					return res.status(402).json({ msg: `Video not Found` });

				console.log(`video deleted succesfully`);
			});

			const updatedVideo = await prisma.videos.update({
				where: { id: video_id },
				data: video,
			});
			console.log(`Video updated: ${updatedVideo.id}`);
			return res
				.status(200)
				.json({ msg: `Video Update Successfully`, data: updatedVideo });
		} catch (err) {
			console.error(`Error Occur: ${err}`);
			return res.status(400).json({ error: `Something went wrong` });
		}
	}
);

/**
 * @desc Delete Video
 */

router.delete("/delete/:video_id", isLoggedIn, isAdmin, async (req, res) => {
	const videoId = req.params.video_id || 0;

	// * delete video
	try {
		const deletedVideo = await prisma.videos.delete({
			where: { id: videoId },
			select: { src: true },
		});
		console.log(deletedVideo);
		const filePath = deletedVideo.src;
		fs.unlink(`upload/${filePath}`, (err) => {
			if (err) return res.status(402).json({ msg: `Video not Found` });

			console.log(`video deleted succesfully`);
		});
		return res.status(200).json({ msg: `Video deleted Successfully` });
	} catch (err) {
		console.error(`Error Occur: ${err}`);
		return res.status(400).json({ error: `Something went wrong` });
	}
});

module.exports = router;
