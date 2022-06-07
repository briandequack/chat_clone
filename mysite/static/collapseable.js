

class Dropdown extends EmptyContainer{
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
    this.template.setAttribute('tabindex', '0');

    this.open = false;
    this.button = null;

  }


  meta() {
    this.button = this.create2(new DropdownButton('More','more'));
    this.create2(new EmptyContainer('Body container outer', 'bodycontainerouter'));
  //  this.getByTitle2('bodycontainerouter')
    this.create2(new Switch('Body container', 'bodycontainer',0,'easeCenterLeftAnimation'));


    this.getByTitle2('bodycontainer').create2(new DropdownBody('Body', 'body'));



  }
}

class DropdownButton extends BasicButton {
  constructor() {
    super(arguments[0], arguments[1]);
  }

  meta(){
    this.body.innerHTML = this.displayName;
  }

  request() {
      console.log(this.template.getBoundingClientRect());
    if (this.par.getByTitle2('body').selected == false) {
      this.par.getByTitle2('bodycontainer').select('body');
    } else {
      this.par.getByTitle2('bodycontainer').deselect('body');
    }
  }
}

class DropdownBody extends EmptyContainer {
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
    this.template = cloneHTML('dropdown-body', this.title, this.title.toLowerCase());
    this.body = this.template.getElementsByClassName('body')[0];
    this.template.style.marginLeft = '0px';
    this.template.style.zIndex = '1';
    this.center = null;
  }



  meta() {
    this.BCR = this.template.getBoundingClientRect();
    this.include = this.getParentConstructor(this, 'Dropdown');
    this.create2(new TextField('asdfasdfasdfasdf', 'asdf'));

    if (this.getParentConstructor(this, 'Sidebar')) {
      this.center = this.getParentConstructor(this, 'Sidebar').par.center;
    }
  }

  setMarginLeft(n) {
    this.template.style.marginLeft = n + "px";
  }

  on() {
    this.open = true;
    this.selected = true;
  }

  off() {
    this.open = false;
    this.selected = false;
  }
}


class Sidebar extends Dropdown{
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
  }

  setMarginLeft(n) {
    this.template.style.marginLeft = n + "px";
    if (this.par.center != null) {
      this.center.updateD();
    }
  }

}


class LeftSidebar extends Sidebar{
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
    this.template.style.position = "absolute";
  //  this.template.style.opacity = "0.3";
    this.center = null;
  }

  meta() {
    this.create2(new DropdownButton('More','more'));
    this.getByTitle2('more').template.style.position = "absolute";
    this.getByTitle2('more').template.style.zIndex = "5";
    this.create2(new Switch('Body container', 'bodycontainer',0,'easeCenterLeftAnimation'));
    this.getByTitle2('bodycontainer').create2(new DropdownBody('Body', 'body'),'end', true);
  }
};

class RightSidebar extends Sidebar{
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
    this.template.style.position = "absolute";

    this.center = null;
  }

  meta() {
    this.create2(new DropdownButton('More','more'));
    this.getByTitle2('more').template.style.position = "absolute";
    this.getByTitle2('more').template.style.zIndex = "5";
    this.create2(new Switch('Body container', 'bodycontainer',0,'easeCenterRightAnimation'));
    this.getByTitle2('bodycontainer').create2(new DropdownBody('Body', 'body'),'end', true);


  }
};
