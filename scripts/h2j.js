// Converts an HTML fragment (stdin) to JSX (stdout). Used once to port the design.
const H = require('htmltojsx');
let s = require('fs').readFileSync(0, 'utf8');
const styles = [];
s = s.replace(/style="([^"]*)"/g, (_, v) => { styles.push(v); return `data-stylex="${styles.length - 1}"`; });
let out = new H({ createClass: false }).convert(s);
const camel = k => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
out = out.replace(/data-stylex=\{(\d+)\}/g, (_, i) => {
  const parts = styles[+i].split(';').map(x => x.trim()).filter(Boolean).map(d => {
    const j = d.indexOf(':'); const k = d.slice(0, j).trim(); const v = d.slice(j + 1).trim();
    return `${JSON.stringify(k.startsWith('--') ? k : camel(k))}: ${JSON.stringify(v)}`;
  });
  return `style={{${parts.join(', ')}} as React.CSSProperties}`;
});
process.stdout.write(out);
