"use strict";

const DbMixin = require("../../mixins/db.mixin");
const {ObjectId} = require("mongodb");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "answers",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [DbMixin("api-question", "answers")],

	/**
	 * Settings
	 */
	settings: {
		// Available fields in the responses
		fields: [
			"_id",
			"name",
			"is_correct",
			"question_id"
		],

		populates: {
			"question_id": "questions.get"
		},

		// Validator for the `create` & `insert` actions.
		entityValidator: {
			name: "string|min:3",
			is_correct: "boolean"
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

		checkAnswer: {
			auth: "required",
			rest: "POST /checkAnswer",
			async handler(ctx) {
				// Get random question
				let answer;
				try {
					answer = await this.adapter.findOne({ _id: ObjectId(ctx.params.answer_id) })

				} catch (e) {
					throw Error("bad answer")
				}

				let game;
				try {
					game = await this.broker.call("games.get", { id: ctx.params.game_id })

				} catch (e) {
					throw Error("bad game")
				}

				if(answer.is_correct){
					try {
						await this.broker.call("games.update", { id: ctx.params.game_id, score: game.score + 1})
					} catch (e) {
						throw Error(game)
					}
				}

				return answer.is_correct;
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
				{name: "Answer 1 ?", quantity: 10, price: 704},
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
