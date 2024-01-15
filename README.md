# router-fusion

Dynamically fuses routes from JavaScript and TypeScript files into an Express application.

## Installation

```bash
npm install router-fusion
```

## Usage

### CommonJS Syntax

```javascript
const express = require("express");
const { fuseRoutes } = require("router-fusion");

const app = express();

// Fuse routes into the Express application
fuseRoutes({
  app,
  // Optional: Exclude files and folders
  excludeFilter: "path/to/exclude folder1 folder2 file1.js",
  // Optional: Set the base path for the project (defaults to the current working directory)
  projectPath: __dirname,
  // Experimental: Include the "/help" route (defaults to false)
  // read more below
  helpRoute: true,
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### ES6 Syntax

```javascript
import express from "express";
import { fuseRoutes } from "router-fusion";

const app = express();

// Fuse routes into the Express application
fuseRoutes({
  app,
  // Optional: Exclude files and folders
  excludeFilter: "path/to/exclude folder1 folder2 file1.js",
  // Required in ES6: Set the base path for the project (defaults to the current working directory)
  projectPath: import.meta.dirname,
  // Experimental: Include the "/help" route (defaults to false)
  // read more below
  helpRoute: false,
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

## Experimental Feature: "/help" Route

The package includes an experimental feature that allows you to include a "/help" route in your Express application. This route provides a JSON representation of the integrated Express routes, making it convenient for developers to understand the available endpoints. Note that this feature is experimental and may not work as expected if your project has a global middleware for authentication. In such cases, it is recommended to evaluate its compatibility with your specific authentication setup.

```javascript
const express = require("express");
const { fuseRoutes } = require("router-fusion");

const app = express();

// Fuse routes into the Express application with the "/help" route (experimental)
fuseRoutes({
  app,
  helpRoute: true,
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

## API

### `fuseRoutes(options)`

Dynamically fuses routes from JavaScript and TypeScript files into an Express application.

#### Parameters

- `options` (object):
  - `app` (Express.Application): The Express application to which routes will be added.
  - `excludeFilter` (string, optional): A space-separated string containing files and folders to be excluded.
  - `projectPath` (string, optional for commonjs & required for ES6): The base path for the project. If not provided, it defaults to the current working directory.
  - `helpRoute` (boolean, optional): Experimental - Whether to include the "/help" route. Defaults to false.

#### Example

#### CommonJS Syntax

```javascript
const express = require("express");
const { fuseRoutes } = require("router-fusion");

const app = express();

// Fuse routes into the Express application (only app provided)
fuseRoutes({ app });

// Fuse routes into the Express application with additional options
fuseRoutes({
  app,
  excludeFilter: "path/to/exclude folder1 folder2 file1.js",
  projectPath: __dirname,
  helpRoute: true,
});
```

#### ES6 Syntax

```javascript
import express from "express";
import { fuseRoutes } from "router-fusion";

const app = express();

// Fuse routes into the Express application with additional options
fuseRoutes({
  app,
  excludeFilter: "path/to/exclude folder1 folder2 file1.js",
  projectPath: import.meta.dirname,
  helpRoute: true,
});
```

### Error Handling

The module throws an error if there's an issue reading directories or fusing routes. Make sure to handle errors appropriately in your application.

```javascript
try {
  fuseRoutes({ app });
} catch (error) {
  console.error("Error fusing routes to application:", error);
  // Handle the error as needed
}
```

## Contributing

Feel free to contribute by submitting issues or pull requests on the [GitHub repository](https://github.com/kumarprabhakar2121/router-fusion).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.