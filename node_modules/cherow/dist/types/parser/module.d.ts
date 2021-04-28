import * as ESTree from '../estree';
import { Parser } from '../types';
import { parseStatementListItem, parseDirective } from './statements';
import { parseDecorators } from './expressions';
import { Context } from '../utilities';
/**
 * Parse module item list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ModuleItemList)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseModuleItemList(parser: Parser, context: Context): (ReturnType<typeof parseDirective | typeof parseModuleItem>)[];
/**
 * Parse module item
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ModuleItem)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseModuleItem(parser: Parser, context: Context): ReturnType<typeof parseDecorators | typeof parseExportDeclaration | typeof parseImportDeclaration | typeof parseStatementListItem>;
/**
 * Parse export declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ExportDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseExportDeclaration(parser: Parser, context: Context): ESTree.ExportAllDeclaration | ESTree.ExportNamedDeclaration | ESTree.ExportDefaultDeclaration;
/**
 * Parse import declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ImportDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseImportDeclaration(parser: Parser, context: Context): ESTree.ImportDeclaration;
