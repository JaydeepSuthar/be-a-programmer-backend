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


module.exports = router;
