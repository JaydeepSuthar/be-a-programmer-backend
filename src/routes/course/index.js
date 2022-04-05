const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

// * Prisma
const prisma = require('../../helper/prisma');
const { createCourseValidation } = require('../../helper/validation');

// * get all coupon
router.get('/coupon', async (req, res) => {

	try {
		const allCounponCode = await prisma.discount_coupon.findMany({});
		return res.status(200).json({ is_success: true, msg: `Coupon Codes Found`, data: allCounponCode });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ is_success: false, msg: `Coupon not found`, error: err });
	}

});

// * check coupon is valid or not
router.post('/coupon/check', async (req, res) => {
	const coupon = req.body.coupon;

	try {
		const getCoupon = await prisma.discount_coupon.findUnique({
			where: {
				coupon_code: coupon
			}
		});

		if (!getCoupon) {
			return res.status(400).json({ is_success: false, msg: `Coupon is Not Valid` });
		}

		return res.status(200).json({ is_success: true, msg: `Coupon is Valid`, data: getCoupon.discount });
	} catch (err) {
		console.log(err);
		return res.status(400).json({ is_success: false, msg: `Something Went Wrong` });
	}
});


// * create coupon
router.post('/coupon/generate', async (req, res) => {

	const { title, code, discount, valid_till } = req.body;

	try {
		const newCoupon = await prisma.discount_coupon.create({
			data: {
				coupon_title: title,
				coupon_code: code,
				discount: parseFloat(discount),
				valid_till
			}
		});

		return res.status(200).json({ is_success: true, msg: `New Coupon Generated`, data: newCoupon });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ is_success: false, msg: `Cannot create coupon`, error: err });
	}
});


router.get('/exams', async (req, res) => {
	// const { title, form_link, course_id } = req.body;
	console.log(`i got to run`);
	try {
		const allExams = await prisma.exams.findMany({
			include: {
				course_details: {
					select: {
						title: true,
					}
				}
			}
		});
		console.log(allExams);
		return res.status(200).json({ is_success: true, msg: `Exam Created`, data: allExams });
	} catch (err) {
		console.error(err);
		return res.status(409).json({ is_success: false, msg: `Cannot found exam`, error: err });
	}
});


router.delete('/exams/delete/:exam_id', async (req, res) => {
	// const { title, form_link, course_id } = req.body;
	const exam_id = req.params.exam_id || 0;

	console.log(`i got to run`);

	try {
		const deletedExam = await prisma.exams.delete({
			where: {
				id: exam_id
			}
		});
		console.log(deletedExam);
		return res.status(200).json({ is_success: true, msg: `Exam deleted`, data: deletedExam });
	} catch (err) {
		console.error(err);
		return res.status(409).json({ is_success: false, msg: `Exam not found`, error: err });
	}
});


// * get all public course
router.get('/', async (req, res) => {

	if (req.session.user && req.session.user.role === 'instructor') {
		let instructor_id = req.session.user.id;

		try {
			const allPublicCourses = await prisma.course_details.findMany({
				where: {
					AND: [
						{
							is_active: true
						},
						{
							adminId: instructor_id
						}
					]
				},
				include: {
					admin: {
						select: {
							name: true
						}
					}
				}
			});
			return res.status(200).json(allPublicCourses);
		} catch (err) {
			return res.status(418).json(`Error Occur in ${err}`);
		}

	}

	try {
		const allPublicCourses = await prisma.course_details.findMany({
			where: {
				is_active: true
			},
			include: {
				admin: {
					select: {
						name: true
					}
				}
			}
		});
		res.status(200).json(allPublicCourses);
	} catch (err) {
		console.log(err)
		res.status(404).json(`Error Occur in ${err}`);
	}
	res.end();
});

// * get all tags
router.get('/tags', async (req, res) => {
	try {
		const tags = await prisma.course_details.findMany({
			where: { is_active: true },
			select: { id: true, tags: true },
		});
		res.status(200).json(tags);
	} catch (err) {
		res.status(400).json(`Error Occur in ${err}`);
	}
	res.end();
});


// * get all courses with matching tags
router.get('/tag/:tag_name', async (req, res) => {
	const tag = req.params.tag_name;

	console.log(tag);

	try {
		const courses = await prisma.course_details.findMany({
			where: {
				tags: {
					hasEvery: tag,
				}
			},
			// select: { id: true, description: true, title: true, thumbnail: true, price: true, tags: true },
		});
		res.status(200).json(courses);
		console.log(courses);
	} catch (err) {
		res.status(400).json(`Error Occur in ${err}`);
	}
	res.end();
});

