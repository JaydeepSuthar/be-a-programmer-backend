const router = require("express").Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require("../../../middlewares/auth");

// * Prisma
const prisma = require("../../../helper/prisma");

/**
 * @desc Get all Chapters of Particular Course
 */
router.get("/:course_id", async (req, res) => {
	const { course_id } = req.params;

	try {
		const allChapters = await prisma.chapters.findMany({
			where: {
				course_detailsId: course_id,
			},
			include: {
				_count: {
					select: {
						videos: true,
						assignments: true,
					},
				},
			},
		});
		console.log(JSON.stringify(allChapters, null, 2));
		// console.table(allChapters);
		return res.status(200).json({
			is_success: true,
			msg: `Chapters found`,
			data: allChapters,
		});
	} catch (err) {
		console.log(err.message);
		return res.status(404).json({
			is_success: false,
			msg: `Chapters not found`,
			error: err.message,
		});
	}
});

/**
 * @desc Get Single Chapter
 */
// ? i don't think this is neccessary now
router.get("/:chapter_id", async (req, res) => {
	const { chapter_id } = req.params;

	// * check chapter exists or not
	const chapterExists = await prisma.chapters.count({
		where: { id: chapter_id },
	});
	if (!chapterExists)
		return res.status(409).json({ error: `Chapter Doesn't Exists` });

	try {
		const chapter = await prisma.chapters.findUnique({
			where: { id: chapter_id },
		});
		return res.status(200).json({ msg: `Chapter Details`, data: chapter });
	} catch (err) {
		console.log(err.message);
		return res.status(409).json({ error: `Something went wrong` });
	}
});

/**
 * @desc Add Chapter
 */

router.post("/add", isLoggedIn, isAdmin, async (req, res) => {
	const { name, is_visible, course_id } = req.body || "";

	// * check course exists or not
	const courseExists = await prisma.course_details.count({
		where: { id: course_id },
	});
	if (!courseExists)
		return res.status(409).json({ error: `Course Doesn't Exists` });

	// * check chapter with same name exists in course
	// const chapterWithNameExists = await prisma.chapters.count({ where: { AND: { chapter_name: { contains: chapter_name }, course_detailsId: course_id } } });
	// if (chapterWithNameExists) return res.status(409).json({ error: `Chapter with Same Name Exists` });

	const courseWithAllChaptersSrno = await prisma.course_details.findUnique({
		where: {
			id: course_id,
		},
		include: {
			chapters: {
				select: {
					srno: true,
				},
				orderBy: {
					srno: "desc",
				},
			},
		},
	});
	let lastSrNumber = courseWithAllChaptersSrno.chapters[0];

	if (lastSrNumber) {
		lastSrNumber = lastSrNumber.srno + 1;
	} else {
		lastSrNumber = 1;
	}

	// * add chapter
	const chapter = {
		srno: lastSrNumber,
		chapter_name: name,
		is_visible: is_visible,
		course_detailsId: course_id,
	};

	try {
		const newChapter = await prisma.chapters.create({
			data: chapter,
			include: {
				_count: {
					select: {
						videos: true,
						assignments: true,
					},
				},
			},
		});
		return res
			.status(200)
			.json({ msg: `new chapter created`, data: newChapter });
	} catch (err) {
		console.error(err.message);
		return res.status(409).json({ error: err.message });
	}
});

/**
 * @desc Edit Chapter
 */

router.put("/edit/:chapter_id", isLoggedIn, isAdmin, async (req, res) => {
	const { chapter_id } = req.params || 0;
	const { srno, chapter_name, is_visible } = req.body;

	// * check chapter exists or not
	const chapterExists = await prisma.chapters.count({
		where: { id: chapter_id },
	});
	if (!chapterExists)
		return res.status(409).json({ error: `Chapter Doesn't Exists` });

	// * updating chapter
	const chapter = {
		srno: srno,
		chapter_name: chapter_name,
		is_visible: is_visible,
	};

	try {
		const updatedChapter = await prisma.chapters.update({
			data: chapter,
			where: { id: chapter_id },
		});
		return res
			.status(200)
			.json({ msg: `chapter edited successfully`, data: updatedChapter });
	} catch (err) {
		console.log(err.message);
		return res.status(409).json({ error: `Something went wrong` });
	}
});

/**
 * @desc Delete Chapter
 */

router.delete("/delete/:chapter_id", isLoggedIn, isAdmin, async (req, res) => {
	const { chapter_id } = req.params || 0;

	// * find and delete chapter
	try {
		const deletedChapter = await prisma.chapters.delete({
			where: { id: chapter_id },
		});
		return res.status(200).json({
			msg: `Successfully deleted chapter ${deletedChapter.chapter_name}`,
		});
	} catch (err) {
		return res.status(409).json({ msg: `Error Occur`, error: err.message });
	}
});

// ! all assignment routes go here
// router.post('/assignment/add', async (req, res) => {

// 	const {} = req.body;

// })

module.exports = router;
