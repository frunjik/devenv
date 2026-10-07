# DevEnv C4 Views

The [JSON model](./devenv-c4.json) is authoritative. The [generated diagrams](./devenv-c4.generated.md) are a derived view; do not edit them independently. Open their Markdown preview in a viewer supporting Mermaid flowcharts.

These are current-architecture drafts, not proposed changes. They cover context, logical containers, and local development deployment. The model records evidence, assumptions, and limits. No new domain Type or Term is adopted by using C4's diagram vocabulary.

The diagrams use standard Mermaid flowcharts rather than experimental Mermaid C4 syntax. Labels identify element types, responsibilities, technologies, and directed relationships. Group boundaries depend on the view; filesystem stores are not independent processes.

## Regenerate

Run this PowerShell command from the repository root. It requires Node.js, with no additional packages or hosted rendering service. It overwrites only the generated Markdown.

```powershell
@'
const fs = require('node:fs');
const model = JSON.parse(fs.readFileSync('knowledge\\architecture\\devenv-c4.json', 'utf8'));
const escape = text => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, ' ');
const wrap = text => {
  const lines = [''];
  for (const word of String(text).split(/\s+/)) {
    const last = lines.length - 1;
    if (lines[last] && lines[last].length + word.length + 1 > 38) lines.push(word);
    else lines[last] += (lines[last] ? ' ' : '') + word;
  }
  return lines.map(escape).join('<br/>');
};
const sections = model.views.map(view => {
  const ids = view.groups.flatMap(group => group.elements);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate view element');
  const nodes = view.groups.map((group, i) => {
    const entries = group.elements.map(id => {
      const element = model.elements[id];
      if (!element) throw new Error('Unknown element: ' + id);
      return `${id}["${escape(element.name)}<br/>[${wrap(element.type)}]${element.technology ? '<br/>' + wrap(element.technology) : ''}<br/>${wrap(element.description)}"]`;
    });
    return `subgraph group${i}["${escape(group.title)}"]\ndirection TB\n${entries.join('\n')}\nend`;
  });
  const edges = view.relationships.map(id => {
    const edge = model.relationships[id];
    if (!edge || !ids.includes(edge.from) || !ids.includes(edge.to)) throw new Error('Invalid view relationship: ' + id);
    return `${edge.from} -->|"${wrap(edge.label)}${edge.technology ? '<br/>' + wrap(edge.technology) : ''}"| ${edge.to}`;
  });
  return `## ${view.title}\n\n${view.notes}\n\n\`\`\`mermaid\nflowchart TB\n${nodes.concat(edges).join('\n')}\n\`\`\`\n`;
});
const header = `# ${model.title}\n\nGenerated from [devenv-c4.json](./devenv-c4.json). Do not edit independently. Regenerate using [devenv-c4.md](./devenv-c4.md).\n\nDate: ${model.date}. ${model.status}.\n\nLegend: boxes are labelled architectural elements; arrows are directed interactions; labelled groups show view-specific boundaries. Data-store containers do not imply separate processes.\n\n`;
fs.writeFileSync('knowledge\\architecture\\devenv-c4.generated.md', header + sections.join('\n') + '\n## Limits\n\n' + model.limitations + '\n', 'utf8');
'@ | node
```

## Maintenance

Update the JSON when runtime boundaries, responsibilities, persistence, or communication change, then regenerate. Review the diagrams against the source evidence before treating a draft as agreed architecture. Keep proposed changes separate from the current-state model.

Potential later views are the clone replacement/restore interaction, ticket version/conflict flow, and test execution/event streaming. Add them only when they answer a concrete question.

## Rendering Verification

On 2026-10-07, all three generated diagrams rendered successfully with Mermaid 10.9.3 in a local browser preview. The preview used a locally downloaded renderer; repository content was not uploaded to a rendering service.

The first render exposed excessively wide unwrapped labels. The generation command now wraps descriptions and relationship labels and separates element type from technology. The regenerated context, container, and deployment views were visually inspected at a 1800px-wide viewport; all elements and relationship labels were visible without diagram clipping.

Rendered dimensions were approximately 389 x 336, 955 x 820, and 1499 x 1068 pixels respectively. Narrow viewers may need horizontal scrolling or zoom, especially for deployment. These checks establish rendering, not completeness of the architecture or agreement on its boundaries.
