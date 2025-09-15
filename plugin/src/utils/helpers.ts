import { type ImportResult } from '.';
import { createContext } from '../../tests/fixtures/create-context';
import { loadConfigAndCreateContextSync } from './loadConfigAndCreateContextSync';
import {
  isCallExpression,
  isIdentifier,
  isImportDeclaration,
  isImportSpecifier,
  isJSXAttribute,
  isJSXExpressionContainer,
  isJSXIdentifier,
  isJSXMemberExpression,
  isJSXOpeningElement,
  isLiteral,
  isMemberExpression,
  isTemplateLiteral,
  isVariableDeclarator,
  type Node,
} from './nodes';
import { findConfig } from '@pandacss/config';
import { resolveTsPathPattern } from '@pandacss/config/ts-path';
import { type PandaContext } from '@pandacss/node';
import { analyze } from '@typescript-eslint/scope-manager';
import { type TSESTree } from '@typescript-eslint/utils';
import { type RuleContext } from '@typescript-eslint/utils/ts-eslint';
import path from 'path';

type Options = {
  configPath?: string;
  currentFile: string;
};

const contextCache: { [configPath: string]: PandaContext } = {};

export type DeprecatedToken =
  | string
  | {
      category: string;
      value: string;
    };

const getPandaContext = (options: Options) => {
  if (process.env.NODE_ENV === 'test') {
    const context = createContext() as unknown as PandaContext;
    context.getFiles = () => ['App.tsx'];
    return context;
  } else {
    const configPath = findConfig({
      cwd: options.configPath ?? options.currentFile,
    });

    // The context cache ensures we don't reload the same config multiple times
    if (!contextCache[configPath]) {
      contextCache[configPath] = _getPandaContext(configPath);
    }

    return contextCache[configPath];
  }
};

const _getPandaContext = (configPath: string | undefined) => {
  if (!configPath) {
    throw new Error('Invalid config path');
  }

  const cwd = path.dirname(configPath);

  const context = loadConfigAndCreateContextSync({ configPath, cwd });
  return context;
};

export const getAncestor = <N extends Node>(
  ofType: (node: Node) => node is N,
  for_: Node,
): N | undefined => {
  let current: Node | undefined = for_.parent;
  while (current) {
    if (ofType(current)) {
      return current;
    }

    current = current.parent;
  }
};

const getSyncOptions = (context: RuleContext<any, any>) => {
  return {
    configPath: context.settings['@pandacss/configPath'] as string | undefined,
    currentFile: context.filename,
  };
};

export const getImportSpecifiers = (context: RuleContext<any, any>) => {
  const specifiers: Array<{
    mod: string;
    specifier: TSESTree.ImportSpecifier;
  }> = [];

  for (const node of context.sourceCode?.ast.body) {
    if (!isImportDeclaration(node)) {
      continue;
    }

    const module_ = node.source.value;
    if (!module_) {
      continue;
    }

    for (const specifier of node.specifiers) {
      if (!isImportSpecifier(specifier)) {
        continue;
      }

      specifiers.push({ mod: module_, specifier });
    }
  }

  return specifiers;
};

export const hasPkgImport = (context: RuleContext<any, any>) => {
  const imports = _getImports(context);
  return imports.some(({ mod }) => mod === '@pandacss/dev');
};

export const isPandaConfigFunction = (
  context: RuleContext<any, any>,
  name: string,
) => {
  const imports = _getImports(context);
  return imports.some(
    ({ alias, mod }) => alias === name && mod === '@pandacss/dev',
  );
};

const _getImports = (context: RuleContext<any, any>) => {
  const specifiers = getImportSpecifiers(context);

  const imports: ImportResult[] = specifiers.map(({ mod, specifier }) => ({
    alias: specifier.local.name,
    mod,
    name: (specifier.imported as any).name,
  }));

  return imports;
};

// Caching imports per context to avoid redundant computations
const importsCache = new WeakMap<RuleContext<any, any>, ImportResult[]>();

const getImports = (context: RuleContext<any, any>) => {
  if (importsCache.has(context)) {
    return importsCache.get(context)!;
  }

  const imports = _getImports(context);
  const filteredImports = imports.filter((imp) =>
    matchImports(getPandaContext(getSyncOptions(context)), imp),
  );
  importsCache.set(context, filteredImports);
  return filteredImports;
};

