"use strict";

const DbMixin = require("../../mixins/db.mixin");
const data = require("../../data/italie.json");
const {ObjectId} = require("mongodb");

module.exports = {
	name: "categories",

	/**
	 * Mixins
	 */
	mixins: [DbMixin("api-question", "categories")],

	/**
	 * Settings
	 */
	settings: {
		// Available fields in the responses
		fields: [
			"_id",
			"name"
		],

		// Validator for the `create` & `insert` actions.
		entityValidator: {
			name: "string|min:3"
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
	methods: {
		/**
		 * Loading sample data to the collection.
		 * It is called in the DB.mixin after the database
		 * connection establishing & the collection is empty.
		 */
		async seedDB() {
			const data = require('../../data/italie.json');

			const category = await this.adapter.insert(
				{name: "Italie"}
			);



			for (const question of data.quizz.fr.débutant) {

				const createdQuestion = await this.broker.call('questions.create', {
					content: question.question,
					difficulty: 1,
					category_id: category._id
				})

				const answers = question.propositions.map(a => ({
					name: a,
					is_correct: question.réponse === a,
					question_id: ObjectId(createdQuestion._id)
				}))

				for (const answer of answers) {
					await this.broker.call('answers.create', answer);
				}


			}

		}
	},

	/**
	 * Fired after database connection establishing.
	 */
	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	}
};
