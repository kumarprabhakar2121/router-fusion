const { isExpressRouter, extractExpressRoutes } = require("express-routes-extractor");
const { promises: fs } = require("fs");
const path = require("path");

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
 * @param {string} [options.projectPath] - The base path for the project. If not provided, it defaults to the current working directory.
 * @param {boolean} [options.helpRoute=false] - Experimental: Whether to include the "/help" route. Defaults to false.
 * @throws {Error} Will throw an error if there's an issue reading directories or fusing routes.
 */
async function fuseRoutes({ app, excludeFilter = '', projectPath, helpRoute = false }) {
    try {
        // Get the calling file path
        const callingFilePath = projectPath || module.parent?.path;

        // Filter files and folders based on the excludeFilter
        const { files: exFiles, folders: exFolders } = filterFileAndFolder(excludeFilter);
        const allExcludedFolders = [...DEFAULT_EXCLUDE_FOLDERS, ...exFolders];

        // Get all JavaScript and TypeScript files
        const files = await getAllJsTsFiles(callingFilePath, allExcludedFolders, exFiles);

        // Iterate over files and add Express routers to the app
        for (const file of files) {
            let routerModule;
            try {
                // Dynamically import the module
                routerModule = require(file);
                if (routerModule) {
                    handleExpressRouter(app, routerModule);
                }
            } catch (error) {
                // Log an error if the module is not a CommonJS module
                /* not cjs module */
            }
        }

        // Add a help route if specified
        if (helpRoute) {
            app.use("/help", function (req, res) {
                // Extract and return the existing Express routes
                const paths = extractExpressRoutes(app);
                res.json(paths);
            });
        }
    } catch (error) {
        // Handle errors during route fusion
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
 * Handles the integration of Express routers into the application.
 *
 * @param {object} app - The Express application.
 * @param {*} routerModule - The module containing Express router(s) to be integrated.
 */
function handleExpressRouter(app, routerModule) {
    /**
     * Checks if the given module has any routes.
     *
     * @param {*} module - The module to check.
     * @returns {boolean} True if the module has routes, false otherwise.
     */
    const haveAnyRoutes = isExpressRouter(routerModule);

    // Check if the module has routes and is a valid Express router
    // check and add logic
    if (haveAnyRoutes && typeof routerModule === 'function' && routerModule.hasOwnProperty('use') && routerModule.hasOwnProperty('handle')) {
        // Most probably the place where express application is initialized
    } else if (haveAnyRoutes && routerModule && typeof routerModule === 'function' && routerModule.hasOwnProperty('stack')) {
        // Add the Express router to the app
        app.use(routerModule);
    } else if (typeof routerModule === 'object') {
        // If the module is an object, iterate over its properties
        for (const key in routerModule) {
            const element = routerModule[key];
            // Check if the property is a valid Express router
            if (typeof element === 'function' && element.hasOwnProperty('stack')) {
                if (isExpressRouter(element)) {
                    try {
                        // Add the Express router to the app
                        app.use(element);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }
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

module.exports = {
    fuseRoutes
};
