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

	if (req.session.user && req.session.user.role == "instructor") {
		try {
			// const totalUserCount = await prisma.users.count({});
			// const totalInstructor = await prisma.admin.count({
			// 	where: {
			// 		role: {
			// 			not: {
			// 				equals: 'admin'
			// 			}
			// 		}
			// 	}
			// });
			const totalCourse = await prisma.course_details.findMany({
				where: {
					adminId: req.session.user.id
				}
			});
			const allCoursesIds = totalCourse.map(item => item.id);
			const myCourseLearning = await prisma.learning.findMany({
				where: {
					course_id: {
						in: allCoursesIds
					}
				}
			});
			// myCourseLearning.map(item => console.table(item));
			// const totalCourseCount = await prisma.course_details.count({
			// 	where: {
			// 		adminId: req.session.user.id
			// 	}
			// });
			// const totalBlogCount = await prisma.blog.count({});

			const allStats = {
				users: myCourseLearning.length,
				courses: allCoursesIds.length,
				blogs: 0,
				instructors: 0
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

	}



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


/**
 * @desc Get My Learning
 */
router.get('/learning', async (req, res) => {
	if (!req.session.user) {
		return res.status(200).json({ is_success: false, msg: `Please Logged In First` });
	}

	const myLearning = await prisma.learning.findMany({
		where: {
			user_id: req.session.user.id
		}
	});

	console.log(myLearning);

	if (!myLearning) {
		return res.status(404).json({ is_success: false, msg: `You not enrolled in any courses` });
	} else {
		let coursesIds = myLearning.map(item => item.course_id);
		const courses = await prisma.course_details.findMany({
			where: {
				id: { in: coursesIds }
			},
			select: {
				id: true,
				title: true,
				thumbnail: true
			}
		});

		console.log(courses);

		return res.status(200).json({ is_success: true, msg: `All Courses you are enrolled in`, data: courses });
	}

});

/**
 * @desc Get User Details
 */
router.get('/me', async (req, res) => {
	if (!req.session.user) {
		return res.status(200).json({ is_success: false, msg: `Please Logged In First` });
	}

	const userData = await prisma.users.findUnique({
		where: {
			id: req.session.user.id
		}
	});

	if (!userData) {
		return res.status(404).json({ is_success: false, msg: `Please Contact Admin` });
	}

	return res.status(200).json({ is_success: true, msg: `User Data`, data: userData });
});

/**
 * @desc Add Complain
 */
router.post('/contact', async (req, res) => {

	const response = await prisma.userComplains.create({
		data: req.body
	});

	if (response) {
		return res.status(200).json({ msg: `Your Query is Submitted` });
	}

});

/**
 * @desc Get all assignment
 */
router.get("/assignments/:course_id", async (req, res) => {
	const course_id = req.params.course_id || 0;

	let chaptersWithAssignment = [];

	try {
		const fetchAllChapterWithAssignments = await prisma.chapters.findMany({
			where: {
				course_detailsId: course_id,
			},
			include: {
				assignments: {
					select: {
						id: true,
						src: true
					}
				}
			},
		});

		for (
			let assignment = 0;
			assignment < fetchAllChapterWithAssignments.length;
			assignment++
		) {
			// console.log(fetchAllChapterWithAssignments[assignment]);
			if (fetchAllChapterWithAssignments[assignment].assignments.length > 0) {
				// console.log(fetchAllChapterWithAssignments[assignment])
				chaptersWithAssignment.push(...fetchAllChapterWithAssignments[assignment].assignments);
			}
		}
		// console.log(chaptersWithAssignment)
		// return res.status(200).json({ data: chaptersWithVideos });

		return res
			.status(200)
			.json({ msg: `All Assignments`, data: chaptersWithAssignment });
	} catch (err) {
		console.error(`Error Occur: ${err}`);
		return res
			.status(404)
			.json({
				is_succes: false,
				msg: `Assingment Not Found`,
				error: err.message,
			});
	}
});

/**
 * @desc Get Exam
 */
router.get('/exam/:course_id', async (req, res) => {

	const course_id = req.params.course_id || 0;

	try {
		const exam = await prisma.exams.findUnique({
			where: {
				course_detailsId: course_id
			}
		});
		return res
			.status(200)
			.json({ msg: `Exam`, data: exam.google_form_link });
	} catch (err) {
		console.error(`Error Occur: ${err}`);
		return res
			.status(404)
			.json({
				is_succes: false,
				msg: `Exam Not Found`,
				data: "No Exam Found",
				error: err.message,
			});
	}
});

module.exports = router;
