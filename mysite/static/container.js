
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
    this.top = 0;
    this.right = 0;
    this.left = 0;
    this.foik = null;
    this.margin = 0;
    this.opacity = 100;
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
        self.tickerHandle = setInterval(this.ticker, 10, this);
      }

      if (this.template != null) {
        this.template.classList.add('n/' + this.n);
        this.template.setAttribute('tabindex', '0');
      }
      this.addChildren();


    }

    click(){

    }

    addChildren(){};



    set() {

    }

    setBackground(color) {
      this.template.style.backgroundColor = color;
    }

    setMargin(n, suffix="px") {
      this.template.style.margin = n + suffix;
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

    getMargin() {
      return this.margin;
    }

    getInnerWidth() {
      return this.template.getBoundingClientRect().width;
    }

    getInnerHeight() {
      return this.template.getBoundingClientRect().height;
    }

    getWidth() {
      return this.template.getBoundingClientRect().width + (this.margin*2);
    }

    getVisibleWidth() {
      return this.template.getBoundingClientRect().width - this.left;
    }

    getHeight() {
      return this.template.getBoundingClientRect().height + (this.margin*2);
    }

    getLeft() {
      return this.left;
    }

    getTop() {
      return this.top;
    }
    getOpacity() {
      return this.opacity;
    }

    setOpacity(n) {
      this.template.style.opacity = n/100;
    }

    getAvailableWidth() {
      return this.availableWidth;
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

    isNotActive(){}

    isActive(){}


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
      var found = false;
      for (var existingItem of this.items) {
        if (item.title == existingItem.title) {
          found = true;
         return existingItem;
        }
      }
      if (found == false) {
      this.items.push(item);
      this.setParent(item);

      if (item.template != null) {
        if (insert == 'end') {
          this.body.appendChild(item.template);
        } else if (insert == 'start') {
          this.body.insertBefore(item.template, this.body.firstChild);
          item.setZ(1);
        }
      }
      item.meta();
      this.itemCreated();
      return item;
     }
    }

  itemCreated(){}

  itemRemoved(){}

  getV(target, foo) {
    var dif = target - this[foo]();
    var v = dif * 0.1;
    if (Math.abs(v) < 0.1) {
      return target;
    } else {
      return v + this[foo]();
    }
  }


  scaleX(target) {
    var target = this.par['getWidth']();
  }


  moveO(target) {
    if (typeof target === 'object') {
      target = this[target[0]]()*target[1];
    }
    if (this.getV(target,'getOpacity') == target){
      for (let i = 0; i < this.animations.length; i++) {
        if (this.animations[i][0] == "moveO") {
          this.animations.splice(i, 1);
        }
      }
    }
  //    console.log(this.getV(target,'getOpacity'))
    this.opacity = this.getV(target,'getOpacity');
    this.par.resize();
  }

  moveM(target) {
    if (typeof target === 'object') {
      target = this[target[0]]()*target[1];
    }
    if (this.getV(target,'getMargin') == target){
      for (let i = 0; i < this.animations.length; i++) {
        if (this.animations[i][0] == "moveM") {
          this.animations.splice(i, 1);
        }
      }
    }
    this.margin = this.getV(target,'getMargin');
    this.par.resize();
  }


  moveH(target) {
    this.lockH = false;
    if (typeof target === 'object') {
      target = this[target[0]]()*target[1];
    }
    if (this.getV(target,'getLeft') == target){
      for (let i = 0; i < this.animations.length; i++) {
        if (this.animations[i][0] == "moveH") {
          this.animations.splice(i, 1);
        }
      }
    }
    this.left = this.getV(target,'getLeft');
    this.par.resize();
  }



  moveV(target) {
    this.lockV = false;
    if (typeof target === 'object') {
      target = this[target[0]]()*target[1];
    }
    if (this.getV(target,'getTop') == target){
      for (let i = 0; i < this.animations.length; i++) {
        if (this.animations[i][0] == "moveV") {
          this.animations.splice(i, 1);
        }
      }
    }
    if(this.title == 'contactsmenu') {
    //  console.log('moving', this.title, this.top, this.lockV)
    }


    this.top = this.getV(target,'getTop');

    this.par.resize();
  }


  scaleW(target) {
    if (target > this.getAvailableWidth()) {
      target = this.getAvailableWidth();
    }
    this.setMaxWidth(this.getV(target,'getWidth'));
    this.setWidth(this.getV(target,'getWidth'));

    if (this.getV(target,'getWidth') == target){
      this.animation = null;
      this.setMaxWidth(this.getV(target,'getWidth'));
      this.setWidth(this.getV(target,'getWidth'));
      this.setMaxWidth(this.initWidth);
    }

  }

  animate(animation) {

    for (let i = 0; i < this.animations.length; i++) {
      if (this.animations[i][0] == animation[0]) {
        this.animations.splice(i, 1);
        break;
      }
    }
  //  if(this.title == 'chatsmenu') {
    //  console.log('lockingstate2', this.lockV);
  //  }
    this.animations.push(animation);
  }

  setWidth(n, suffix="px") {
    this.template.style.width = n + suffix;
    this.set();
  }


  getByTitle2(title, get='') {
    this.descendants = [];
    this.searchChildren(this, 'title', title);
    if (this.descendants.length != 0) {
      if (get == 'all') {
        return this.descendants;
      } else {
        return this.descendants[0];
      }
    } else {
      return false;
    }
  }

    getChildren(property, value) {
      this.descendants = [];
      this.searchChildren(this, property, value);
      return this.descendants;
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

    getAncestors(property, value) {
      this.ancestors = [];
      this.searchAncestors(this, property, value);
      return this.ancestors;
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

    removeByTitle(title){
      for (var i = this.items.length - 1; i >= 0; i--)
      {
        if (this.items[i].title == title) {
          if (this.items[i].template != null) {
            this.items[i].template.remove();
          }
          this.items.splice(i,1);
          this.itemRemoved();
        }
      }
    }

    removeAll(){
      for (var i = this.items.length - 1; i >= 0; i--)
      {
        if (this.items[i].title != 'sidebarbuttonright') {
          if (this.items[i].template != null) {
            this.items[i].template.remove();
          }
          this.items.splice(i,1);
        }
      }
    }

};
