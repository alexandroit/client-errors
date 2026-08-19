import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const declarationFiles = ["index.d.ts", "index.d.cts"];

function withoutTypeModifier(specifier) {
  return ts.factory.updateExportSpecifier(
    specifier,
    false,
    specifier.propertyName,
    specifier.name
  );
}

function splitInlineTypeExports(statement) {
  if (
    !ts.isExportDeclaration(statement) ||
    !statement.exportClause ||
    !ts.isNamedExports(statement.exportClause)
  ) {
    return [statement];
  }

  const typeSpecifiers = statement.exportClause.elements.filter((specifier) => specifier.isTypeOnly);
  const valueSpecifiers = statement.exportClause.elements.filter((specifier) => !specifier.isTypeOnly);

  if (typeSpecifiers.length === 0 || valueSpecifiers.length === 0) {
    return [statement];
  }

  const createExport = (isTypeOnly, specifiers) =>
    ts.factory.createExportDeclaration(
      statement.modifiers,
      isTypeOnly,
      ts.factory.createNamedExports(specifiers.map(withoutTypeModifier)),
      statement.moduleSpecifier,
      statement.attributes
    );

  return [createExport(false, valueSpecifiers), createExport(true, typeSpecifiers)];
}

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

await Promise.all(
  declarationFiles.map(async (fileName) => {
    const filePath = path.join(rootDir, "dist", fileName);
    const sourceText = await fs.readFile(filePath, "utf8");
    const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true);
    const statements = sourceFile.statements.flatMap(splitInlineTypeExports);
    const normalized = printer.printFile(ts.factory.updateSourceFile(sourceFile, statements));

    await fs.writeFile(filePath, normalized, "utf8");
  })
);
