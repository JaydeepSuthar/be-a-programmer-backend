const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

// * Prisma
const prisma = require('../../helper/prisma');

/**
 * @desc Get Stats
 */
router.get('/stats', async (req, res) => {

	try {
		const totalUserCount = await prisma.users.count({});
		const totalInstructor = await prisma.admin.count({
			where: {
				role: {
					not: {
						equals: 'admin'
					}
				}
			}
		});
		const totalCourseCount = await prisma.course_details.count({});
		const totalBlogCount = await prisma.blog.count({});

		const allStats = {
			users: totalUserCount,
			courses: totalCourseCount,
			blogs: totalBlogCount,
			instructors: totalInstructor
		};

		return res.status(200).json({
			is_success: true,
			msg: `All Stats`,
			stats: allStats
		});

	} catch (err) {
		console.log(err);
		return res.status(400).json({ is_success: false, msg: `Error Finding Stats`, error: err.message });
	}

});


/**
 * @desc Get All Assignment
 */
router.get('/assignment/:chapter_id', async (req, res) => {
	const { chapter_id } = req.params;

	try {
		const allAssignments = await prisma.assignments.findMany({
			where: {
				chaptersId: chapter_id
			},
		});
		console.log(JSON.stringify(allAssignments, null, 2));
		return res.status(200).json({ is_success: true, msg: `Assignement found`, data: allAssignments });
	} catch (err) {
		console.error(err.message);
		return res.status(404).json({ is_success: false, msg: `Assignement not found`, error: err.message });
	}

});


/**
 * @desc Create Assingment
 */
router.post('/assignment/add', async (req, res) => {
	const { src, chapterId, is_active } = req.body || null;

	console.log(req.body);

	try {
		const assignment = await prisma.assignments.create({
			data: {
				src: src,
				chaptersId: chapterId,
				is_visible: is_active
			}
		});

		console.log(assignment);

		return res.status(200).json({ is_success: true, msg: `Assignment Created`, data: assignment });
	} catch (err) {
		console.error(err);
		return res.status(409).json({ is_success: false, msg: `Cannot create assignment`, error: err });
	}

});

module.exports = router;