// * get particular course
router.get('/:course_id', async (req, res) => {

	const course_id = req.params.course_id;

	try {
		const course = await prisma.course_details.findFirst({
			where: { is_active: true, id: course_id },
			// select: {
			// 	id: true, tags: true, description: true, thumbnail: true, title: true, price: true
			// }
		});
		res.status(200).json(course);
	} catch (err) {
		res.status(400).json(`Error Occur in ${err}`);
	}
	res.end();
});

// * create course
// ! add validation and logged in middleware
router.post('/add', isLoggedIn, isAdmin, async (req, res) => {

	const { title, slug, description, thumbnail, price, duration, requirement, is_active, adminId } = req.body;
	// console.log(req.body);
	// * validate data
	const { error, value } = createCourseValidation({ title, slug, description, thumbnail, price, duration, requirement, is_active, adminId });
	console.log(error, value);
	if (error) return res.status(401).json({ is_success: false, msg: `Error Occurred`, error: error.details[0].message });

	// * saving it in db
	const courseData = {
		title: title,
		slug: slug,
		description: description,
		thumbnail: thumbnail || '',
		price: parseFloat(price),
		duration: duration || "",
		requirement: requirement || "",
		is_active: is_active,
		adminId: adminId,
		tags: ['web', 'node', 'js']
	};

	try {
		const newCourse = await prisma.course_details.create({
			data: courseData,
			include: {
				admin: {
					select: {
						name: true
					}
				}
			}
		});
		console.log(`Course Created\nID: ${{ newCourse }}`);
		res.status(200).json({ is_success: true, msg: `New Course Created`, data: newCourse });
	} catch (err) {
		console.error(`Error Occur ${err}`);
		if (err.code === "P2002") {
			return res.status(400).json({ is_success: false, msg: `Course Already Exists with same title or slug`, error: `Course Already Exists with same title or slug` });
		}
		res.status(400).json({ is_success: false, msg: `Error Occurred`, error: err });
	}

	res.end();
});

// * edit course
router.put('/update/:course_id', isLoggedIn, isAdmin, async (req, res) => {

	const course_id = req.params.course_id || 0;

	const { title, slug, description, thumbnail, price, duration, requirement, is_active, adminId } = req.body;

	if (!course_id) return res.status(400).json({ msg: "Please provide valid course id" });

	// * validate data

	// * check course already exists

	// * saving it in db
	const courseData = {
		title: title,
		slug: slug,
		description: description,
		thumbnail: thumbnail,
		price: parseFloat(price),
		duration: duration || "",
		requirement: requirement || "",
		is_active: is_active,
		adminId: adminId
	};

	// * update
	try {
		const updatedCourse = await prisma.course_details.update({
			where: {
				id: course_id
			},
			data: courseData,
			// select: { id: true, description: true, title: true, thumbnail: true, price: true, tags: true },
		});
		res.json(updatedCourse);
	} catch (err) {
		// res.status(400).json(`Error Occur ${err}`);
		console.log(`Error Occur ${err}`);
	}

	res.end();
});

// * delete course
router.delete('/remove/:course_id', isLoggedIn, isAdmin, async (req, res) => {

	const course_id = req.params.course_id || 0;

	if (!course_id) return res.status(400).json({ msg: "Please provide valid course id" });

	// * check course exists or not
	// const course = await Course.findOne({ _id: course_id }).lean();
	// if (!course) return res.status(400).json({ "msg": "Course Not Found" });

	try {
		const deletedCourse = await prisma.course_details.delete({
			where: { id: course_id },
		});
		res.status(200).json({ is_success: true, msg: `${deletedCourse.title} is Deleted Successfylly` });
	} catch (err) {
		console.log(err);
		res.status(400).json({ is_success: false, msg: `Something Went Wrong` });
	}
});

// * exams here
router.post('/exam/add', async (req, res) => {

	const { title, form_link, courseId, is_active } = req.body;

	console.log(req.body);

	try {
		const exam = await prisma.exams.create({
			data: {
				exam_name: title,
				google_form_link: form_link,
				course_detailsId: courseId,
				is_active: is_active
			},

			include: {
				course_details: {
					select: {
						title: true,
					}
				}
			}
		});

		console.log(exam);

		return res.status(200).json({ is_success: true, msg: `Exam Created`, data: exam });
	} catch (err) {
		console.error(err);
		return res.status(409).json({ is_success: false, msg: `Cannot create exam`, error: err });
	}

});

module.exports = router;
