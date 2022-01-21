const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

// * MODEL
const Course = require('../../models/course');

// * Prisma
const prisma = require('../../helper/prisma');

// * get all public course
router.get('/', async (req, res) => {

	try {
		const allPublicCourses = await prisma.course_details.findMany({
			where: { is_active: true },
			orderBy: [
				{
					created_at: 'desc'
				}
			],
			select: { id: true, description: true, title: true, thumbnail: true, price: true, tags: true },
			take: 5
		});
		res.json(allPublicCourses);
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
			select: { id: true, description: true, title: true, thumbnail: true, price: true, tags: true },
		});
		res.status(200).json(courses);
		console.log(courses);
	} catch (err) {
		res.status(400).json(`Error Occur in ${err}`);
	}
	res.end();
})

// * get particular course
router.get('/:course_id', async (req, res) => {

	const course_id = req.params.course_id;

	try {
		const course = await prisma.course_details.findFirst({
			where: { is_active: true, id: course_id },
			select: {
				id: true, tags: true, description: true, thumbnail: true, title: true, price: true
			}
		});
		res.status(200).json(course);
	} catch (err) {
		res.status(400).json(`Error Occur in ${err}`);
	}
	res.end();
});

// * create course
router.post('/add', isLoggedIn, isAdmin, async (req, res) => {

	const { title, slug, description, thumbnail, price, duration, requirement, is_active, adminId } = req.body;

	// * validate data

	// * check course already exists

	// * saving it in db
	const courseData = {
		title: title,
		slug: slug,
		description: description,
		thumbnail: thumbnail,
		price: price,
		duration: duration || "",
		requirement: requirement || "",
		is_active: is_active,
		adminId: adminId
	};

	try {
		const newCourse = await prisma.course_details.create({
			data: courseData,
		});
		res.json({
			msg: `Course Created\nID: ${newCourse.id}`
		});
	} catch (err) {
		res.status(400).json(`Error Occur ${err}`);
	}

	res.end();
});

// * edit course
router.put('/update/:course_id', isLoggedIn, isAdmin, async (req, res) => {

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
		price: price,
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
			data: courseData
		});
		res.json({
			msg: "Course Updated",
			"Course ID": updatedCourse.id
		});
	} catch (err) {
		res.status(400).json(`Error Occur ${err}`);
	}

	res.end();
});

// * delete course
router.delete('/remove/:course_id', isLoggedIn, isAdmin, async (req, res) => {
	const { course_id } = req.params;

	if (!course_id) return res.status(400).json({ msg: "Please provide valid course id" });

	// * check course exists or not
	const course = await Course.findOne({ _id: course_id }).lean();
	if (!course) return res.status(400).json({ "msg": "Course Not Found" });

	try {
		const deletedCourse = await Course.deleteOne({ _id: course_id });
		res.status(200).json(deletedCourse);
	} catch (err) {
		res.status(400).json(err);
	}
});

module.exports = router;
