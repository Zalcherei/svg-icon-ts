interface IconAttributes extends HTMLElement {
  readonly type?: string;
  readonly path?: string;
  readonly size: string;
  readonly viewbox: string;
  readonly flip: {
    readonly x: string;
    readonly y: string;
  };
  readonly rotate: string;
	readonly defaults: IconTypesConfig;
  connectedCallback(): void;
  attributeChangedCallback(
    attributeName: string,
    oldValue: string | null,
    newValue: string | null
  ): void;
}

interface IconTypesConfig {
  readonly size: string;
  readonly viewbox: string;
}

const iconTypes: { [key: string]: IconTypesConfig } = {
	mdi: {
		size: "24",
		viewbox: '0 0 24 24',
	},
	'simple-icons': {
		size: "24",
		viewbox: '0 0 24 24',
	},
	default: {
		size: "0",
		viewbox: '0 0 0 0',
	},
}

class SvgIcon extends HTMLElement implements IconAttributes {
  static get observedAttributes(): string[] {
		return ['type', 'path', 'size', 'viewbox', 'flip', 'rotate'];
	}

	get defaults(): IconTypesConfig {
		return iconTypes[this.getAttribute('type') ?? "default"] ?? iconTypes.default;
	}

	get size(): string {
		return this.getAttribute('size') ?? `${this.defaults.size}`;
	}

	get viewbox(): string {
		return this.getAttribute('viewbox') ?? this.defaults.viewbox;
	}

	get flip(): { readonly x: string; readonly y: string } {
		const flip = (this.getAttribute('flip') ?? '').toLowerCase()
		return {
			x: ['both', 'horizontal'].includes(flip) ? '-1' : '1',
			y: ['both', 'vertical'].includes(flip) ? '-1' : '1',
		};
	}

	get rotate(): string {
    const rotate = Number(this.getAttribute("rotate"));
    return Number.isNaN(rotate) ? this.getAttribute("rotate") ?? "0deg" : `${rotate}deg`;
  }
  
  constructor(...args: []) {
    const self = super(...args) as unknown as HTMLElement;

    self.attachShadow({ mode: "open" });

    const style = document.createElement('style');
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    style.textContent = `
      svg {
        transform: rotate(var(--r, 0deg)) scale(var(--sx, 1), var(--sy, 1));
      }
      path {
        fill: currentColor;
      }
    `;

    svg.append(path);

    self.shadowRoot?.append(style, svg);

    return self as IconAttributes;
  }

	connectedCallback(): void {
		const svg = this.shadowRoot?.querySelector("svg")!;
		const path = this.shadowRoot?.querySelector("path")!;

		svg.setAttribute("width", this.size);
		svg.setAttribute("height", this.size);
		svg.setAttribute("viewBox", this.viewbox);

		svg.style.setProperty("--sx", this.flip.x);
		svg.style.setProperty("--sy", this.flip.y);
		svg.style.setProperty("--r", this.rotate);

		path.setAttribute("d", this.getAttribute("path") ?? "default");
	}

	attributeChangedCallback(name: string, _oldValue: string, newValue: string): void {
		const svg = this.shadowRoot?.querySelector("svg")!;
		const path = this.shadowRoot?.querySelector("path")!;

		switch(name) {
			case "type":
				svg.setAttribute("width", this.size);
				svg.setAttribute("height", this.size);
				svg.setAttribute("viewBox", this.viewbox);
				break;
			case "path":
				path.setAttribute("d", newValue);
				break;
			case "size":
				svg.setAttribute("width", this.size);
				svg.setAttribute("height", this.size);
				break;
			case "viewbox":
				svg.setAttribute("viewBox", this.viewbox);
				break;
			case "flip":
				svg.style.setProperty("--sx", this.flip.x);
				svg.style.setProperty("--sy", this.flip.y);
				break;
			case "rotate":
				svg.style.setProperty("--r", this.rotate);
				break;
		}
	}
}

customElements.define("svg-icon", SvgIcon);