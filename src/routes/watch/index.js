const router = require('express').Router();
const fs = require('fs');
const path = require('path');

// * VALIDATION
const { isLoggedIn } = require('../../middlewares/auth');

let video_src = "";
let is_requesting_new_video = false;
let videoStream;

router.post('/set', (req, res) => {
	console.log(`i get called`);
	const src = req.body.src;

	if (video_src != src) {
		is_requesting_new_video = true;
	}

	video_src = src;
});

function checkVideoStream (res) {
	if ( is_requesting_new_video == true) {
		videoStream.unpipe(res);
	}
}

/**
 * @desc Serve Video
 */

router.get("/", (req, res) => {
	console.log(video_src);

	// checkVideoStream(res);

	// Ensure there is a range given for the video
	const range = req.headers.range;
	if (!range) {
		res.status(400).send("Requires Range header");
	}

	// get video stats (about 61MB)
	const videoPath = `D:\\Project\\backEnd\\upload\\${video_src}`;
	const videoSize = fs.statSync(videoPath).size;

	// Parse Range
	// Example: "bytes=32324-"
	const CHUNK_SIZE = 10 ** 6; // 1MB
	const start = Number(range.replace(/\D/g, ""));
	const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

	// Create headers
	const contentLength = end - start + 1;
	const headers = {
		"Content-Range": `bytes ${start}-${end}/${videoSize}`,
		"Accept-Ranges": "bytes",
		"Content-Length": contentLength,
		"Content-Type": "video/mp4",
	};

	// HTTP Status 206 for Partial Content
	res.writeHead(206, headers);


	// create video read stream for this particular chunk
	videoStream = fs.createReadStream(videoPath, { start, end });

	// Stream the video chunk to the client
	videoStream.pipe(res);
});

module.exports = router;
