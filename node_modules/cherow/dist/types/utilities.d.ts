import * as ESTree from './estree';
import { Errors } from './errors';
import { Parser, Location } from './types';
import { Token } from './token';
export declare enum Context {
    Empty = 0,
    OptionsNext = 1,
    OptionsRanges = 2,
    OptionsJSX = 4,
    OptionsRaw = 8,
    OptionsLoc = 16,
    OptionsGlobalReturn = 32,
    OptionsComments = 64,
    OptionsShebang = 128,
    OptionsRawidentifiers = 256,
    OptionsTolerant = 512,
    OptionsNode = 1024,
    OptionsExperimental = 2048,
    Strict = 4096,
    Module = 8192,
    TaggedTemplate = 16384,
    InClass = 32768,
    AllowIn = 65536,
    Async = 131072,
    Yield = 262144,
    InParameter = 524288,
    InFunctionBody = 1048576,
    AllowSingleStatement = 2097152,
    BlockScope = 4194304,
    ForStatement = 8388608,
    RequireIdentifier = 16777216,
    Method = 33554432,
    AllowSuperProperty = 67108864,
    InParen = 134217728,
    InJSXChild = 268435456,
    DisallowEscapedKeyword = 536870912,
    AllowDecorator = 1073741824,
    LocationTracker = 18
}
export declare enum Flags {
    None = 0,
    NewLine = 1,
    AllowBinding = 2,
    AllowDestructuring = 4,
    SimpleParameterList = 8,
    InSwitchStatement = 16,
    InIterationStatement = 32,
    HasStrictReserved = 64,
    HasOctal = 128,
    SimpleAssignmentTarget = 256,
    HasProtoField = 512,
    StrictFunctionName = 1024,
    StrictEvalArguments = 2048,
    InFunctionBody = 4096,
    HasAwait = 8192,
    HasYield = 16384,
    EscapedKeyword = 32768,
    HasConstructor = 65536
}
export declare enum Labels {
    None = 0,
    NotNested = 1,
    Nested = 2
}
export declare enum NumericState {
    None = 0,
    SeenSeparator = 1,
    EigthOrNine = 2,
    Float = 4,
    BigInt = 8
}
export declare enum ScannerState {
    None = 0,
    NewLine = 1,
    LastIsCR = 2
}
export declare enum ModifierState {
    None = 0,
    Generator = 1,
    Await = 2
}
export declare enum CoverParenthesizedState {
    None = 0,
    SequenceExpression = 1,
    HasEvalOrArguments = 2,
    HasReservedWords = 4,
    HasYield = 8,
    HasBinding = 16
}
export declare enum Escape {
    Empty = -1,
    StrictOctal = -2,
    EightOrNine = -3,
    InvalidHex = -4,
    OutOfRange = -5
}
export declare enum RegexFlags {
    Empty = 0,
    IgnoreCase = 1,
    Global = 2,
    Multiline = 4,
    Unicode = 8,
    Sticky = 16,
    DotAll = 32
}
export declare enum CoverCallState {
    Empty = 0,
    SeenSpread = 1,
    HasSpread = 2,
    SimpleParameter = 4,
    EvalOrArguments = 8,
    Yield = 16,
    Await = 32
}
export declare enum RegexState {
    Empty = 0,
    Escape = 1,
    Class = 2
}
export declare enum ObjectState {
    None = 0,
    Async = 1,
    Generator = 2,
    Getter = 4,
    Setter = 8,
    Computed = 16,
    Method = 32,
    Shorthand = 64,
    Static = 128,
    Constructor = 256,
    Heritage = 512
}
/**
 * Validate break and continue statement
 *
 * @param parser Parser object
 * @param label label
 * @param isContinue true if validation continue statement
 */
export declare function validateBreakOrContinueLabel(parser: Parser, context: Context, label: string, isContinue: boolean): void;
/**
 * Add label to the stack
 *
 * @param parser Parser object
 * @param label label
 */
