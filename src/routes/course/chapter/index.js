const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../../middlewares/auth');

// * Prisma
const prisma = require('../../../helper/prisma');

/**
 * @desc Get Single Chapter
 */

router.get('/:chapter_id', async (req, res) => {

	const {chapter_id} = req.params;

	// * check chapter exists or not
	const chapterExists = await prisma.chapters.count({ where: { id: chapter_id } });
	if (!chapterExists) return res.status(409).json({ error: `Chapter Doesn't Exists` });

	try {
		const chapter = await prisma.chapters.findUnique({ where: { id: chapter_id } });
		return res.status(200).json({ msg: `Chapter Details`, data: chapter });
	} catch (err) {
		console.log(err.message);
		return res.status(409).json({ error: `Something went wrong` });
	}
});

/**
 * @desc Add Chapter
 */

router.post('/add', async (req, res) => {

	const { srno, chapter_name, is_visible, course_id } = req.body || '';

	// * check course exists or not
	const courseExists = await prisma.course_details.count({ where: { id: course_id } });
	if (!courseExists) return res.status(409).json({ error: `Course Doesn't Exists` });

	// * check chapter with same name exists in course
	// FIXME: not working...
	const chapterWithNameExists = await prisma.chapters.count({ where: { AND: { chapter_name: { contains: chapter_name }, id: course_id }   } });
	if (chapterWithNameExists) return res.status(409).json({ error: `Chapter with Same Name Exists` });

	// FIXME: ERROR IN CREATING CHAPTER :: it's already fixed
	// * add chapter
	const chapter = {
		srno: parseInt(srno),
		chapter_name: chapter_name,
		is_visible: is_visible,
		course_detailsId: course_id
	};

	try {
		const newChapter = await prisma.chapters.create({ data: chapter });
		return res.status(200).json({ msg: `new chapter created`, data: newChapter });
	} catch (err) {
		return res.status(409).json({ error: err.message });
	}
});

/**
 * @desc Edit Chapter
 */

router.put('/edit/:chapter_id', async (req, res) => {

	const { chapter_id } = req.params || 0;
	const { srno, chapter_name, is_visible } = req.body;

	// * check chapter exists or not
	const chapterExists = await prisma.chapters.count({ where: { id: chapter_id } });
	if (!chapterExists) return res.status(409).json({ error: `Chapter Doesn't Exists` });

	// * updating chapter
	const chapter = {
		srno: srno,
		chapter_name: chapter_name,
		is_visible: is_visible,
	};

	try {
		const updatedChapter = await prisma.chapters.update({ data: chapter, where: { id: chapter_id } });
		return res.status(200).json({ msg: `chapter edited successfully`, data: updatedChapter });
	} catch (err) {
		console.log(err.message);
		return res.status(409).json({ error: `Something went wrong` });
	}
});

/**
 * @desc Delete Chapter
 */

router.delete('/delete/:chapter_id', async (req, res) => {
	const { chapter_id } = req.params || 0;

	// * find and delete chapter
	try {
		const deletedChapter = await prisma.chapters.delete({ where: { id: chapter_id } });
		return res.status(200).json({ msg: `Successfully deleted chapter ${deletedChapter.chapter_name}` });
	} catch (err) {
		return res.status(409).json({ msg: `Error Occur`, error: err.message });
	}
});

module.exports = router;
