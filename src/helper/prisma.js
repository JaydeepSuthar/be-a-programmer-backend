const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
	const chalk = require('chalk');

	/**
	 * Middleware for logging
	 * Time each query took to run
	 */
	prisma.$use(async (params, next) => {
		const before = Date.now();
		const result = await next(params);
		const after = Date.now();

		console.error(chalk.red(`Query ${params.model}.${params.action} took ${after - before}ms`));

		return result;
	});
}


module.exports = prisma;
