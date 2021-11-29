const {MoleculerClientError} = require("moleculer").Errors;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const DbService = require("../../mixins/db.mixin");

module.exports = {
	name: "users",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [
		DbService("api-users", "user")
	],

	/**
	 * Default settings
	 */
	settings: {
		/** Secret for JWT */
		JWT_SECRET: process.env.JWT_SECRET || "jwt-secret",

		/** Public fields */
		fields: ["_id", "username", "email"],

		/** Validator schema for entity */
		entityValidator: {
			username: {type: "string"},
			email: {type: "email"},
			password: {type: "string", min: 6},
		}
	},

	/**
	 * Actions
	 */
	actions: {
		/**
		 * Register a new user
		 *
		 * @actions
		 * @param {Object} user - User entity
		 *
		 * @returns {Object} Created entity & token
		 */
		register: {
			params: {
				user: {type: "object"}
			},
			async handler(ctx) {
				let entity = ctx.params.user;
				await this.validateEntity(entity);
				if (entity.email) {
					const found = await this.adapter.findOne({email: entity.email});
					if (found)
						return Promise.reject(
							new MoleculerClientError("Email exists!", 422, "Email exists!", [{
								field: "email",
								message: "Email exists"
							}])
						);
				}
				password = bcrypt.hashSync(entity.password, 10);
				entity.password = password;
				entity.createdAt = new Date();

				const newUser = await this.adapter.insert(entity);

				const token = jwt.sign(
					{user_id: newUser._id},
					process.env.JWT_SECRET,
					{
						expiresIn: "12h",
					});

				return token;
			}
		},

		login: {
			params: {
				user: {type: "object"}
			},
			async handler(ctx) {
				let entity = ctx.params.user;
				if (entity.email && entity.password) {
					const found = await this.adapter.findOne({email: entity.email});
					await this.validateEntity(found);
					if (found) {
						if (await bcrypt.compareSync(entity.password, found.password)) {

							// Create token
							const token = jwt.sign(
								{user_id: found._id},
								process.env.JWT_SECRET,
								{
									expiresIn: "12h",
								});
							// save user token
							// user
							return token;
						}
					} else {
						return Promise.reject(
							new MoleculerClientError("Login failed", 422, "email not found", [{
								field: "email",
								message: "email is incorrect"
							}])
						);
					}
				}
				return Promise.reject(
					new MoleculerClientError("Login failed", 422, "Login failed", [{
						field: "email",
						message: "id's are incorrect"
					}])
				);
			}
		}
	},

	/**
	 * Methods
	 */
	methods: {
		/**
		 * Loading sample data to the collection.
		 * It is called in the DB.mixin after the database
		 * connection establishing & the collection is empty.
		 */
		async seedDB() {
			await this.adapter.insertMany([
				{username: "admin", email: "admin@gmail.com"},
			]);
		}
	},

	/**
	 * Fired after database connection establishing.
	 */
	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	}
};
