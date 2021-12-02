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
			auth: "required",
			rest: "GET /nextQuestion",
			async handler(ctx) {

				let game;
				try {
					game = await ctx.call('games.get', {id: ctx.params.game_id});
				} catch (e) {
					throw Error('Cannot find game')
				}

				let gameQuestions;
				try {
					gameQuestions = await ctx.call('gameQuestions.find', {query: {game_id: ctx.params.game_id}});
				} catch (e) {
					throw Error('Cannot find game question')
				}

				if (gameQuestions.length < game.nb_questions) {
					// Get random question
					let questions;
					try {
						questions = await this.adapter.find({
							query: {
								difficulty: parseInt(game.difficulty, 10),
								category_id: ObjectId(game.category_id)
							}
						})

					} catch (e) {
						throw Error('Cannot find questions')
					}

					const questionIds = gameQuestions.map(gq => gq.question_id);
					const questionsFiltered = questions.filter(q => !questionIds.includes(q._id.toString()));
					const nextQuestion = questionsFiltered[Math.floor(Math.random() * questionsFiltered.length)];

					// Populate answers

					let answers;

					try {
						answers = await ctx.call('answers.find', {
							query: {question_id: nextQuestion._id},
							fields: ["_id", "name", "question_id"]
						});
					} catch (e) {
						throw Error(e.message)
					}

					try {
						await ctx.call('gameQuestions.create', {
							game_id: ctx.params.game_id,
							question_id: nextQuestion._id
						});
					} catch (e) {
						throw Error(e.message)
					}

					return {gameId: game._id, nextQuestion, answers};
				} else {
					return "end game";
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

		}
	},

	/**
	 * Fired after database connection establishing.
	 */
	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	}
};
