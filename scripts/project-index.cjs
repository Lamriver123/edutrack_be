/* Read-only source inventory; output contains symbols/contracts, never .env values. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const ts = require('typescript');
const be = path.resolve(__dirname, '..');
const workspace = path.dirname(be);
const fe = path.join(workspace, 'edutrack_fe');
const output = path.join(be, 'docs', 'project-code-index.md');
const snapshot = path.join(be, 'docs', 'project-source-snapshot.json');
const normalize = (s) => s.replace(/\\/g, '/');
const compact = (s) => s.replace(/\s+/g, ' ').trim();
const escape = (s) => compact(s).replace(/\|/g, '\\|').replace(/`/g, "'");
const surveyedAt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const ignored = new Set(['node_modules', '.git', '.next', 'dist', '.tmp', 'coverage', 'test-results', 'playwright-report']);
const records = [];
for (const repo of [be, fe]) {
  if (!fs.existsSync(path.join(repo, 'package.json'))) throw new Error('Both backend and sibling frontend repositories are required: ' + repo);
}
function decoratorArgument(value) {
  const match = value.match(/\(\s*['"]([^'"]*)['"]\s*\)/);
  return match ? match[1] : '';
}
function visitFiles(root) {
  if (!fs.existsSync(root)) return;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) visitFiles(full);
    else if (/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|css|json|md|yaml|yml|svg|html)$/.test(entry.name) && !/package-lock|tsconfig\.tsbuildinfo/.test(entry.name)) records.push(readRecord(full));
  }
}
function decorators(node, sf) {
  return ts.canHaveDecorators(node) ? (ts.getDecorators(node) || []).map(d => compact(d.getText(sf))) : [];
}
function readRecord(full) {
  const source = fs.readFileSync(full, 'utf8');
  const file = normalize(path.relative(workspace, full));
  const record = { file, lines: source.split(/\r?\n/).length, sha256: crypto.createHash('sha256').update(source).digest('hex'), imports: [], exports: [], classes: [], functions: [], types: [], objects: [], tests: [], routes: [], indexes: [], calls: [], headings: [] };
  if (!/\.[cm]?[jt]sx?$/.test(full)) {
    if (/\.md$/.test(full)) record.headings = source.split(/\r?\n/).filter(l => /^#{1,3} /.test(l));
    return record;
  }
  const sf = ts.createSourceFile(full, source, ts.ScriptTarget.Latest, true, /\.[jt]sx$/.test(full) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const line = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const text = (n) => n ? compact(n.getText(sf)) : '';
  const signature = (n) => `${n.name ? text(n.name) : 'default'}(${(n.parameters || []).map(text).join(', ')})${n.type ? ': ' + text(n.type) : ''}`;
  for (const statement of sf.statements) {
    if (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isEnumDeclaration(statement)) record.types.push({ name: text(statement.name), line: line(statement), definition: statement.getText(sf) });
    if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) {
      if (!declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) continue;
      const methods = declaration.initializer.properties.filter(p => ts.isMethodDeclaration(p) || ts.isPropertyAssignment(p) && (ts.isArrowFunction(p.initializer) || ts.isFunctionExpression(p.initializer))).map(p => ({ name: text(p.name), line: line(p), signature: ts.isMethodDeclaration(p) ? signature(p) : `${text(p.name)}(${p.initializer.parameters.map(text).join(', ')})` }));
      if (methods.length) record.objects.push({ name: text(declaration.name), methods });
    }
    if (ts.isImportDeclaration(statement)) record.imports.push({ from: statement.moduleSpecifier.text, bindings: text(statement.importClause) });
    if (statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) record.exports.push({ name: statement.name ? text(statement.name) : ts.isVariableStatement(statement) ? statement.declarationList.declarations.map(d => text(d.name)).join(', ') : 'default', line: line(statement) });
    if (ts.isFunctionDeclaration(statement)) record.functions.push({ name: statement.name ? text(statement.name) : 'default', signature: signature(statement), line: line(statement) });
    if (ts.isClassDeclaration(statement)) {
      const cls = { name: text(statement.name), decorators: decorators(statement, sf), line: line(statement), members: [] };
      for (const m of statement.members) {
        if (ts.isConstructorDeclaration(m)) continue;
        const item = { name: text(m.name), line: line(m), decorators: decorators(m, sf) };
        if (ts.isMethodDeclaration(m)) { item.signature = signature(m); item.visibility = m.modifiers?.some(x => x.kind === ts.SyntaxKind.PrivateKeyword) ? 'private' : 'public'; }
        else if (ts.isPropertyDeclaration(m)) { item.type = text(m.type); item.optional = !!m.questionToken; item.initializer = m.initializer && !/service|controller/.test(file) ? text(m.initializer) : ''; }
        cls.members.push(item);
        const route = item.decorators.find(d => /^@(Get|Post|Patch|Put|Delete)\(/.test(d));
        if (route) {
          const controller = cls.decorators.find(d => d.startsWith('@Controller')) || '@Controller()';
          record.routes.push({ controller, verb: route.match(/^@(\w+)/)[1].toUpperCase(), path: ['/api', decoratorArgument(controller), decoratorArgument(route)].filter(Boolean).join('/'), guard: cls.decorators.filter(d => d.startsWith('@UseGuards')).concat(item.decorators.filter(d => d.startsWith('@UseGuards'))).join(' '), route, method: item.signature, line: item.line });
        }
      }
      record.classes.push(cls);
    }
  }
  function scan(n) {
    if (ts.isCallExpression(n)) {
      const fn = text(n.expression);
      if (/\.index$/.test(fn)) record.indexes.push({ expression: text(n), line: line(n) });
      if (/^(it|test|describe)(\.|$)/.test(fn) && n.arguments[0] && (ts.isStringLiteralLike(n.arguments[0]) || ts.isNoSubstitutionTemplateLiteral(n.arguments[0]))) record.tests.push({ label: n.arguments[0].text, line: line(n) });
      if (/^(apiRequest|apiUpload|apiDownload|apiFetch|request|fetch)$/.test(fn) || /(schoolApi|authApi|profileApi|invoiceTemplateApi|invoiceImagesApi)\./.test(fn)) record.calls.push({ fn, args: n.arguments.map(a => text(a).slice(0, 180)), line: line(n) });
    }
    ts.forEachChild(n, scan);
  }
  scan(sf);
  return record;
}
for (const root of [path.join(be, 'src'), path.join(be, 'test'), path.join(be, 'scripts'), path.join(fe, 'app'), path.join(fe, 'components'), path.join(fe, 'hooks'), path.join(fe, 'lib'), path.join(fe, 'types'), path.join(fe, 'tests'), path.join(fe, 'public')]) visitFiles(root);
for (const repo of [be, fe]) for (const name of ['package.json', 'next.config.ts', 'playwright.config.ts', 'render.yaml', 'tsconfig.json', 'tsconfig.build.json', 'eslint.config.mjs', 'nest-cli.json', 'postcss.config.mjs', '.env.example', '.gitignore']) if (fs.existsSync(path.join(repo, name))) records.push(readRecord(path.join(repo, name)));
records.sort((a,b) => a.file.localeCompare(b.file));
const commits = {};
for (const [name, repo] of [['backend', be], ['frontend', fe]]) commits[name] = cp.execFileSync('git', ['-c', `safe.directory=${normalize(repo)}`, '-C', repo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (process.argv.includes('--check')) {
  const old = JSON.parse(fs.readFileSync(snapshot, 'utf8'));
  const oldMap = new Map(old.files.map(f => [f.file, f.sha256]));
  const changed = records.filter(r => oldMap.get(r.file) !== r.sha256).map(r => r.file);
  const current = new Set(records.map(r => r.file));
  const deleted = old.files.filter(f => !current.has(f.file)).map(f => f.file);
  console.log(JSON.stringify({ changed, deleted }, null, 2));
  process.exitCode = changed.length || deleted.length ? 1 : 0;
} else {
  const md = [
    '# EduTrack — chỉ mục mã nguồn BE + FE', '',
    'Sinh từ mã nguồn bằng node scripts/project-index.cjs trong backend. Đọc [project-guide.md](project-guide.md) trước, rồi tìm đúng đường dẫn hoặc symbol trong file này. Chỉ mục ghi cấu trúc tĩnh; kiểu trả về suy luận và nghiệp vụ cần đọc hướng dẫn hoặc method đích.', '',
    'Mốc sinh chỉ mục: ' + surveyedAt + ' (Việt Nam). Backend: ' + commits.backend + '. Frontend: ' + commits.frontend + '.', '',
    'Phạm vi: ' + records.length + ' file mã/cấu hình/style/tài nguyên văn bản, ' + records.reduce((sum, r) => sum + r.lines, 0) + ' dòng. Loại trừ dependency, build/cache, log, credential JSON, .env runtime và dữ liệu backup; .env.example chỉ chứa mẫu cấu hình. Không đọc/ghi DB hoặc gọi dịch vụ ngoài.', '',
    '## Cách tra cứu', '',
    '- Dùng tìm kiếm theo route, DTO, schema, tên component, tên method hoặc tên test.',
    '- Dòng ghi trong chỉ mục là vị trí tại mốc sinh; có thể đổi sau chỉnh sửa. Tìm symbol nếu dòng lệch.',
    '- Kiểm tra tài liệu lỗi thời: node scripts/project-index.cjs --check. Mã thoát 1 nghĩa là có file đã thay đổi; đọc diff của những file đó, cập nhật hướng dẫn rồi sinh lại chỉ mục.',
    '- Chỉ mục và snapshot hash tự sinh; không dùng để kết luận test đã chạy hoặc tính năng đã deploy.', '',
    '## Danh mục file', '',
    '| File | Dòng | Thành phần chính |',
    '| --- | ---: | --- |',
  ];
  const link = (r) => `[${r.file}](${normalize(path.relative(path.dirname(output), path.join(workspace,r.file)))})`;
  for (const r of records) md.push(`| ${link(r)} | ${r.lines} | ${escape([...r.classes.map(c=>c.name), ...r.functions.map(f=>f.name), ...r.exports.map(e=>e.name)].filter((v,i,a)=>v && a.indexOf(v)===i).join(', '))} |`);
  md.push('', '## API backend', '', 'Tất cả đường dẫn controller được thêm prefix /api tại src/main.ts. HTTP/path ghép từ string decorators trong source; handler signature và guard được giữ để tra cứu quyền/DTO.', '', '| File:dòng | HTTP | Đường dẫn đầy đủ | Handler + tham số | Guard |', '| --- | --- | --- | --- | --- |');
  for (const r of records) for (const route of r.routes) md.push(`| ${link(r)}:${route.line} | ${route.verb} | ${escape(route.path)} | ${escape(route.method)} | ${escape(route.guard)} |`);
  md.push('', '## Symbol, schema, DTO và test theo file', '');
  for (const r of records.filter(r=>r.classes.length || r.functions.length || r.types.length || r.objects.length || r.tests.length || r.calls.length || r.exports.length)) {
    md.push(`### ${r.file}`, '', `${link(r)} — ${r.lines} dòng.`, '');
    if (r.imports.length) md.push('Dependencies: ' + r.imports.map(i=>`\`${escape(i.from)}\``).join(', ') + '.', '');
    for (const cls of r.classes) {
      md.push(`**${cls.name}** (dòng ${cls.line}) ${cls.decorators.map(escape).join(' ')}`.trimEnd(), '', '| Member | Dòng | Hợp đồng / loại | Validation / metadata |', '| --- | ---: | --- | --- |');
      for (const member of cls.members) md.push(`| ${escape(member.name)} | ${member.line} | ${escape(member.signature ? `${member.visibility} ${member.signature}` : `${member.type}${member.optional ? ' (optional)' : ''}${member.initializer ? ' = ' + member.initializer : ''}`)} | ${escape(member.decorators.join(' '))} |`);
      md.push('');
    }
    if (r.functions.length) md.push('Functions: ' + r.functions.map(f=>`\`${escape(f.signature)}\` (dòng ${f.line})`).join('; ') + '.', '');
    if (r.exports.length) md.push('Exports: ' + r.exports.map(e=>`\`${escape(e.name)}\` (${e.line})`).join(', ') + '.', '');
    if (r.types.length) md.push('Type contracts / enum values (mã khai báo tại mốc khảo sát):', '', '```typescript', ...r.types.map(t=>`// line ${t.line}\n${t.definition}`), '```', '');
    for (const object of r.objects) md.push(`Object API: **${object.name}**`, '', ...object.methods.map(m=>`- Dòng ${m.line}: \`${escape(m.signature)}\``), '');
    if (r.indexes.length) md.push('Indexes:', '', ...r.indexes.map(i=>`- Dòng ${i.line}: \`${escape(i.expression)}\``), '');
    if (r.calls.length) md.push('API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):', '', ...r.calls.map(c=>`- Dòng ${c.line}: \`${escape(c.fn)}(${escape(c.args.join(', '))})\``), '');
    if (r.tests.length) md.push('Test labels (khai báo, không phải kết quả thực thi):', '', ...r.tests.map(t=>`- Dòng ${t.line}: ${escape(t.label)}`), '');
  }
  fs.writeFileSync(output, md.join('\n') + '\n', 'utf8');
  fs.writeFileSync(snapshot, JSON.stringify({ surveyedAt, commits, files: records }, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ files: records.length, lines: records.reduce((s,r)=>s+r.lines,0), controllers: records.filter(r=>r.routes.length).length, endpoints: records.reduce((s,r)=>s+r.routes.length,0), classes: records.reduce((s,r)=>s+r.classes.length,0), output, snapshot }, null, 2));
}
