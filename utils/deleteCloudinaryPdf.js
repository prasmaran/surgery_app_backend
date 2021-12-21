const { cloudinary } = require('../config/cloudinary.js')

/**
 * Retrieving the files from the 
 * specific folder and list down the oublic IDs 
 */
const retrieve_public_ids = new Promise((resolve, reject) => {

    cloudinary.api.resources(
        {
            type: 'upload',
            prefix: 'wound_pdf'
        },
        (error, result) => {
            if (error) {
                reject(error);
            } else {
                const ids = result.resources
                const publicIdsToDelete = ids.map((obj) => {
                    return obj.public_id
                })
                //console.log(`PDFs to be deleted from Cloudinary: ${publicIdsToDelete.length}`);
                resolve(publicIdsToDelete)
            }
        })
})

/**
 * Delete the files by passing the 
 * public IDs in a list as parameter
 */
const delete_pdf_files = async (publicIdsToDelete) => {
    try {
        if (publicIdsToDelete.length >= 1) {
            const res = await cloudinary.api.delete_resources(publicIdsToDelete)
            console.log(res.deleted);
        } else {
            return console.log("No files were deleted");
        }

    } catch (error) {
        console.log(error);
    }
}

const delete_cloudinary_pdf = () => {
    retrieve_public_ids
    .then((res) => {
        delete_pdf_files(res)
    })
    .catch((err) => console.error(err))
}


module.exports = { delete_cloudinary_pdf }


// retrieve_public_ids
//     .then((res) => {
//         delete_pdf_files(res)
//     })
//     .catch((err) => console.error(err))