const isValidStyledProperty = <T extends Node>(
  node: T,
  context: RuleContext<any, any>,
) => {
  return isJSXIdentifier(node) && isValidProperty(node.name, context);
};

const matchFile = (
  pandaContext: PandaContext,
  name: string,
  imports: ImportResult[],
) => {
  const file = pandaContext.imports.file(imports);

  return file.match(name);
};

type MatchImportResult = {
  alias: string;
  mod: string;
  name: string;
};

const matchImports = (
  pandaContext: PandaContext,
  result: MatchImportResult,
) => {
  return pandaContext.imports.match(result, (module_) => {
    const { tsOptions } = pandaContext.parserOptions;
    if (!tsOptions?.pathMappings) {
      return;
    }

    return resolveTsPathPattern(tsOptions.pathMappings, module_);
  });
};

const isPandaIsh = (name: string, context: RuleContext<any, any>) => {
  const imports = getImports(context);
  if (imports.length === 0) {
    return false;
  }

  return matchFile(getPandaContext(getSyncOptions(context)), name, imports);
};

const findDeclaration = (name: string, context: RuleContext<any, any>) => {
  try {
    const source = context.sourceCode;

    if (!source) {
      console.warn(
        "⚠️ ESLint's sourceCode is not available. Ensure that the rule is invoked with valid code.",
      );
      return undefined;
    }

    const scope = analyze(source.ast, {
      sourceType: 'module',
    });
    const decl = scope.variables
      .find((v) => v.name === name)
      ?.defs.find((d) => isIdentifier(d.name) && d.name.name === name)?.node;
    if (isVariableDeclarator(decl)) {
      return decl;
    }
  } catch (error) {
    console.error('Error in findDeclaration:', error);
    return undefined;
  }
};

const isLocalStyledFactory = (
  node: TSESTree.JSXOpeningElement,
  context: RuleContext<any, any>,
) => {
  if (!isJSXIdentifier(node.name)) {
    return;
  }

  const decl = findDeclaration(node.name.name, context);

  if (!decl) {
    return;
  }

  if (!isCallExpression(decl.init)) {
    return;
  }

  if (!isIdentifier(decl.init.callee)) {
    return;
  }

  // Check if the callee is 'styled' from panda imports
  const calleeName = decl.init.callee.name;
  const rawImports = _getImports(context);
  const isStyledImport = rawImports.some(
    (imp) => imp.alias === calleeName && imp.mod.includes('panda'),
  );

  if (!isStyledImport && !isPandaIsh(calleeName, context)) {
    return;
  }

  return true;
};

const arePathsEqual = (path1: string, path2: string) => {
  const normalizedPath1 = path.resolve(path1);
  const normalizedPath2 = path.resolve(path2);

  return normalizedPath1 === normalizedPath2;
};

export const isValidFile = (context: RuleContext<any, any>) => {
  const pandaContext = getPandaContext(getSyncOptions(context));

  return pandaContext
    .getFiles()
    .some((file) => arePathsEqual(file, context.filename));
};

export const isValidProperty = (
  name: string,
  context: RuleContext<any, any>,
  calleeName?: string,
) => {
  const pandaContext = getPandaContext(getSyncOptions(context));

  if (pandaContext.isValidProperty(name)) {
    return true;
  }

  if (!calleeName) {
    return;
  }

  const pattern = pandaContext.patterns.details.find(
    (p) => p.baseName === calleeName || p.jsx.includes(calleeName),
  )?.config.properties;
  if (!pattern) {
    return;
  }

  return Object.keys(pattern).includes(name);
};

export const isPandaImport = (
  node: TSESTree.ImportDeclaration,
  context: RuleContext<any, any>,
) => {
  const imports = getImports(context);
  return imports.some((imp) => imp.mod === node.source.value);
};

