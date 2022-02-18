const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

// * Prisma
const prisma = require('../../helper/prisma');

// * get all public course
router.get('/', async (req, res) => {

	try {
		const allPublicCourses = await prisma.course_details.findMany({
			where: { is_active: true },
			include: {
				admin: {
					select: {
						name: true
					}
				}
			}
		});
		res.json(allPublicCourses);
	} catch (err) {
		res.status(400).json(`Error Occur in ${err}`);
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

	// * check course already exists

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
		adminId: '620cc340ed391d5f33f13b6d',
		tags: ['web', 'node', 'js']
	};

	try {
		const newCourse = await prisma.course_details.create({
			data: courseData,
			// select: { id: true, description: true, title: true, thumbnail: true, price: true, tags: true },
		});
		console.log(`Course Created\nID: ${{ newCourse }}`);
		res.json({ is_success: true, msg: `Course Created` });
	} catch (err) {
		// res.status(400).json(`Error Occur ${err}`);
		console.error(`Error Occur ${err}`);
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

router.post('/test', (req, res) => {
	console.log(req.body);
	console.log(req.file);
	res.end();
})

module.exports = router;