export declare function addLabel(parser: Parser, label: string): void;
/**
 * Remove label from the stack
 *
 * @param parser Parser object
 * @param label label
 */
export declare function popLabel(parser: Parser, label: string): void;
/**
 * Returns either true or false. Depends if the label exist.
 *
 * @param parser Parser object
 * @param label Label
 */
export declare function hasLabel(parser: Parser, label: string): Labels;
/**
 * Finish each the node for each parse. Set line / and column on the node if the
 * options are set for it
 *
 * @param parser Parser object
 * @param context Context masks
 * @param meta Line / column
 * @param node AST node
 */
export declare function finishNode<T extends ESTree.Node>(context: Context, parser: Parser, meta: Location, node: any): T;
/**
 * Consumes the next token. If the consumed token is not of the expected type
 * then report an error and return null. Otherwise return true.
 *
 * @param parser Parser object
 * @param context Context masks
 * @param t Token
 * @param Err Optionally error message to be thrown
 */
export declare function expect(parser: Parser, context: Context, token: Token, err?: Errors): boolean;
/**
 * If the next token matches the given token, this consumes the token
 * and returns true. Otherwise return false.
 *
 * @param parser Parser object
 * @param context Context masks
 * @param t Token
 */
export declare function consume(parser: Parser, context: Context, token: Token): boolean;
/**
 * Advance and return the next token in the stream
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function nextToken(parser: Parser, context: Context): Token;
export declare const hasBit: (mask: number, flags: number) => boolean;
/**
 * Automatic Semicolon Insertion
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-automatic-semicolon-insertion)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function consumeSemicolon(parser: Parser, context: Context): void | boolean;
/**
 * Bit fiddle current grammar state and keep track of the state during the parse and restore
 * it back to original state after finish parsing or throw.
 *
 * Ideas for this is basicly from V8 and SM, but also the Esprima parser does this in a similar way.
 *
 * However this implementation is an major improvement over similiar implementations, and
 * does not require additonal bitmasks to be set / unset during the parsing outside this function.
 *
 * @param parser Parser state
 * @param context Context mask
 * @param callback Callback function
 * @param errMsg Optional error message
 */
export declare function parseExpressionCoverGrammar<T>(parser: Parser, context: Context, callback: (parser: Parser, context: Context) => T): T;
/**
 * Restor current grammar to previous state, or unset necessary bitmasks
 *
 * @param parser Parser state
 * @param context Context mask
 * @param callback Callback function
 */
export declare function restoreExpressionCoverGrammar<T>(parser: Parser, context: Context, callback: (parser: Parser, context: Context) => T): T;
/**
 * Set / unset yield / await context masks based on the
 * ModifierState masks before invoking the callback and
 * returning it's content
 *
 * @param parser Parser object
 * @param context Context masks
 * @param state Modifier state
 * @param callback Callback function to be invoked
 * @param methodState Optional Objectstate.
 */
export declare function swapContext<T>(parser: Parser, context: Context, state: ModifierState, callback: (parser: Parser, context: Context, state: ObjectState) => T, methodState?: ObjectState): T;
/**
 * Validates function params
 *
 * Note! In case anyone want to enable full scoping, replace 'paramSet' with an similiar
 * object on the parser object itself. Then push / set the tokenValue to
 * it an use an bitmask to mark it as an 'variable' not 'blockscope'. Then when
 * implementing lexical scoping, you can use that for validation.
 *
 * @param parser  Parser object
 * @param context Context masks
 * @param params Array of token values
 */
export declare function validateParams(parser: Parser, context: Context, params: string[]): void;
/**
 * Reinterpret various expressions as pattern
 * This is only used for assignment and arrow parameter list
 *
 * @param parser  Parser object
 * @param context Context masks
 * @param node AST node
 */
export declare const reinterpret: (parser: Parser, context: Context, node: any) => void;
/**
 * Does a lookahead.
 *
 * @param parser Parser object
 * @param context  Context masks
 * @param callback Callback function to be invoked
 */