export const isPandaProp = (
  node: TSESTree.JSXAttribute,
  context: RuleContext<any, any>,
) => {
  const jsxAncestor = getAncestor(isJSXOpeningElement, node);

  if (!jsxAncestor) {
    return;
  }

  // <styled.div /> && <Box />
  if (
    !isJSXMemberExpression(jsxAncestor.name) &&
    !isJSXIdentifier(jsxAncestor.name)
  ) {
    return;
  }

  let isPandaComponent = false;
  let componentName: string | undefined;

  if (isJSXMemberExpression(jsxAncestor.name)) {
    // For <styled.div>, check if 'styled' is a Panda import
    const objectName = (jsxAncestor.name.object as any).name;
    componentName = objectName;
    // Check if 'styled' is imported from panda - check both filtered and raw imports
    const imports = getImports(context);
    const rawImports = _getImports(context);
    isPandaComponent =
      imports.some((imp) => imp.alias === objectName) ||
      rawImports.some(
        (imp) => imp.alias === objectName && imp.mod.includes('panda'),
      ) ||
      isPandaIsh(objectName, context);

    // For styled.div, all props are valid styled props
    if (isPandaComponent) {
      return true;
    }
  } else if (isJSXIdentifier(jsxAncestor.name)) {
    // For <Circle> or <PandaComp>
    componentName = jsxAncestor.name.name;

    // Check if it's a local styled factory (e.g., const PandaComp = styled(div))
    const isLocalStyled = isLocalStyledFactory(jsxAncestor, context);

    // For local styled components, we need to check if the prop is a valid Panda prop
    if (isLocalStyled) {
      const property = node.name.name;
      // Special props like 'css' and props starting with '_' are Panda props
      if (
        property === 'css' ||
        (typeof property === 'string' && property.startsWith('_'))
      ) {
        return true;
      }

      // Other props need to be valid style properties
      if (typeof property !== 'string' || !isValidProperty(property, context)) {
        return false;
      }

      return true;
    }

    // For imported Panda components like Circle
    isPandaComponent = isPandaIsh(componentName, context);
  }

  if (!isPandaComponent) {
    return;
  }

  const property = node.name.name;
  // Ensure prop is a styled prop
  if (
    typeof property !== 'string' ||
    !isValidProperty(property, context, componentName)
  ) {
    return;
  }

  return true;
};

export const isStyledProperty = (
  node: TSESTree.Property,
  context: RuleContext<any, any>,
  calleeName?: string,
) => {
  if (
    !isIdentifier(node.key) &&
    !isLiteral(node.key) &&
    !isTemplateLiteral(node.key)
  ) {
    return;
  }

  if (
    isIdentifier(node.key) &&
    !isValidProperty(node.key.name, context, calleeName)
  ) {
    return;
  }

  if (
    isLiteral(node.key) &&
    typeof node.key.value === 'string' &&
    !isValidProperty(node.key.value, context, calleeName)
  ) {
    return;
  }

  if (
    isTemplateLiteral(node.key) &&
    !isValidProperty(node.key.quasis[0].value.raw, context, calleeName)
  ) {
    return;
  }

  return true;
};

export const isInPandaFunction = (
  node: TSESTree.Property,
  context: RuleContext<any, any>,
) => {
  const callAncestor = getAncestor(isCallExpression, node);
  if (!callAncestor) {
    return;
  }

  let calleeName: string | undefined;

  // E.g. css({...}), cvs({...})
  if (isIdentifier(callAncestor.callee)) {
    calleeName = callAncestor.callee.name;
  }

  // E.g. css.raw({...})
  if (
    isMemberExpression(callAncestor.callee) &&
    isIdentifier(callAncestor.callee.object)
  ) {
    calleeName = callAncestor.callee.object.name;
  }

  if (!calleeName) {
    return;
  }

  if (!isPandaIsh(calleeName, context)) {
    return;
  }

  return calleeName;
};

