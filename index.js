const { isExpressRouter } = require("express-routes-extractor");
const { promises: fs } = require("fs");
const path = require("path");

const DEFAULT_EXCLUDE_FOLDERS = ["node_modules", ".git"];

/**
 * Dynamically fuses routes from JavaScript and TypeScript files into an Express application.
 *
 * @param {object} options - Options for fusing routes.
 * @param {Express.Application} options.app - The Express application to which routes will be added.
 * @param {string} [options.excludeFilter] - A space-separated string containing files and folders to be excluded.
 * @param {string} [options.projectPath] - The base path for the project. If not provided, it defaults to the current working directory.
 * @throws Will throw an error if there's an issue reading directories or fusing routes.
 */
async function fuseRoutes({ app, excludeFilter = '', projectPath }) {
    try {
        // Get the calling file path
        const callingFilePath = module.parent?.path || projectPath;

        // Filter files and folders based on the excludeFilter
        const { files: exFiles, folders: exFolders } = filterFileAndFolder(excludeFilter);
        const allExcludedFolders = [...DEFAULT_EXCLUDE_FOLDERS, ...exFolders];

        // Get all JavaScript and TypeScript files
        const files = await getAllJsTsFiles(callingFilePath, allExcludedFolders, exFiles);

        // Iterate over files and add Express routers to the app
        for (const file of files) {
            const routerModule = require(file);
            if (isExpressRouter(routerModule)) {
                app.use(routerModule);
            }
        }
    } catch (error) {
        /**
         * Throws an error if there's an issue reading directories or fusing routes.
         *
         * @throws Will throw an error if there's an issue reading directories or fusing routes.
         */
        console.error("Error fusing routes to application:", error);
        throw error;
    }
}

/**
 * Recursively retrieves all JavaScript and TypeScript files in a directory.
 *
 * @param {string} directoryPath - The path of the directory to start the search.
 * @param {string[]} [excludeFolders] - An array of folder names to be excluded.
 * @param {string[]} [excludeFiles] - An array of file names to be excluded.
 * @returns {Promise<string[]>} An array of file paths for JavaScript and TypeScript files.
 * @throws Will throw an error if there's an issue reading directories.
 */
async function getAllJsTsFiles(directoryPath, excludeFolders = DEFAULT_EXCLUDE_FOLDERS, excludeFiles = []) {
    try {
        const files = await fs.readdir(directoryPath);
        let jsTsFiles = [];

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const stats = await fs.stat(filePath);

            if (stats.isDirectory() && !excludeFolders.includes(file)) {
                const subdirectoryJsTsFiles = await getAllJsTsFiles(filePath, excludeFolders, excludeFiles);
                jsTsFiles.push(...subdirectoryJsTsFiles);
            } else if ((file.endsWith(".js") || file.endsWith(".ts")) && !excludeFiles.includes(file)) {
                jsTsFiles.push(filePath);
            }
        }

        return jsTsFiles;
    } catch (error) {
        /**
         * Throws an error if there's an issue reading directories.
         *
         * @throws Will throw an error if there's an issue reading directories.
         */
        console.error("Error reading directory:", error);
        throw error;
    }
}

/**
 * Separates file and folder names from the provided string.
 *
 * @param {string} str - A space-separated string containing file and folder names.
 * @returns {{files: string[], folders: string[]}} An object with arrays of file and folder names.
 */
function filterFileAndFolder(str) {
    const arr = str.split(" ");
    const files = arr.filter((elem) => elem.includes(".js") || elem.includes(".ts"));
    const folders = arr.filter((elem) => !files.includes(elem));
    return { files, folders };
}

module.exports = {
    fuseRoutes
};

