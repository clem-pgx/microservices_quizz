"use strict";

const DbMixin = require("../../mixins/db.mixin");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "games",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [DbMixin("api-game", "games")],

	/**
	 * Settings
	 */
	settings: {
		// Available fields in the responses
		fields: [
			"_id",
			"user_id",
			"time",
			"score",
			"created_at",
			"nb_questions",
			"difficulty",
			"category_id"
		],

		// Validator for the `create` & `insert` actions.
		entityValidator: {
			time: "number|positive",
			nb_questions: "number|positive",
			difficulty: "number|positive|max:3"
		}
	},

	/**
	 * Action Hooks
	 */
	hooks: {},

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
		async startGame(ctx) {
			let fistQuestion;
			try {
				await this.broker.call('questions.get', {})
			} catch (e) {

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
				{nb_questions: 10, difficulty: 2, created_at: new Date()},
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