export const isInJSXProp = (
  node: TSESTree.Property,
  context: RuleContext<any, any>,
) => {
  const jsxExprAncestor = getAncestor(isJSXExpressionContainer, node);
  const jsxAttributeAncestor = getAncestor(isJSXAttribute, node);

  if (!jsxExprAncestor || !jsxAttributeAncestor) {
    return;
  }

  // Get the JSX element to check if it's a Panda component
  const jsxElement = getAncestor(isJSXOpeningElement, jsxAttributeAncestor);
  if (!jsxElement) {
    return;
  }

  // Check if it's a Panda component (styled.div, Circle, etc.)
  let isPandaComponent = false;
  if (isJSXMemberExpression(jsxElement.name)) {
    // For <styled.div>, check if 'styled' is a Panda import
    const objectName = (jsxElement.name.object as any).name;
    isPandaComponent = isPandaIsh(objectName, context);
  } else if (isJSXIdentifier(jsxElement.name)) {
    // For <Circle> or <PandaComp>
    const componentName = jsxElement.name.name;
    isPandaComponent =
      isPandaIsh(componentName, context) ||
      Boolean(isLocalStyledFactory(jsxElement, context));
  }

  if (!isPandaComponent) {
    return;
  }

  // Check if the attribute name is a valid styled prop
  if (!isJSXIdentifier(jsxAttributeAncestor.name)) {
    return;
  }

  if (!isValidStyledProperty(jsxAttributeAncestor.name, context)) {
    return;
  }

  return true;
};

export const isPandaAttribute = (
  node: TSESTree.Property,
  context: RuleContext<any, any>,
) => {
  const callAncestor = getAncestor(isCallExpression, node);

  if (callAncestor) {
    const callee = isInPandaFunction(node, context);
    if (!callee) {
      return;
    }

    return isStyledProperty(node, context, callee);
  }

  // Object could be in JSX prop value i.e css prop or a pseudo
  return isInJSXProp(node, context) && isStyledProperty(node, context);
};

export const resolveLonghand = (
  name: string,
  context: RuleContext<any, any>,
) => {
  const pandaContext = getPandaContext(getSyncOptions(context));

  const reverseShorthandsMap = new Map();

  for (const [key, values] of pandaContext.utility.getPropShorthandsMap()) {
    for (const value of values) {
      reverseShorthandsMap.set(value, key);
    }
  }

  return reverseShorthandsMap.get(name);
};

export const resolveShorthands = (
  name: string,
  context: RuleContext<any, any>,
) => {
  const pandaContext = getPandaContext(getSyncOptions(context));

  return pandaContext.utility.getPropShorthandsMap().get(name);
};

export const isColorAttribute = (
  attribute: string,
  context: RuleContext<any, any>,
) => {
  return getPropertyCategory(context, attribute) === 'colors';
};

export const isColorToken = (
  value: string | undefined,
  context: RuleContext<any, any>,
) => {
  if (!value) {
    return;
  }

  const pandaContext = getPandaContext(getSyncOptions(context));

  return Boolean(
    pandaContext.utility.tokens.view.categoryMap.get('colors')?.get(value),
  );
};

