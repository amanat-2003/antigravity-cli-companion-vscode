const fs = require('fs');
const path = require('path');

const files = [
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'docs/implementation_overview.md',
  'docs/instructions_for_developer.md',
  'package-lock.json',
  'package.json',
  'src/AgyComposerPanel.ts',
  'src/contextComposer.ts',
  'src/extension.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/AGY Input Composer/g, 'Antigravity CLI Companion - Unofficial');
  content = content.replace(/AGY Composer/g, 'AGY Companion');
  content = content.replace(/agy-input-composer/g, 'agy-companion');
  content = content.replace(/agy-composer/g, 'agy-companion');
  content = content.replace(/agy composer/gi, 'agy companion');
  content = content.replace(/AgyComposerPanel/g, 'AgyCompanionPanel');
  content = content.replace(/contextComposer/g, 'contextCompanion');
  content = content.replace(/openComposer/g, 'openCompanion');
  
  // Update webview view id
  content = content.replace(/agy-companion\.panel/g, 'agy-companion.panel'); // already covered by agy-composer

  fs.writeFileSync(filePath, content);
});

if (fs.existsSync('src/AgyComposerPanel.ts')) {
  fs.renameSync('src/AgyComposerPanel.ts', 'src/AgyCompanionPanel.ts');
}
if (fs.existsSync('src/contextComposer.ts')) {
  fs.renameSync('src/contextComposer.ts', 'src/contextCompanion.ts');
}
