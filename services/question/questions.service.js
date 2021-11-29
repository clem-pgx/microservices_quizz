"use strict";

const DbMixin = require("../../mixins/db.mixin");
const {ObjectId} = require("mongodb");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "questions",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [DbMixin("api-question", "questions")],

	/**
	 * Settings
	 */
	settings: {
		// Available fields in the responses
		fields: [
			"_id",
			"content",
			"category_id",
			"difficulty"
		],

		populates: {
			"category_id": {
				action: "categories.get",
				params: {
					fields: ["name"]
				}
			}
		},

		// Validator for the `create` & `insert` actions.
		entityValidator: {
			content: "string|min:3",
			difficulty: "number|positive|max:3"
		}
	},

	/**
	 * Action Hooks
	 */
	hooks: {
		before: {
			/**
			 * Register a before hook for the `create` action.
			 * It sets a default value for the quantity field.
			 *
			 * @param {Context} ctx
			 */
			create(ctx) {
				ctx.params.quantity = 0;
			}
		}
	},

	/**
	 * Actions
	 */
	actions: {
		/**
		 * The "moleculer-db" mixin registers the following actions:
		 *  - list
		 *  - find
		 *  - count
		 *  - create
		 *  - insert
		 *  - update
		 *  - remove
		 */

		// --- ADDITIONAL ACTIONS ---

		nextQuestion: {
			rest: "GET /nextQuestion",
			async handler(ctx) {

				// Get random question
				let questions;
				try {
					questions = await this.adapter.find({
						query: {
							difficulty: parseInt(ctx.params.difficulty, 10),
							category_id: ObjectId(ctx.params.category_id)
						}
					})

				} catch (e) {
					throw Error('Cannot find questions')
				}

				const nextQuestion = questions[Math.floor(Math.random() * questions.length)];

				// Populate answers

				let answers;

				try {
					answers = ctx.call('answers.find', {query: {question_id: nextQuestion._id}});
				} catch (e) {
					throw Error(e.message)
				}

				return answers;
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

		}
	},

	/**
	 * Fired after database connection establishing.
	 */
	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	}
};