export const extractTokens = (value: string) => {
  const regex = /token\(([^"'(),]+)(?:,\s*([^"'(),]+))?\)|\{([^\n\r{}]+)\}/g;
  const matches = [];
  let match;

  while ((match = regex.exec(value)) !== null) {
    const tokenFromFirstSyntax = match[1] || match[2] || match[3];
    const tokensFromSecondSyntax =
      match[4] && match[4].match(/(\w+\.\w+(\.\w+)?)/g);

    if (tokenFromFirstSyntax) {
      matches.push(tokenFromFirstSyntax);
    }

    if (tokensFromSecondSyntax) {
      matches.push(...tokensFromSecondSyntax);
    }
  }

  return matches.filter(Boolean);
};

// Caching invalid tokens to avoid redundant computations
const invalidTokensCache = new Map<string, string[]>();

const filterInvalidTokens = (
  pandaContext: PandaContext,
  paths: string[],
): string[] => {
  return paths.filter((path) => !pandaContext.utility.tokens.view.get(path));
};

export const getInvalidTokens = (
  value: string,
  context: RuleContext<any, any>,
) => {
  if (invalidTokensCache.has(value)) {
    return invalidTokensCache.get(value)!;
  }

  const tokens = extractTokens(value);
  if (!tokens.length) {
    return [];
  }

  const pandaContext = getPandaContext(getSyncOptions(context));

  const invalidTokens = filterInvalidTokens(pandaContext, tokens);

  invalidTokensCache.set(value, invalidTokens);
  return invalidTokens;
};

// Caching deprecated tokens to avoid redundant computations
const deprecatedTokensCache = new Map<string, DeprecatedToken[]>();

const filterDeprecatedTokens = (
  pandaContext: PandaContext,
  tokens: DeprecatedToken[],
): DeprecatedToken[] => {
  return tokens.filter((token) => {
    const value =
      typeof token === 'string' ? token : token.category + '.' + token.value;
    return pandaContext.utility.tokens.isDeprecated(value);
  });
};

const getPropertyCategory = (
  context: RuleContext<any, any>,
  _attribute: string,
) => {
  const pandaContext = getPandaContext(getSyncOptions(context));

  const longhand = resolveLonghand(_attribute, context);
  const attribute = longhand || _attribute;
  const attributeConfig = pandaContext.utility.config[attribute];
  return typeof attributeConfig?.values === 'string'
    ? attributeConfig.values
    : undefined;
};

export const getDeprecatedTokens = (
  property: string,
  value: string,
  context: RuleContext<any, any>,
) => {
  const pandaContext = getPandaContext(getSyncOptions(context));

  const propertyCategory = getPropertyCategory(context, property);

  const tokens = extractTokens(value);

  if (!propertyCategory && !tokens.length) {
    return [];
  }

  const values = tokens.length
    ? tokens
    : [{ category: propertyCategory, value: value.split('/')[0] }];

  if (deprecatedTokensCache.has(value)) {
    return deprecatedTokensCache.get(value)!;
  }

  // @ts-expect-error TODO
  const deprecatedTokens = filterDeprecatedTokens(pandaContext, values);

  deprecatedTokensCache.set(value, deprecatedTokens);

  return deprecatedTokens;
};

export const getTokenImport = (context: RuleContext<any, any>) => {
  const imports = _getImports(context);
  return imports.find((imp) => imp.name === 'token');
};

export const getTaggedTemplateCaller = (
  node: TSESTree.TaggedTemplateExpression,
) => {
  // css``
  if (isIdentifier(node.tag)) {
    return node.tag.name;
  }

  // styled.h1``
  if (isMemberExpression(node.tag)) {
    if (!isIdentifier(node.tag.object)) {
      return;
    }

    return node.tag.object.name;
  }

  // styled(Comp)``
  if (isCallExpression(node.tag)) {
    if (!isIdentifier(node.tag.callee)) {
      return;
    }

    return node.tag.callee.name;
  }
};

export const isStyledTaggedTemplate = (
  node: TSESTree.TaggedTemplateExpression,
  context: RuleContext<any, any>,
) => {
  const caller = getTaggedTemplateCaller(node);
  if (!caller) {
    return false;
  }

  // Check if 'styled' is imported from panda
  const rawImports = _getImports(context);
  const isStyledImport = rawImports.some(
    (imp) => imp.alias === caller && imp.mod.includes('panda'),
  );

  return isStyledImport || isPandaIsh(caller, context);
};

export function isRecipeVariant(
  node: TSESTree.Property,
  context: RuleContext<any, any>,
) {
  const caller = isInPandaFunction(node, context);
  if (!caller) {
    return;
  }

  // Check if the caller is either 'cva' or 'sva'
  const recipe = getImports(context).find(
    (imp) => ['cva', 'sva'].includes(imp.name) && imp.alias === caller,
  );
  if (!recipe) {
    return;
  }

  //* Nesting is different here because of slots and variants. We don't want to warn about those.
  let currentNode: any = node;
  let length = 0;
  let styleObjectParent: null | string = null;

  // Traverse up the AST
  while (currentNode) {
    const keyName = currentNode?.key?.name;
    if (keyName && ['base', 'variants'].includes(keyName)) {
      styleObjectParent = keyName;
    }

    currentNode = currentNode.parent;
    if (!styleObjectParent) {
      length++;
    }
  }

  // Determine the required length based on caller and styleObjectParent
  const isCvaCaller = caller === 'cva';
  const requiredLength = isCvaCaller ? 2 : 4;
  const extraLength = styleObjectParent === 'base' ? 0 : 4;

  if (length < requiredLength + extraLength) {
    return true;
  }
}
