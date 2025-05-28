import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");

async function fixImports(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      await fixImports(filePath); // Recurse into subdirectories
    } else if (file.name.endsWith(".js")) {
      let content = await fs.readFile(filePath, "utf8");
      console.log(`Processing: ${filePath}`);

      // Store original content for comparison
      const originalContent = content;

      // Add .js extension to local imports/exports
      content = content.replace(
        /(from\s+['"])(\.\/|\.\.\/)([^'"]+)(['"])/g,
        (match, prefix, relativePath, moduleName, suffix) => {
          // Only add .js if the moduleName doesn't end with .js
          if (!moduleName.endsWith(".js")) {
            console.log(
              `Updating import in ${filePath}: ${moduleName} -> ${moduleName}.js`
            );
            return `${prefix}${relativePath}${moduleName}.js${suffix}`;
          } else {
            console.log(
              `Skipping import in ${filePath}: ${moduleName} (already ends with .js)`
            );
          }
          return match;
        }
      );

      // Log if content changed
      if (content !== originalContent) {
        console.log(`Changes applied to: ${filePath}`);
        await fs.writeFile(filePath, content, "utf8");
      } else {
        console.log(`No changes needed for: ${filePath}`);
      }
    }
  }
}

async function main() {
  try {
    await fixImports(distDir);
    console.log("Successfully fixed imports with .js extensions");
  } catch (error) {
    console.error("Error fixing imports:", error);
    process.exit(1);
  }
}

main();
