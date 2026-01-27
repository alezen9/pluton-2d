import { SVG_NS } from '../constants';
import { upsertDef } from './utils';

export class PatternDefs {
  readonly hatchFill45Id = 'pluton-pattern-fill-hatch-45';
  readonly graphPaperPatternId = 'pluton-pattern-graph-paper';

  private defsEl: SVGDefsElement;

  constructor(defsEl: SVGDefsElement) {
    this.defsEl = defsEl;
  }

  sync(): void {
    upsertDef(this.defsEl, this.createHatchFill45Pattern());
    upsertDef(this.defsEl, this.createGraphPaperPattern());
  }

  private createHatchFill45Pattern(): SVGPatternElement {
    const pattern = document.createElementNS(SVG_NS, 'pattern');
    pattern.setAttribute('id', this.hatchFill45Id);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '8');
    pattern.setAttribute('height', '8');
    pattern.setAttribute('patternTransform', 'rotate(-45)');

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', '0');
    line.setAttribute('x2', '0');
    line.setAttribute('y2', '8');
    line.setAttribute('stroke', 'rgba(0, 39, 50, 0.2)');
    line.setAttribute('stroke-width', '12.5');

    pattern.appendChild(line);
    return pattern;
  }

  private createGraphPaperPattern(): SVGPatternElement {
    const smallSize = 10;
    const majorSize = 50;

    const pattern = document.createElementNS(SVG_NS, 'pattern');
    pattern.setAttribute('id', this.graphPaperPatternId);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('x', '0');
    pattern.setAttribute('y', '0');
    pattern.setAttribute('width', String(majorSize));
    pattern.setAttribute('height', String(majorSize));

    const minorPath = document.createElementNS(SVG_NS, 'path');
    minorPath.classList.add('pluton-pattern-graph-paper-minor');

    const minorCount = Math.max(1, Math.floor(majorSize / smallSize));
    const cmds: string[] = [];

    for (let i = 1; i < minorCount; i++) {
      const x = i * smallSize;
      cmds.push(`M ${x} 0 L ${x} ${majorSize}`);
    }
    for (let i = 1; i < minorCount; i++) {
      const y = i * smallSize;
      cmds.push(`M 0 ${y} L ${majorSize} ${y}`);
    }

    minorPath.setAttribute('d', cmds.join(' '));
    pattern.appendChild(minorPath);

    const majorPath = document.createElementNS(SVG_NS, 'path');
    majorPath.classList.add('pluton-pattern-graph-paper-major');
    majorPath.setAttribute(
      'd',
      `M ${majorSize} 0 L ${majorSize} ${majorSize} M 0 ${majorSize} L ${majorSize} ${majorSize}`
    );
    pattern.appendChild(majorPath);

    return pattern;
  }
}