export declare function lookahead<T>(parser: Parser, context: Context, callback: (parser: Parser, context: Context) => T): T;
/**
 * Returns true if this an valid simple assignment target
 *
 * @param parser Parser object
 * @param context  Context masks
 */
export declare function isValidSimpleAssignmentTarget(node: ESTree.Node): boolean;
/**
 * Get current node location
 *
 * @param parser Parser object
 * @param context  Context masks
 */
export declare function getLocation(parser: Parser): Location;
/**
 * Returns true if this is an valid identifier
 *
 * @param context  Context masks
 * @param t  Token
 */
export declare function isValidIdentifier(context: Context, t: Token): boolean;
/**
 * Returns true if this an valid lexical binding and not an identifier
 *
 * @param parser Parser object
 * @param context  Context masks
 */
export declare function isLexical(parser: Parser, context: Context): boolean;
/**
 * Returns true if this is end of case or default clauses
 *
 * @param parser Parser object
 */
export declare function isEndOfCaseOrDefaultClauses(parser: Parser): boolean;
/**
 * Validates if the next token in the stream is a left paren or a period
 *
 * @param parser Parser object
 * @param context  Context masks
 */
export declare function nextTokenIsLeftParenOrPeriod(parser: Parser, context: Context): boolean;
/**
 * Validates if the next token in the stream is a identifier or left paren
 *
 * @param parser Parser object
 * @param context  Context masks
 */
export declare function nextTokenisIdentifierOrParen(parser: Parser, context: Context): boolean | number;
/**
 * Validates if the next token in the stream is left parenthesis.
 *
 * @param parser Parser object
 * @param context  Context masks
 */
export declare function nextTokenIsLeftParen(parser: Parser, context: Context): boolean;
/**
 * Validates if the next token in the stream is a function keyword on the same line.
 *
 * @param parser Parser object
 * @param context  Context masks
 */
export declare function nextTokenIsFuncKeywordOnSameLine(parser: Parser, context: Context): boolean;
/**
 * Checks if the property has any private field key
 *
 * @param parser Parser object
 * @param context  Context masks
 */
export declare function isPropertyWithPrivateFieldKey(expr: any): boolean;
/**
 * Parse and classify itendifier - similar method as in V8
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseAndClassifyIdentifier(parser: Parser, context: Context): any;
export declare function nameIsArgumentsOrEval(value: string): boolean;
/**
 * Records an error from current position. If we report an error later, we'll do it from
 * this position.
 *
 * @param parser Parser object
 */
export declare function setPendingError(parser: Parser): void;
/**
 * Returns tagName for JSX element
 *
 * @param elementName JSX Element name
 */
export declare function isEqualTagNames(elementName: ESTree.JSXNamespacedName | ESTree.JSXIdentifier | ESTree.JSXMemberExpression): string;
/**
 * Returns true if this is an instance field ( stage 3 proposal)
 *
 * @param parser Parser object
 */
export declare function isInstanceField(parser: Parser): boolean;
/**
 *
 * @param parser Parser object
 * @param context Context masks
 * @param expr  AST expressions
 * @param prefix prefix
 */
export declare function validateUpdateExpression(parser: Parser, context: Context, expr: ESTree.Expression, prefix: string): void;
/**
 * Record expression error
 *
 * @param parser Parser object
 * @param error Error message
 */
export declare function setPendingExpressionError(parser: Parser, type: Errors): void;
/**
 * Validate coer parenthesized expression
 *
 * @param parser Parser object
 * @param state CoverParenthesizedState
 */
export declare function validateCoverParenthesizedExpression(parser: Parser, state: CoverParenthesizedState): CoverParenthesizedState;
/**
 * Validate coer parenthesized expression
 *
 * @param parser Parser object
 * @param state CoverParenthesizedState
 */
export declare function validateAsyncArgumentList(parser: Parser, context: Context, state: CoverCallState): CoverCallState;
/**
 * Returns true if in or of token. Otherwise return false,
 *
 * @param t Token
 */
export declare function isInOrOf(t: Token): boolean;
