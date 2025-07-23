class HierarchyTreeWidget extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  async onCustomWidgetAfterUpdate(changedProperties) {
    this.root.innerHTML = ""; // Clear previous
    const dim = this.properties.dimension;
    if (!dim) {
      this.root.textContent = "Please configure Dimension name.";
      return;
    }
    const members = await this.getMembers(dim); // SAC provided API
    const tree = this.buildTree(members);
    this.root.appendChild(tree);
  }

  buildTree(members) {
    const byParent = {};
    members.forEach(m => {
      const pid = m.parentId || "_ROOT_";
      byParent[pid] = byParent[pid] || [];
      byParent[pid].push(m);
    });

    const ul = document.createElement('ul');
    (byParent["_ROOT_"] || []).forEach(m => {
      ul.appendChild(this.buildNode(m, byParent));
    });
    return ul;
  }

  buildNode(member, byParent) {
    const li = document.createElement('li');
    li.textContent = member.text;
    const children = byParent[member.id];
    if (children && children.length) {
      const childUl = document.createElement('ul');
      children.forEach(c => childUl.appendChild(this.buildNode(c, byParent)));
      li.appendChild(childUl);
    } else {
      // Leaf node — allow click
      li.style.cursor = 'pointer';
      li.onclick = () => this.fireSelect(member);
    }
    return li;
  }

  fireSelect(member) {
    const evt = new CustomEvent('nodeSelect', { detail: member });
    this.dispatchEvent(evt);
  }

  async getMembers(dimension) {
    // SAC's custom widget API: fetch flattened members with parents
    return this.getDataSource().getDimensionMembers(dimension, { includeParents: true });
  }
}

customElements.define('hierarchy-tree-widget', HierarchyTreeWidget);
