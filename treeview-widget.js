class TreeViewWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        const style = document.createElement("style");
        style.textContent = \`
            ul { list-style: none; padding-left: 1rem; }
            li { cursor: pointer; }
            .non-leaf { color: gray; cursor: default; }
        \`;
        this.shadowRoot.appendChild(style);

        this.treeContainer = document.createElement("div");
        this.shadowRoot.appendChild(this.treeContainer);
    }

    loadTree(treeData) {
        this.treeContainer.innerHTML = "";
        this.renderTree(treeData, this.treeContainer);
    }

    renderTree(nodes, container) {
        const ul = document.createElement("ul");
        for (const node of nodes) {
            const li = document.createElement("li");

            if (node.children && node.children.length > 0) {
                li.textContent = node.description;
                li.classList.add("non-leaf");
                this.renderTree(node.children, li);
            } else {
                li.textContent = node.description;
                li.onclick = () => {
                    const event = new CustomEvent("onCustomWidgetEvent", {
                        detail: {
                            type: "leafSelected",
                            payload: node.id
                        }
                    });
                    this.dispatchEvent(event);
                };
            }

            ul.appendChild(li);
        }
        container.appendChild(ul);
    }
}

customElements.define("tree-view-widget", TreeViewWidget);