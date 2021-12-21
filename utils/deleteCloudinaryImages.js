const pool = require("../config/dbConfig.js");
const { cloudinary } = require("../config/cloudinary.js");

/**
 * Delete the files by passing the
 * public IDs in a list as parameter
 */
const delete_images_files = async (publicIdsToDelete) => {
	try {
		if (publicIdsToDelete.length >= 1) {
			const res = await cloudinary.api.delete_resources(publicIdsToDelete);
			console.log(res.deleted);
		} else {
			return console.log("No files were deleted");
		}
	} catch (error) {
		console.log(error);
	}
};

/**
 * Retrieve image urls with
 * flag = 0 and substring to
 * get the images' public_ids
 */
const deleteCloudImagesCronJob = () => {
	pool.getConnection((err, connection) => {
		if (err) throw err;
		console.log(`connection as id ${connection.threadId}`);

		let title = "Cron Job Testing Working Well for Deleting Images";
		let query = "SELECT progressImage FROM progress_book_entry WHERE flag = 3";
		connection.query(query, title, (err, rows) => {
			connection.release();
			if (!err) {
				const publicImageIdsToDelete = rows.map((obj) => {
					return obj.progressImage.substring(
						obj.progressImage.indexOf("patients"),
						obj.progressImage.lastIndexOf(".")
					);
				});

				delete_images_files(publicImageIdsToDelete);
			} else {
				console.log(err);
			}
		});
	});
};

module.exports = { deleteCloudImagesCronJob };
