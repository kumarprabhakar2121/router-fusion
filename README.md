# router-fusion

Dynamically fuses routes from JavaScript and TypeScript files into an Express application.

## Installation

```bash
npm install router-fusion
```

## Usage

```javascript
const express = require("express");
const { fuseRoutes } = require("router-fusion");

const app = express();

// Add your middleware, configurations, etc.

// Fuse routes into the Express application
fuseRoutes({
  app,
  // Optional: Exclude files and folders
  excludeFilter: "path/to/exclude folder1 folder2 file1.js",
  // Optional: Set the base path for the project (defaults to the current working directory)
  projectPath: __dirname,
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
  - `projectPath` (string, optional): The base path for the project. If not provided, it defaults to the current working directory.

#### Example

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

Feel free to contribute by submitting issues or pull requests on the [GitHub repository](https://github.com/yourusername/router-fusion).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.