const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

// * Prisma
const prisma = require('../../helper/prisma');

/**
 * @desc Load All Courses with It's Children
 */
// router.get('/courses/all', (req, res) => {
// 	try {
// 		const allPublicCourses = await prisma.course_details.findMany({
// 			where: { is_active: true },
// 			include: {
// 				admin: {
// 					select: {
// 						name: true
// 					}
// 				},
// 				chapters: {
// 					select: {
// 						chapter_name:
// 					}
// 				}
// 			}
// 		});
// 		res.json(allPublicCourses);
// 	} catch (err) {
// 		res.status(400).json(`Error Occur in ${err}`);
// 	}
// 	res.end();

// })


// * check coupon is valid or not
router.post('/coupon/check', async (req, res) => {
	const coupon = req.body.coupon;

	console.log(req.body);

	res.end();
	// try {
	// 	const getCoupon = await prisma.discount_coupon.findUnique({
	// 		where: {
	// 			coupon_code: coupon
	// 		}
	// 	});

	// 	if (!getCoupon) {
	// 		return res.status(400).json({ is_success: false, msg: `Coupon is Not Valid` });
	// 	}

	// 	return res.status(200).json({ is_success: true, msg: `Coupon is Valid`, data: getCoupon.discount });
	// } catch (err) {
	// 	console.log(err)
	// 	return res.status(400).json({ is_success: false, msg: `Something Went Wrong` });
	// }
});


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


/**
 * @desc Delete Assingment
 */
router.delete('/assignment/delete/:assignment_id', async (req, res) => {

	console.log(req.params.assignment_id);

	try {
		const assignment = await prisma.assignments.delete({ where: { id: req.params.assignment_id } });

		console.log(assignment);

		return res.status(200).json({ is_success: true, msg: `Assignment Deleted`, data: assignment });
	} catch (err) {
		console.error(err);
		return res.status(409).json({ is_success: false, msg: `Cannot create assignment`, error: err });
	}

});

module.exports = router;
