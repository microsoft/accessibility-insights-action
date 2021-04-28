export interface _Node<T extends string> {
    type: T;
    loc?: SourceLocation | null;
    start?: number;
    end?: number;
    errors?: any;
    comments?: any;
    tokens?: any;
    leadingComments?: Comment[];
    trailingComments?: Comment[];
    innerComments?: Comment[];
}
export declare type Specifiers = (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier);
export interface T_Node extends T_Statement, T_Expression, T_Pattern, T_ModuleDeclaration, T_ModuleSpecifier {
    'Program': Program;
    'SwitchCase': SwitchCase;
    'CatchClause': CatchClause;
    'Property': Property | AssignmentProperty;
    'Super': Super;
    'SpreadElement': SpreadElement;
    'TemplateElement': TemplateElement;
    'ClassBody': ClassBody;
    'FieldDefinition ': FieldDefinition;
    'PrivateName': PrivateName;
    'Decorator': Decorator;
    'MethodDefinition': MethodDefinition;
    'VariableDeclarator': VariableDeclarator;
    'JSXIdentifier': JSXIdentifier;
    'JSXMemberExpression': JSXMemberExpression;
    'JSXNamespacedName': JSXNamespacedName;
    'JSXEmptyExpression': JSXEmptyExpression;
    'JSXExpressionContainer': JSXExpressionContainer;
    'JSXSpreadChild': JSXSpreadChild;
    'JSXText': JSXText;
    'JSXOpeningFragment': JSXOpeningFragment;
    'JSXOpeningElement': JSXOpeningElement;
    'JSXClosingFragment': JSXClosingFragment;
    'JSXClosingElement': JSXClosingElement;
    'JSXAttribute': JSXAttribute;
    'JSXSpreadAttribute': JSXSpreadAttribute;
}
export declare type Node = Program | SwitchCase | CatchClause | Statement | Expression | Property | AssignmentProperty | Super | SpreadElement | TemplateElement | ClassBody | FieldDefinition | PrivateName | Decorator | MethodDefinition | ModuleDeclaration | ModuleSpecifier | Pattern | VariableDeclarator | JSXIdentifier | JSXMemberExpression | JSXNamespacedName | JSXEmptyExpression | JSXExpressionContainer | JSXSpreadChild | JSXText | JSXOpeningElement | JSXOpeningFragment | JSXClosingElement | JSXClosingFragment | JSXAttribute | JSXSpreadAttribute;
export interface _Statement<T extends string> extends _Node<T> {
}
export interface T_Statement extends T_Declaration {
    'ExpressionStatement': ExpressionStatement;
    'BlockStatement': BlockStatement;
    'EmptyStatement': EmptyStatement;
    'DebuggerStatement': DebuggerStatement;
    'WithStatement': WithStatement;
    'ReturnStatement': ReturnStatement;
    'LabeledStatement': LabeledStatement;
    'BreakStatement': BreakStatement;
    'ContinueStatement': ContinueStatement;
    'IfStatement': IfStatement;
    'SwitchStatement': SwitchStatement;
    'ThrowStatement': ThrowStatement;
    'TryStatement': TryStatement;
    'WhileStatement': WhileStatement;
    'DoWhileStatement': DoWhileStatement;
    'ForStatement': ForStatement;
    'ForInStatement': ForInStatement;
    'ForOfStatement': ForOfStatement;
}
export declare type Statement = ExpressionStatement | BlockStatement | EmptyStatement | DebuggerStatement | WithStatement | ReturnStatement | LabeledStatement | BreakStatement | ContinueStatement | IfStatement | SwitchStatement | ThrowStatement | TryStatement | WhileStatement | DoWhileStatement | ForStatement | ForInStatement | ForOfStatement | Declaration;
export interface _TypeAnnotation<T extends string> extends _Node<T> {
}
export interface T_TypeAnnotation {
    'Identifier': Identifier;
    'FunctionExpression': FunctionExpression;
    'ObjectPattern': ObjectPattern;
    'ArrayPattern': ArrayPattern;
    'RestElement': RestElement;
}
export declare type TypeAnnotation = Identifier | FunctionExpression | ArrayPattern | ObjectPattern | RestElement;
export interface _Expression<T extends string> extends _Node<T> {
}
export interface T_Expression {
    'Identifier': Identifier;
    'Literal': Literal | RegExpLiteral | BigIntLiteral;
    'BigIntLiteral': Literal;
    'PrivateMemberExpression': PrivateMemberExpression;
    'ThisExpression': ThisExpression;
    'ArrayExpression': ArrayExpression;
    'ObjectExpression': ObjectExpression;
    'FunctionExpression': FunctionExpression;
    'UnaryExpression': UnaryExpression;
    'UpdateExpression': UpdateExpression;
    'BinaryExpression': BinaryExpression;
    'AssignmentExpression': AssignmentExpression;
    'LogicalExpression': LogicalExpression;
    'MemberExpression': MemberExpression;
    'ConditionalExpression': ConditionalExpression;
    'CallExpression': CallExpression;
    'NewExpression': NewExpression;
    'Import': Import;
    'SequenceExpression': SequenceExpression;
    'ArrowFunctionExpression': ArrowFunctionExpression;
    'YieldExpression': YieldExpression;
    'TemplateLiteral': TemplateLiteral;
    'TaggedTemplateExpression': TaggedTemplateExpression;
    'ClassExpression': ClassExpression;
    'MetaProperty': MetaProperty;
    'AwaitExpression': AwaitExpression;
    'JSXElement': JSXElement;
    'JSXFragment': JSXFragment;
}
export declare type Expression = Identifier | Literal | BigIntLiteral | RegExpLiteral | ThisExpression | ArrayExpression | ObjectExpression | FunctionExpression | DoExpression | UnaryExpression | UpdateExpression | BinaryExpression | AssignmentExpression | LogicalExpression | MemberExpression | PrivateName | ConditionalExpression | CallExpression | NewExpression | SequenceExpression | Import | ArrowFunctionExpression | YieldExpression | TemplateLiteral | TaggedTemplateExpression | ClassExpression | MetaProperty | AwaitExpression | JSXElement | JSXFragment;
export interface _Pattern<T extends string> extends _Node<T> {
}
export interface T_Pattern {
    'Identifier': Identifier;
    'ObjectPattern': ObjectPattern;
    'ArrayPattern': ArrayPattern;
    'MemberExpression': MemberExpression;
    'PrivateMemberExpression': PrivateMemberExpression;
    'AssignmentPattern': AssignmentPattern;
    'RestElement': RestElement;
}
export declare type PatternTop = Identifier | ObjectPattern | ArrayPattern | MemberExpression;
export declare type PatternNoRest = PatternTop | AssignmentPattern;
export declare type Pattern = PatternTop | AssignmentPattern | RestElement;
export interface _Declaration<T extends string> extends _Statement<T> {
}
export interface T_Declaration {
    'FunctionDeclaration': FunctionDeclaration;
    'VariableDeclaration': VariableDeclaration;
    'ClassDeclaration': ClassDeclaration;
}
export declare type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration;
export interface _ModuleDeclaration<T extends string> extends _Node<T> {
}
export interface T_ModuleDeclaration {
    'ImportDeclaration': ImportDeclaration;
    'ExportNamedDeclaration': ExportNamedDeclaration;
    'ExportDefaultDeclaration': ExportDefaultDeclaration;
    'ExportAllDeclaration': ExportAllDeclaration;
}
export declare type ModuleDeclaration = ImportDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration | ExportAllDeclaration;
export interface _ModuleSpecifier<T extends string> extends _Node<T> {
    local: Identifier;
}
export interface T_ModuleSpecifier {
    'ImportSpecifier': ImportSpecifier;
    'ImportDefaultSpecifier': ImportDefaultSpecifier;
    'ImportNamespaceSpecifier': ImportNamespaceSpecifier;
    'ExportSpecifier': ExportSpecifier;
}
export declare type ModuleSpecifier = ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier;
export interface SourceLocation {
    start: Position;
    end: Position;
    source?: string;
}
export interface Position {
    /** >= 1 */
    line: number;
    /** >= 0 */
    column: number;
}
export declare type CommentType = 'SingleLine' | 'MultiLine' | 'HTMLClose' | 'HTMLOpen' | 'SheBang';
export interface Comment {
    type: CommentType;
    value: string;
    start?: number | undefined;
    end?: number | undefined;
    loc?: any;
}
/**
* Core types
*/
export interface Program extends _Node<'Program'> {
    sourceType: 'script' | 'module';
    body: (Statement | ModuleDeclaration)[];
}
export interface ArrayExpression extends _Expression<'ArrayExpression'> {
    elements: (Expression | SpreadElement | null)[];
}
export interface ArrayPattern extends _Pattern<'ArrayPattern'> {
    elements: (Pattern | null)[];
    typeAnnotation?: TypeAnnotation | null;
}
export declare type AssignmentOperator = '=' | '+=' | '-=' | '*=' | '/=' | '%=' | '<<=' | '>>=' | '>>>=' | '|=' | '^=' | '&=' | '**=';
export interface AssignmentExpression extends _Expression<'AssignmentExpression'> {
    operator: AssignmentOperator;
    left: Expression | PatternTop;
    right: Expression;
}
export interface AssignmentPattern extends _Pattern<'AssignmentPattern'> {
    left: PatternTop;
    right: Expression;
}
export interface ArrowFunctionExpression extends _Expression<'ArrowFunctionExpression'> {
    id: Identifier | null;
    params: Pattern[];
    body: BlockStatement | Expression;
    expression: boolean;
    async: boolean;
    generator: false;
}
export interface AwaitExpression extends _Expression<'AwaitExpression'> {
    argument: Expression;
}
export declare type BinaryOperator = '==' | '!=' | '===' | '!==' | '<' | '<=' | '>' | '>=' | '<<' | '>>' | '>>>' | '+' | '-' | '*' | '/' | '%' | '|' | '^' | '&' | 'in' | '**' | 'instanceof';
export interface BinaryExpression extends _Expression<'BinaryExpression'> {
    operator: BinaryOperator;
    left: Expression;
    right: Expression;
}
export interface BlockStatement extends _Statement<'BlockStatement'> {
    body: Statement[];
}
export interface BreakStatement extends _Statement<'BreakStatement'> {
    label: Identifier | null;
}
export interface CallExpression extends _Expression<'CallExpression'> {
    callee: Expression | Import | Super;
    arguments: (Expression | SpreadElement)[];
}
export interface CatchClause extends _Node<'CatchClause'> {
    param: PatternTop;
    body: BlockStatement;
}
export interface ClassBody extends _Node<'ClassBody'> {
    body: (MethodDefinition | FieldDefinition)[];
}
export interface PrivateMemberExpression extends _Node<'PrivateMemberExpression '> {
    object: Expression;
    property: PrivateName;
}
export interface FieldDefinition extends _Node<'FieldDefinition '> {
    key: PrivateName | Expression;
    value: Expression | null;
    computed: boolean;
}
export interface ClassDeclaration extends _Declaration<'ClassDeclaration'> {
    id: Identifier | null;
    superClass: Expression | null;
    body: ClassBody;
}
export interface ClassExpression extends _Expression<'ClassExpression'> {
    id: Identifier | null;
    superClass: Expression | null;
    body: ClassBody;
}
export interface MemberExpression extends _Expression<'MemberExpression'> {
    computed: boolean;
    object: Expression | Super;
    property: Expression;
}
export interface ConditionalExpression extends _Expression<'ConditionalExpression'> {
    test: Expression;
    consequent: Expression;
    alternate: Expression;
}
export interface ContinueStatement extends _Statement<'ContinueStatement'> {
    label: Identifier | null;
}
export interface DebuggerStatement extends _Statement<'DebuggerStatement'> {
}
export interface DoWhileStatement extends _Statement<'DoWhileStatement'> {
    body: Statement;
    test: Expression;
}
export interface EmptyStatement extends _Statement<'EmptyStatement'> {
}
export interface ExportAllDeclaration extends _ModuleDeclaration<'ExportAllDeclaration'> {
    source: Literal;
}
export interface ExportDefaultDeclaration extends _ModuleDeclaration<'ExportDefaultDeclaration'> {
    declaration: Declaration | Expression;
}
export interface ExportNamedDeclaration extends _ModuleDeclaration<'ExportNamedDeclaration'> {
    declaration: Declaration | null;
    specifiers: ExportSpecifier[];
    source: Literal | null;
}
export interface ExportSpecifier extends _ModuleSpecifier<'ExportSpecifier'> {
    exported: Identifier;
}
export interface ExpressionStatement extends _Statement<'ExpressionStatement'> {
    expression: Expression;
}
export interface ForInStatement extends _Statement<'ForInStatement'> {
    left: VariableDeclaration | Expression | PatternNoRest;
    right: Expression;
    body: Statement;
}
export interface ForOfStatement extends _Statement<'ForOfStatement'> {
    left: VariableDeclaration | Expression | PatternNoRest;
    right: Expression;
    body: Statement;
    await: boolean;
}
export interface ForStatement extends _Statement<'ForStatement'> {
    init: VariableDeclaration | Expression | null;
    test: Expression | null;
    update: Expression | null;
    body: Statement;
}
export interface FunctionDeclaration extends _Declaration<'FunctionDeclaration'> {
    id: Identifier | null;
    params: Pattern[];
    body: BlockStatement;
    generator: boolean;
    async: boolean;
    expression: false;
    typeAnnotation?: TypeAnnotation | null;
}
export interface FunctionExpression extends _Expression<'FunctionExpression'> {
    id: Identifier | null;
    params: Pattern[];
    body: BlockStatement;
    generator: boolean;
    async: boolean;
    expression: false;
    typeAnnotation?: TypeAnnotation | null;
}
export interface DoExpression extends _Expression<'DoExpression'>, _Pattern<'DoExpression'> {
    body: BlockStatement;
}
export interface Identifier extends _Expression<'Identifier'>, _Pattern<'Identifier'> {
    name: string;
    typeAnnotation?: TypeAnnotation | null;
    raw?: string;
}
export interface IfStatement extends _Statement<'IfStatement'> {
    test: Expression;
    consequent: Statement;
    alternate: Statement | null;
}
export interface Import extends _Node<'Import'> {
}
export interface ImportDeclaration extends _ModuleDeclaration<'ImportDeclaration'> {
    specifiers: (ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier)[];
    source: Literal;
}
export interface ImportDefaultSpecifier extends _ModuleSpecifier<'ImportDefaultSpecifier'> {
}
export interface ImportNamespaceSpecifier extends _ModuleSpecifier<'ImportNamespaceSpecifier'> {
}
export interface ImportSpecifier extends _ModuleSpecifier<'ImportSpecifier'> {
    imported: Identifier;
}
export interface LabeledStatement extends _Statement<'LabeledStatement'> {
    label: Identifier;
    body: Statement;
}
export interface BigIntLiteral extends _Expression<'Literal'> {
    value: number;
    bigint: string;
    raw?: string;
}
export interface Literal extends _Expression<'Literal'> {
    value: boolean | number | string | null;
    raw?: string;
}
export declare type LogicalOperator = '&&' | '||';
export interface LogicalExpression extends _Expression<'LogicalExpression'> {
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
}
export interface MetaProperty extends _Expression<'MetaProperty'> {
    meta: Identifier;
    property: Identifier;
}
export interface PrivateName extends _Node<'PrivateName'> {
    name: string;
}
export interface Decorator extends _Node<'Decorator'> {
    expression: Expression;
}
export interface MethodDefinition extends _Node<'MethodDefinition'> {
    key: Expression | PrivateName;
    value: FunctionExpression | null;
    kind: 'constructor' | 'method' | 'get' | 'set';
    computed: boolean;
    static: boolean;
}
export interface NewExpression extends _Expression<'NewExpression'> {
    callee: Expression;
    arguments: (Expression | SpreadElement)[];
}
export interface Property extends _Node<'Property'> {
    key: Expression;
    computed: boolean;
    value: Expression | null;
    kind: 'init' | 'get' | 'set';
    method: boolean;
    shorthand: boolean;
}
export interface ObjectExpression extends _Expression<'ObjectExpression'> {
    properties: (Property | SpreadElement)[];
}
export interface AssignmentProperty extends _Node<'Property'> {
    key: Expression;
    value: PatternNoRest;
    computed: boolean;
    kind: 'init';
    method: false;
    shorthand: boolean;
}
export interface ObjectPattern extends _Pattern<'ObjectPattern'> {
    properties: (AssignmentProperty | RestElement)[];
    typeAnnotation?: TypeAnnotation | null;
}
export interface RegExpLiteral extends _Expression<'Literal'> {
    value: RegExp | null;
    raw?: string;
    regex: {
        pattern: string;
        flags: string;
    };
}
export interface RestElement extends _Pattern<'RestElement'> {
    argument: PatternTop;
    typeAnnotation?: TypeAnnotation | null;
}
export interface ReturnStatement extends _Statement<'ReturnStatement'> {
    argument: Expression | null;
}
export interface ImportExpression extends _Expression<'Import'> {
}
export interface SequenceExpression extends _Expression<'SequenceExpression'> {
    expressions: Expression[];
}
export interface SpreadElement extends _Node<'SpreadElement'> {
    argument: Expression;
}
export interface Super extends _Node<'Super'> {
}
export interface SwitchCase extends _Node<'SwitchCase'> {
    test: Expression | null;
    consequent: Statement[];
}
export interface SwitchStatement extends _Statement<'SwitchStatement'> {
    discriminant: Expression;
    cases: SwitchCase[];
}
export interface TaggedTemplateExpression extends _Expression<'TaggedTemplateExpression'> {
    tag: Expression;
    quasi: TemplateLiteral;
}
export interface TemplateElement extends _Node<'TemplateElement'> {
    value: {
        cooked: string | null;
        raw: string;
    };
    tail: boolean;
}
export interface TemplateLiteral extends _Expression<'TemplateLiteral'> {
    quasis: TemplateElement[];
    expressions: Expression[];
}
export interface ThisExpression extends _Expression<'ThisExpression'> {
}
export interface ThrowStatement extends _Statement<'ThrowStatement'> {
    argument: Expression;
}
export interface TryStatement extends _Statement<'TryStatement'> {
    block: BlockStatement;
    handler: CatchClause | null;
    finalizer: BlockStatement | null;
}
export declare type UnaryOperator = '-' | '+' | '!' | '~' | 'typeof' | 'void' | 'delete' | 'throw';
export interface UnaryExpression extends _Expression<'UnaryExpression'> {
    operator: UnaryOperator;
    argument: Expression;
    prefix: boolean;
}
export declare type UpdateOperator = '++' | '--';
export interface UpdateExpression extends _Expression<'UpdateExpression'> {
    operator: UpdateOperator;
    argument: Expression | Pattern;
    prefix: boolean;
}
export interface VariableDeclaration extends _Declaration<'VariableDeclaration'> {
    declarations: VariableDeclarator[];
    kind: 'var' | 'let' | 'const';
}
export interface VariableDeclarator extends _Node<'VariableDeclarator'> {
    id: PatternTop;
    init: Expression | null;
}
export interface WhileStatement extends _Statement<'WhileStatement'> {
    test: Expression;
    body: Statement;
}
export interface WithStatement extends _Statement<'WithStatement'> {
    object: Expression;
    body: Statement;
}
export interface YieldExpression extends _Expression<'YieldExpression'> {
    argument: Expression | null;
    delegate: boolean;
}
/**
* JSX types
*
* Reference: https://github.com/facebook/jsx/blob/master/AST.md
*/
export interface JSXIdentifier extends _Node<'JSXIdentifier'> {
    name: string;
    raw?: string;
}
export interface JSXMemberExpression extends _Node<'JSXMemberExpression'> {
    object: JSXMemberExpression | JSXIdentifier;
    property: JSXIdentifier;
}
export interface JSXNamespacedName extends _Node<'JSXNamespacedName'> {
    namespace: JSXIdentifier;
    name: JSXIdentifier;
}
export interface JSXEmptyExpression extends _Node<'JSXEmptyExpression'> {
}
export interface JSXExpressionContainer extends _Node<'JSXExpressionContainer'> {
    expression: Expression | JSXEmptyExpression;
}
export interface JSXSpreadChild extends _Node<'JSXSpreadChild'> {
    expression: Expression;
}
export interface _JSXBoundaryElement<T extends string> extends _Node<T> {
    name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
}
export interface JSXOpeningElement extends _JSXBoundaryElement<'JSXOpeningElement'> {
    selfClosing: boolean;
    attributes: (JSXAttribute | JSXSpreadAttribute)[];
}
export interface JSXText extends _Node<'JSXText'> {
    value: string;
    raw: string;
}
export interface JSXOpeningFragment extends _JSXBoundaryElement<'JSXOpeningFragment'> {
}
export interface JSXClosingFragment extends _JSXBoundaryElement<'JSXClosingFragment'> {
}
export interface JSXClosingElement extends _JSXBoundaryElement<'JSXClosingElement'> {
}
export interface JSXAttribute extends _Node<'JSXAttribute'> {
    name: JSXIdentifier | JSXNamespacedName;
    value: JSXText | JSXElement | JSXSpreadAttribute | JSXExpressionContainer | null;
}
export interface JSXSpreadAttribute extends _Node<'JSXSpreadAttribute'> {
    argument: Expression;
}
export interface JSXFragment extends _Expression<'JSXFragment'> {
    openingElement: JSXOpeningFragment;
    children: (JSXText | JSXExpressionContainer | JSXSpreadChild | JSXFragment)[];
    closingFragment: JSXClosingFragment | null;
}
export interface JSXElement extends _Expression<'JSXElement'> {
    openingElement: JSXOpeningElement;
    children: (JSXText | JSXExpressionContainer | JSXSpreadChild | JSXElement)[];
    closingElement: JSXClosingElement | null;
}
