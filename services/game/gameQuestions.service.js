"use strict";

const DbMixin = require("../../mixins/db.mixin");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "gameQuestions",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [DbMixin("api-game", "gameQuestions")],

	/**
	 * Settings
	 */
	settings: {
		// Available fields in the responses
		fields: [
			"_id",
			"game_id",
			"question_id"
		],

		populates: {
			"game_id": "games.get",
			"question_id": "question.get",
		},

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
	},

	/**
	 * Methods
	 */
	methods: {},

	/**
	 * Fired after database connection establishing.
	 */
	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	}
};
