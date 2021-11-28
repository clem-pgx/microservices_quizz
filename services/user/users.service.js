const { MoleculerClientError } = require("moleculer").Errors;

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
		fields: ["_id", "username", "email", "token"],

		/** Validator schema for entity */
		entityValidator: {
			username: { type: "string"},
			email: { type: "email" },
			password: { type: "string", min: 6 },
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
				user: { type: "object" }
			},
			rest: "POST /register",
			async handler(ctx) {
				let entity = ctx.params.user;
				await this.validateEntity(entity);
				if (entity.email) {
					const found = await this.adapter.findOne({ email: entity.email });
					if (found)
						return Promise.reject(
							new MoleculerClientError("Email exists!", 422, "Email exists!", [{ field: "email", message: "Email exists"}])
						);
				}
				password = bcrypt.hashSync(entity.password, 10);
				entity.password = password;
				entity.createdAt = new Date();
				const token = jwt.sign(
					{ user_id: entity._id},
					process.env.JWT_SECRET,
					{
					  expiresIn: "2h",
				});
				// save user token
				entity.token = token;

				const doc = await this.adapter.insert(entity);
				const user = await this.transformDocuments(ctx, {}, doc);
				return this.entityChanged("created", user, ctx).then(() => user);
			}
		},

		login: {
			params: {
				user: { type: "object" }
			},
			rest: "POST /login",
			async handler(ctx) {
				let entity = ctx.params.user;
				await this.validateEntity(entity);
				if (entity.email) {
					const found = await this.adapter.findOne({ email: entity.email });
					if (found) {
						if (await bcrypt.compareSync(found.password, entity.password)) {
							// Create token
							const token = jwt.sign(
								{ user_id: entity._id},
								process.env.JWT_SECRET,
								{
								  expiresIn: "2h",
							});
							// save user token
							entity.token = token;
							// user
							const doc = await this.adapter.insert(entity);
							const user = await this.transformDocuments(ctx, {}, doc);
							return this.entityChanged("updated", user, ctx).then(() => user);
						}
					}
				}
				return Promise.reject(
					new MoleculerClientError("Login failed", 422, "Login failed", [{ field: "email", message: "id's are incorrect"}])
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
				{ username: "admin", email: "admin@gmail.com" },
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
