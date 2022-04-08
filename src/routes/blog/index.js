const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

// * Prisma
const prisma = require('../../helper/prisma');

/**
 * @desc Get All Blog
 */
router.get('/', async (req, res) => {

	if (req.session.user && req.session.user.role === 'instructor') {
		let instructor_id = req.session.user.id;

		try {
			const allBlogs = await prisma.blog.findMany({
				where: {
					adminId: instructor_id
				},
				include: {
					admin: {
						select: {
							name: true
						}
					}
				}
			});
			return res.status(200).json({ msg: `All Blogs`, data: allBlogs });
		} catch (err) {
			console.log(err.message);
			return res.status(409).json({ error: `Something went wrong` });
		}

	}

	try {
		const allBlogs = await prisma.blog.findMany({
			include: {
				admin: {
					select: {
						name: true
					}
				}
			}
		});
		return res.status(200).json({ msg: `All Blogs`, data: allBlogs });
	} catch (err) {
		console.log(err.message);
		return res.status(409).json({ error: `Something went wrong` });
	}
});

/**
 * @desc Get Single Blog
 */
router.get('/:blog_id', async (req, res) => {

	const { blog_id } = req.params || null;

	try {
		const blog = await prisma.blog.findUnique({ where: { id: blog_id } });
		return res.status(200).json({ is_success: true, msg: `Blog found`, data: blog });
	} catch (err) {
		console.log(err.message);
		return res.status(409).json({ is_success: true, error: `Something went wrong` });
	}
});


/**
 * @desc Create new Blog
 */
router.post('/add', isLoggedIn, isAdmin, async (req, res) => {

	const { title, slug, body, thumbnail, tags, is_active, adminId } = req.body;


	// * check weather blog with same slug exists
	const slugExists = await prisma.blog.count({ where: { slug: { contains: slug } } });
	if (slugExists) return res.status(409).json({ error: `blog with slug already exists\ntry different slug` });

	// * create blog
	const blog = {
		title,
		slug,
		body,
		thumbnail: thumbnail,
		tags,
		is_active: is_active || true,
		adminId
	};
	console.log(blog);

	try {
		const newBlog = await prisma.blog.create({ data: blog });
		console.log(newBlog);
		res.status(200).json({ is_success: true, msg: `New Blog Created`, data: newBlog });
	} catch (err) {
		console.error(`Error Occur ${err}`);
		if (err.code === "P2002") {
			return res.status(409).json({ is_success: false, msg: `Blog Already Exists with same title or slug`, error: `Course Already Exists with same title or slug` });
		}
		res.status(400).json({ is_success: false, msg: `Error Occurred`, error: err });
	}
});

/**
 * @desc Edit Blog
 */
router.put('/edit/:blog_id', isLoggedIn, isAdmin, async (req, res) => {

	const { blog_id } = req.params || 0;

	const { title, slug, content, thumbnail, tags, is_active, author_id } = req.body;

	// * create blog
	const blog = {
		title,
		slug,
		body: content,
		thumbnail,
		tags,
		is_active: is_active,
		adminId: author_id
	};

	try {
		const updatedBlog = await prisma.blog.update({ data: blog, where: { id: blog_id } });
		res.status(200).json({ is_success: true, msg: `Blog Updated`, data: updatedBlog });
	} catch (err) {
		console.error(`Error Occur ${err}`);
		if (err.code === "P2002") {
			return res.status(409).json({ is_success: false, msg: `Blog Already Exists with same title or slug`, error: `Course Already Exists with same title or slug` });
		}
		res.status(400).json({ is_success: false, msg: `Error Occurred`, error: err });
	}

});

/**
 * @desc Delete Blog
 */
router.delete('/delete/:blog_id', isLoggedIn, isAdmin, async (req, res) => {

	const { blog_id } = req.params || 0;

	// * delete blog
	try {
		const deletedBlog = await prisma.blog.delete({ where: { id: blog_id } });
		return res.status(200).json({ msg: `blog deleted` });
	} catch (err) {
		console.log(err.message);
		return res.status(409).json({ error: `Something went wrong` });
	}

});

module.exports = router;
