import { extractExpressRoutes, isExpressRouter } from "express-routes-extractor";
import { promises as fs } from "fs";
import path from "path";

/**
 * Default folders to be excluded when fusing routes.
 * @type {string[]}
 */
const DEFAULT_EXCLUDE_FOLDERS = ["node_modules", ".git"];

/**
 * Dynamically fuses routes from JavaScript and TypeScript files into an Express application.
 *
 * @param {object} options - Options for fusing routes.
 * @param {Express.Application} options.app - The Express application to which routes will be added.
 * @param {string} [options.excludeFilter] - A space-separated string containing files and folders to be excluded.
 * @param {string} [projectPath] - The base path for the project. If not provided, it defaults to the current working directory.
 * @param {boolean} [options.helpRoute=false] Experimental:- Whether to include the "/help" route. Defaults to false.
 * @throws {Error} Will throw an error if there's an issue reading directories or fusing routes.
 */
async function fuseRoutes({ app, excludeFilter = '', projectPath, helpRoute = false }) {
    try {
        if(!app || !projectPath){
            console.error('"app" and "projectPath" are required fields for method "fuseRoutes"');
        }
        // Filter files and folders based on the excludeFilter
        const { files: exFiles, folders: exFolders } = filterFileAndFolder(excludeFilter);
        const allExcludedFolders = [...DEFAULT_EXCLUDE_FOLDERS, ...exFolders];

        // Get all JavaScript and TypeScript files
        const files = await getAllJsTsFiles(projectPath, allExcludedFolders, exFiles);
        // Iterate over files and add Express routers to the app
        for (const file of files) {
            try {
                let routerModule;
                try {
                    routerModule = await import(file);
                } catch (error) {
                    /* not an ESM module, skipping this */
                }
                const defaultModule = routerModule?.default;
                if (routerModule && isExpressRouter(defaultModule)) {
                    try {
                        app.use(defaultModule);
                    } catch (error) {
                        console.error(error);
                    }
                } else if (isExpressRouter(routerModule)) {
                    try {
                        app.use(routerModule);
                    } catch (error) {
                        console.error(error);
                    }
                }
            } catch (importError) {
                console.error(`Error importing router from file ${file}:`, importError);
            }
        }
        if (helpRoute) {
            app.use("/help", function (req, res) {
                const paths = extractExpressRoutes(app);
                res.json(paths);
            });
        }
    } catch (error) {
        /**
         * Throws an error if there's an issue reading directories or fusing routes.
         *
         * @throws {Error} Will throw an error if there's an issue reading directories or fusing routes.
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
 * @throws {Error} Will throw an error if there's an issue reading directories.
 */
async function getAllJsTsFiles(directoryPath, excludeFolders = DEFAULT_EXCLUDE_FOLDERS, excludeFiles = []) {
    try {
        const files = await fs.readdir(directoryPath);
        let jsTsFiles = [];

        for (const file of files) {
            try {
                const filePath = path.join(directoryPath, file);
                const stats = await fs.stat(filePath);

                if (stats.isDirectory() && !excludeFolders.includes(file)) {
                    const subdirectoryJsTsFiles = await getAllJsTsFiles(filePath, excludeFolders, excludeFiles);
                    jsTsFiles.push(...subdirectoryJsTsFiles);
                } else if ((file.endsWith(".js") || file.endsWith(".ts")) && !excludeFiles.includes(file)) {
                    jsTsFiles.push(filePath);
                }
            } catch (fileError) {
                console.error(`Error processing file ${file}:`, fileError);
            }
        }

        return jsTsFiles;
    } catch (error) {
        /**
         * Throws an error if there's an issue reading directories.
         *
         * @throws {Error} Will throw an error if there's an issue reading directories.
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

export { fuseRoutes };
