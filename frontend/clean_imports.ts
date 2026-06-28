import { Project } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles();

for (const sourceFile of sourceFiles) {
  sourceFile.fixUnusedIdentifiers();
}

project.saveSync();
console.log("Cleaned up unused imports.");
