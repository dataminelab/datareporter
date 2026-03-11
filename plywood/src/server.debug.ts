// this is for debugging purposes only
import Module from "module";
import path from "path";

const originalLoad = (Module as any)._load;
const debugPlywoodBundle = path.resolve(__dirname, "../client/build/plywood.debug.js");

// In debug mode, route `reporter-plywood` imports to the sourcemapped debug bundle.
(Module as any)._load = function (request: string, parent: any, isMain: boolean) {
  if (request === "reporter-plywood") {
    return originalLoad.call(this, debugPlywoodBundle, parent, isMain);
  }

  return originalLoad.call(this, request, parent, isMain);
};

import app from "./app";

const port = process.env.PORT || 3000;

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:" + port);
});
