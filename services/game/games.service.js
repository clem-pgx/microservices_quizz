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

		startGame: {
			auth: "required",
			rest: "POST /startGame",
			async handler(ctx) {
				try {
					const newGame = await this.adapter.insert({
						user_id: ctx.params.user_id,
						time: 0,
						score: 0,
						created_at: new Date(),
						nb_questions: ctx.params.nb_questions,
						difficulty: ctx.params.difficulty,
						category_id: ctx.params.category_id
					})

					return await ctx.call('questions.nextQuestion', {game_id: newGame._id})

				} catch (e) {
					return false
				}
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
