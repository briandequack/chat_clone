
var n = 0;
var urls = [];

class Container {
    constructor(displayName, title, minItems=0, ani=null, displayType='') {
    this.template = null;
    this.body = null;
    this.title = title.toLowerCase();
    this.displayName = displayName;
    this.items = [];
    this.dir = '';
    this.par = null;
    this.results = [];
    this.tickerHandle = null;
    this.ancestors = [];
    this.constructorTree = [];
    this.selected = false;
    this.n = this.getNum();
    this.methodList = new Set();
    }

    getNum() {
      n += 1;
      return n;
    }

    getMethods(self=this) {
      var object = this;
      while (true) {
        var superConstructor = Object.getPrototypeOf(object);
        if (superConstructor != null) {
          if (superConstructor.constructor.name == 'Object') {
            break;
          }
          object = superConstructor;
            for (var method of Object.getOwnPropertyNames(object)) {
                this.methodList.add(method);
          }
        }
      }
    }

    meta() {
      if (this == this.par) {
        self.tickerHandle = setInterval(this.ticker, 1000, this);
      }
    }

    set() {

    }

    setBackground(color) {
      this.template.style.backgroundColor = color;
    }

    setWidth(n, suffix="px") {
      this.template.style.width = n + suffix;
      this.set();
    }

    setHeight(n, suffix="px") {
      this.template.style.height = n + suffix;
    }

    setMaxWidth(n) {
      this.maxWidth = n;
    }

    setLeft(n, suffix="px") {
      this.template.style.left = n + suffix;
    }

    setTop(n, suffix="px") {
      this.template.style.top = n + suffix;
    }

    setRight(n, suffix="px") {
      this.template.style.right = n + suffix;
    }

    setPosition(position) {
      this.template.style.position = position;
    }

    setBorder(n, color="black") {
      this.template.style.border = n + "px solid black";
    }

    setZ(n) {
      this.template.style.zIndex = n;
      //this.set();
    }

    getBorder() {
      if (this.template.style.border == '') {
          return 0;
      } else {
        return parseFloat(this.template.style.border.split(" ")[0].split("px")[0]);
      }
    }

    getWidthChildren() {
      var width = 0;
      for (var child of this.items) {
        width += child.getWidth();
      }
      return width;
    }

    getWidth() {
      return this.template.getBoundingClientRect().width;
    }

    getHeight() {
      return this.template.getBoundingClientRect().height;
    }


    ticker(self=this) {
      self.tickerHook();
      for (var child of self.items) {
        child.ticker();
      }
    }

    tickerHook() {
      //console.log('TIK TOK', this.title);
    }

    resize() {
      this.resizeHook();
      for (var child of this.items) {
        child.resize();
      }
    }

    resizeHook() {
      //console.log('TIK TOK', this.title);
    }

    setParent(item) {
      item.par = this;
      item.dir = this.dir + item.title + '/';
      var constructor = Object.getPrototypeOf(item);
      while (constructor.constructor.name != 'Object') {
        item.constructorTree.push(constructor.constructor.name);
        constructor = Object.getPrototypeOf(constructor);
      }
      urls.push({'n':item.n,'url':item.dir})
      item.getMethods();
    }

    create2(item, insert='end') {
      this.items.push(item);
      this.setParent(item);
      if (insert == 'end') {
        this.body.appendChild(item.template);
      } else if (insert == 'start') {
        this.body.insertBefore(item.template, this.body.firstChild);
      }

    //  for (var method of item.methodList) {
    //    if (method == 'meta'){
    //      item['meta']();
    //    }
    //  }
      item.meta();
    }

    getByTitle2(title, get='') {
      this.descendants = [];
      this.searchChildren(this, 'title', title);
      if (get == 'all') {
        return this.descendants;
      } else {
        return this.descendants[0];
      }
    }

    searchChildren(startDir, property='', value='', childDirs=true) {
      if (startDir != this) {
        if (property != '') {
          if (property != 'constructor') {
            if (this[property] == value) {
              startDir.descendants.push(this);
            }
          } else {
            for (var constructor of this.constructorTree) {
              if (constructor == value) {
                startDir.descendants.push(this);
                break;
              }
            }
          }
        } else {
            startDir.descendants.push(this);
        }
      }
      if (childDirs) {
        for (var child of this.items) {
          child.searchChildren(startDir, property, value);
        }
      }
    }

    getAncestors() {
      this.ancestors = [];
      this.searchAncestors(this);
      console.log(this.ancestors);
    }

    searchAncestors(startDir, property='', value='') {
      var par = this.par;
      while (par != par.par) {
        if (property != '') {
          if (property != 'constructor') {
            if (par[property] == value) {
              startDir.ancestors.push(par);
            }
          } else {
            for (var constructor of par.constructorTree) {
              if (constructor == value) {
                startDir.ancestors.push(par);
                break;
              }
            }
          }
        } else {
          startDir.ancestors.push(par);
        }
        par = par.par;
      }
    }

};
