import {
  Project,
  SyntaxKind,
  ParameterDeclaration,
  ObjectBindingPattern,
} from "ts-morph";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

function getInferredType(paramName: string): string {
  const name = paramName.toLowerCase();
  if (name === "id" || name.endsWith("id")) return "string | number";
  if (
    name.startsWith("is") ||
    name.startsWith("has") ||
    name.startsWith("should")
  )
    return "boolean";
  if (name === "e" || name === "event") return "any"; // Avoid 'any', but SyntheticEvent is hard to auto-import safely, we'll use unknown later if needed
  if (name === "params" || name === "payload" || name === "data")
    return "Record<string, unknown>";
  if (name === "children") return "React.ReactNode";
  return "unknown";
}

function inferTypeForBindingPattern(pattern: ObjectBindingPattern): string {
  const elements = pattern.getElements();
  const typeProps = elements.map((el) => {
    const nameNode = el.getNameNode();
    const name = nameNode.getText();
    const type = getInferredType(name);
    return `${name}?: ${type}`;
  });
  return `{ ${typeProps.join("; ")} }`;
}

project.getSourceFiles().forEach((sourceFile) => {
  console.log(`Processing: ${sourceFile.getFilePath()}`);

  // Find all functions, arrow functions, methods
  const callables = [
    ...sourceFile.getFunctions(),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration),
  ];

  callables.forEach((callable) => {
    callable.getParameters().forEach((param) => {
      if (!param.getTypeNode()) {
        const nameNode = param.getNameNode();
        if (nameNode.getKind() === SyntaxKind.ObjectBindingPattern) {
          const typeStr = inferTypeForBindingPattern(
            nameNode as ObjectBindingPattern
          );
          param.setType(typeStr);
        } else if (nameNode.getKind() === SyntaxKind.Identifier) {
          param.setType(getInferredType(nameNode.getText()));
        } else {
          param.setType("unknown");
        }
      }
    });
  });

  // Specifically target React Function Components to use React.FC
  const varDecls = sourceFile.getVariableDeclarations();
  varDecls.forEach((decl) => {
    const initializer = decl.getInitializer();
    if (initializer && initializer.getKind() === SyntaxKind.ArrowFunction) {
      const name = decl.getName();
      // If it starts with uppercase, likely a component
      if (/^[A-Z]/.test(name)) {
        if (!decl.getTypeNode()) {
          // If the arrow function returns JSX, it's a component
          const returnsJsx =
            initializer.getDescendantsOfKind(SyntaxKind.JsxElement).length >
              0 ||
            initializer.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
              .length > 0 ||
            initializer.getDescendantsOfKind(SyntaxKind.JsxFragment).length > 0;
          if (returnsJsx) {
            // We won't strictly enforce React.FC right now if it breaks things, but let's just make sure props are typed
          }
        }
      }
    }
  });
});

project.saveSync();
console.log("Codemod complete.");
