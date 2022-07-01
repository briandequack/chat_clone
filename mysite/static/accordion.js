
class Accordion2 extends Container{
  constructor(displayName, title, minItems=null) {
    super(displayName, title, minItems);
      this.template = cloneHTML('accordion', this.title);
      this.body = this.template;
    }

    remove(title) {
      for (let i = 0; i < this.items.length; i++) {
        if (title == this.items[i].title) {
          this.items[i].template.remove();
          this.items.splice(i, 1)
          break;
        }
      }
      if (this.parent != null) {
        this.parent.remove(title);
      }

    }

    item(title) {
      for (var item of this.items) {
        if (title == item.title) {
          return item;
        }
      }
      return false;
    }
};

class AccordionItem2 extends Container{
  constructor(displayName, title, minItems=null) {
    super(displayName, title, minItems);

    }

    meta() {
      var accordionItemName = this.title + this.par.title;
      this.template = cloneHTML('accordion-item', accordionItemName, accordionItemName);
      this.header = this.template.getElementsByClassName('accordion-header'+'-' + accordionItemName)[0];
      this.button = this.header.getElementsByClassName('accordion-button'+'-'+ accordionItemName)[0];
      this.button.setAttribute('data-bs-target', "#collapse"+ accordionItemName);
      this.button.setAttribute('aria-controls', "collapse"+ accordionItemName);
      this.body = this.template.getElementsByClassName('collapse'+'-'+ accordionItemName)[0];
      this.body.setAttribute('data-bs-parent', "#"+ 'accordion'+this.par.title);
      this.button.innerHTML = this.displayName;

    }



    add(item) {
      this.body.appendChild(item.template);
      this.items.push(item);
    }

    addFirst(item) {
      if (this.item(item.title) == false) {
        this.body.insertBefore(item.template, this.body.firstChild);
        this.items.push(item);
      }
    }


    remove(title) {
      for (let i = 0; i < this.items.length; i++) {
        if (title == this.items[i].title) {
          this.items[i].template.remove();
          this.items.splice(i, 1)
          break;
        }
      }

      if (this.items.length == 1) {
        this.accordion.remove(this.title);
      }
    }

    item(title) {
      for (var item of this.items) {
        if (title == item.title) {
          return item;
        }
      }
      return false;
    }


}

// Used
class CheckboxItemCreateGroup {
  constructor(displayName, title) {
    this.title = title;
    this.displayName = displayName;
    this.list = title;
    this.template = cloneHTML('checkbox-createGroup', this.title, this.list.toLowerCase());
    this.username = this.template.getElementsByClassName('value' + '-'+ this.list.toLowerCase())[0];
    this.username.innerHTML = this.displayName;
    this.setBackground('white');

    this.lastSeenHook = this.template.getElementsByClassName('lastSeen-hook' + '-' + this.title)[0];
    this.lastSeenHook.classList.add("ltsn" +'-'+displayName);
  }
}


class TitleItem {
  constructor(parent, title, lastSeen) {
    this.parent = parent;
    this.pk = parent.pk;
    this.chat = parent.chat;
    this.title = title;
    this.template = cloneHTML('user-title', this.pk, this.title, this.pk);
    this.template.getElementsByClassName('username'+'-'+this.title)[0].innerHTML = this.title;
    this.template.getElementsByClassName('ltsn'+'-'+this.title)[0].innerHTML = getTimeString(lastSeen);;

  }
}

class TabItem {
  constructor(parent, title) {
    this.parent = parent;
    this.pk = parent.pk;
    this.chat = parent.chat;
    this.title = title;
    this.template = cloneHTML('user-tab-title', this.pk, this.title, this.pk);
    this.template.getElementsByClassName('username'+'-'+this.title)[0].innerHTML = this.title;
  }
}

class ChatHeader extends Container{
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
    this.self = this;
    this.template = cloneHTML('chat-header', this.title, this.title);
    this.body = this.template.getElementsByClassName('body')[0];
    }
}


class HeaderMember extends Container {
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
    this.template = cloneHTML('empty-container', this.title, this.title);
    this.body = this.template.getElementsByClassName('body')[0];
    this.body.innerHTML = this.displayName;
  }

}



class Collapseable extends Container{
  constructor(displayName, title, minItems=null) {
    super(displayName, title, minItems);
    this.attribute = Math.floor((Math.random() * 1100) + 1);
    this.template = cloneHTML('empty-container', this.title,this.title);
    this.body = this.template.getElementsByClassName('body')[0];
  }
  meta() {
    this.self.create2(new CollapseButton('Button','button', this.attribute));
    this.self.create2(new CollapseBody('Body','body', this.attribute));
  }
}

class CollapseButton extends Container{
  constructor(displayName, title, attribute, minItems=0) {
    super(displayName, title, minItems);
    this.template = cloneHTML('options2', this.title,this.title);
    this.template.setAttribute("data-bs-target", "#collapseExample"+attribute);
    this.template.setAttribute("aria-controls", "collapseExample"+attribute);
  }
}

class CollapseBody extends Container{
  constructor(displayName, title, attribute,minItems=0) {
    super(displayName, title, minItems);
    this.template = cloneHTML('options-body2', attribute, attribute);
    this.body = this.template.getElementsByClassName('body')[0];
    }
}


class CollapseableOptions extends Collapseable {
  constructor(displayName, title, minItems=null) {
    super(displayName, title, minItems);
  }

  meta() {
    this.self.create2(new CollapseButton('Button','button', this.attribute));
    this.self.create2(new CollapseBody('Body','body', this.attribute));
    this.getByTitle2('body').create2(new Accordion2('Accordion','accordion'));
    this.role = this.par.par.getByTitle2(username).getRole();
    if (this.role == 'admin') {
      this.admin();
    } else {
      this.member();
    }
  }

  admin() {
    for (var member of this.par.par.getByTitle2('members').items) {
      if (member.role == 'admin') {
        this.getByTitle2('accordion').create2(new AccordionItem2('Remove admin','removeadmin'));
        this.getByTitle2('removeadmin').create2(new Checkbox2(member.name, member.name, member.name, this.par.par.pk),'start');
        this.getByTitle2('removeadmin').create2(new CheckboxSubmit2('Remove admin', 'removeadmin', 'remove_contact_group_admin'),'end');

      } else if (member.role == 'member') {
        this.getByTitle2('accordion').create2(new AccordionItem2('Make admin','makeadmin'));
        this.getByTitle2('makeadmin').create2(new Checkbox2(member.name, member.name, member.name, this.par.par.pk),'start');
        this.getByTitle2('makeadmin').create2(new CheckboxSubmit2('Make admin', 'makeadmin', 'make_contact_group_admin'),'end');
      }
      if (member.status == 'active' || member.status == 'inactive') {
        this.getByTitle2('accordion').create2(new AccordionItem2('Remove member','removecontact'));
        this.getByTitle2('removecontact').create2(new Checkbox2(member.name, member.name, member.name, this.par.par.pk),'start');
        this.getByTitle2('removecontact').create2(new CheckboxSubmit2('Remove member', 'removecontact', 'remove_contact_from_group'),'end');
      }
    }
    for (var contact of root.getByTitle2('members').items) {
      var found = false;
      for (var member of this.par.par.getByTitle2('members').items) {
        if (contact.name == member.name) {
          if(member.status == 'active' || member.status == 'inactive') {
            found = true;
            break;
          }
        }
      }
      if (found == false){
        this.getByTitle2('accordion').create2(new AccordionItem2('Invite contact','invitecontact'));
        this.getByTitle2('invitecontact').create2(new Checkbox2(contact.name, contact.name, contact.name, this.par.par.pk),'start');
        this.getByTitle2('invitecontact').create2(new CheckboxSubmit2('Invite contact', 'invitecontact', 'add_contact_to_group'),'end');
      }
    }
  }

  member() {

  }

}




class TextField extends Container {
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
    this.template = cloneHTML('text-field', this.title, this.title);
    this.body = this.template.getElementsByClassName('body')[0];
    this.body.innerHTML = this.displayName;
    this.property = null;
  }
};

class ChatNavBottom extends Container {
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
    this.template = cloneHTML('text-field', this.title, this.title);
    this.body = this.template.getElementsByClassName('body')[0];
    this.body.innerHTML = this.displayName;

  }
}




class EmptyContainer extends Container {
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
    this.template = cloneHTML('empty-container', this.title, this.title);
    this.body = this.template.getElementsByClassName('body')[0];
  }
}






class HeaderTitle extends Container{
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
    this.template = cloneHTML('container-justify-between', this.title, this.title.toLowerCase());
    this.body = this.template.getElementsByClassName('body')[0];
  }

  meta() {
    for (var member of this.par.par.getByTitle2('members').items) {
      if (member.status == 'active' || member.status == 'inactive' || member.status == 'blockHed') {
        this.create2(new HeaderTitleMember(member.name, member.name));
      }
    }
  }
}

class HeaderTitleMember extends Container{
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
    this.template = cloneHTML('container-justify-between', this.title, this.title.toLowerCase());
    this.body = this.template.getElementsByClassName('body')[0];
  }

  meta(){
    this.create2(new Username(this.title,'username'));
    this.create2(new LastSeen('00:00','lastseen'))
  }
}




class Clickable extends Container {
  constructor(displayName, title) {
    super(displayName, title);
    this.clicks = 0;
    this.active = true;
    this.selected = false;

  }



  setTemplate(template) {
    this.template = template;
    //this.template.setAttribute('tabindex', '0');
    //this.template.setAttribute('onclick', 'clickable(this,event);');
  }

  click() {
    this.select();
    this.send();
    this.toggle();
    this.request();


    /*
    var object = this;
    var methodList = new Set();
    while (true) {
      var superConstructor = Object.getPrototypeOf(object);
      if (superConstructor != null) {
        if (superConstructor.constructor.name == 'Clickable') {
          break;
        }
        object = superConstructor;
          for (var method of Object.getOwnPropertyNames(object)) {
              methodList.add(method);
        }
      }
    }

    if (this.active) {
      for (var method of methodList) {
        if (method == 'constructor' || method == 'meta' || method == 'response' ||
         method == 'validateInput' || method == 'sendActivity' || method == 'on' || method == 'off' || method =='onResize') {

        } else {
          this[method]();
        }
      }
    }
    */
  }

  request() {};
  targets() {};
  select() {};
  send() {};
  toggle() {};

  hide() {
    this.active = false;
    this.template.style.display = "none";
  }

  show() {
    this.active = true;
    this.template.style.display  = "block";
  }
}


class TypingInput extends Container {
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
    this.self = this;
    this.template = cloneHTML("chat-nav-bottom-active", this.title, this.title);
    this.body = this.template.getElementsByClassName('body')[0];
  }
  meta() {
    this.create2(new EmptyContainer('Activity', 'activity'));
    this.create2(new JustifyContentBetween('Bottom', 'bottom'));
    this.getByTitle2('bottom').create2(new InputField('Input', 'input'));
    this.getByTitle2('bottom').create2(new EmptyContainer('Right', 'right'));
    this.getByTitle2('right').create2(new SendButton('Send', 'send'), 'end');
    this.getByTitle2('send').hide();
  }
}

class Chatlog extends Container {
  constructor(displayName, title) {
    super(displayName, title);
    this.template = cloneHTML('chat-log-container', this.title, this.title);
    this.body = this.template.getElementsByClassName('body')[0];
  }
}




class InputField extends Clickable {
  constructor(displayName, title) {
    super(displayName, title);
    this.setTemplate(cloneHTML("chat-input", this.title, this.title.toLowerCase()));
    this.template.setAttribute('onkeyup', 'clickable(this,event);event.stopPropagation();');
    this.template.setAttribute('onclick', '');
    this.body = this.template;
    this.typing = false;
  }

  send() {
    var kcode = (window.event) ? event.keyCode : event.which;
    if (this.validateInput(this.body.value)) {

      if (this.typing == false) {
        console.log('SEND I AM TYPING2');
        this.sendActivity('yes');
        this.typing = true;
      }

      this.par.getByTitle2('send').show();
      if (kcode === 13) {
        console.log('typing!!mofo')
        socket.send(JSON.stringify({
          'type': 'message', 'message': this.body.value, 'from': username, 'to':this.par.par.par.pk
        }));
        this.body.value = '';
        this.par.getByTitle2('send').hide();

        if (this.typing == true) {
          console.log('SEND STOPPED TYPING');
          this.sendActivity('no');
        this.typing = false;
        }
      }
    } else {
      this.par.getByTitle2('send').hide();
      if (this.typing == true) {
        console.log('SEND STOPPED TYPING');
        this.sendActivity('no');
      this.typing = false;
      }
    }
  }

  validateInput(input) {
    var str = input;
    if (str.length != 0) {
      if (!str.replace(/\s/g, '').length) {
        return false;
          console.log('White space!')
      }
       return true;
    }
  }

  sendActivity(yesOrNo) {
   socket.send(JSON.stringify({
     'type': 'activity', 'message':yesOrNo, 'from': username, 'to':this.par.par.par.pk
    }));
  }
}



class BasicButton extends Clickable{
  constructor() {
    super(arguments[0], arguments[1]);
    this.setTemplate(cloneHTML('button-basic', this.title, this.title.toLowerCase()));
    this.body = this.template.getElementsByClassName('body')[0];
    this.checkbox = this.template.getElementsByClassName('checkbox')[0];

  }

  addChildren(){}

  setInnerHTML(){
    this.body.innerHTML = this.displayName;
  };

  request() {
    console.log('DO SOMETHING BASIC', this.title)
  }
}


class Center extends EmptyContainer {
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
  super(displayName, title, minItems, ani, displayType);
  this.template.style.position = "absolute";
  this.leftSidebarW = 0;
  this.righSidebarW = 0;
  }

  foo() {
    this.updateD();
  }


  updateD() {
    if (this.par.leftSidebar != null) {
      this.leftSidebarW = this.par.leftSidebar.width;
    }
    if (this.par.rightSidebar != null) {
      this.righSidebarW = this.par.rightSidebar.width;

    }
    this.setHeight(this.par.template.getBoundingClientRect().height);
    this.setWidth(this.par.template.getBoundingClientRect().width - this.leftSidebarW - this.righSidebarW);
    this.setMarginLeft(this.leftSidebarW);
    for (var child of this.items) {
      child.updateD();
    }
  }
};




class Switch extends EmptyContainer {
constructor(displayName, title, minItems=0, ani=null, displayType='') {
  super(displayName, title, minItems, ani, displayType);
    this.template.style.position = "absolute";
    this.template.style.overflow = "hidden";
    this.setWidth(300);


    this.body.style.zIndex = "1";
  }

  foo(){
    this.updateD();
  }

  updateD() {
    this.setHeight(this.par.par.template.getBoundingClientRect().height);


  }
}

class SwitchInheret extends EmptyContainer {
constructor(displayName, title, minItems=0, ani=null, displayType='') {
  super(displayName, title, minItems, ani, displayType);
    this.template.style.position = "absolute";
    this.template.style.overflow = "hidden";
    this.body.style.zIndex = "1";
  }

  updateD() {
    this.setWidth(this.par.template.getBoundingClientRect().width);
    this.setHeight(this.par.template.getBoundingClientRect().height);
    for (var child of this.items) {
     child.updateD();
    }
  }
}




class SwitchMenu extends EmptyContainer {
constructor(displayName, title, minItems=0, ani=null, displayType='') {
  super(displayName, title, minItems, ani, displayType);
  }
}


class ToggleAbsoluteRelative extends EmptyContainer {
  constructor(displayName, title, minItems=0, width=null) {
    super(displayName, title, minItems, null, '');
    this.width = width;
    this.template.style.zIndex = '1';
    this.template.style.position = 'absolute';

  }

  meta(){
    this.onResize();
  }

  onResize(self=this) {

    if (self.ww != window.innerWidth) {
      self.ww = window.innerWidth;
      if (window.innerWidth > this.width) {
        self.template.style.position = 'relative';
      } else {
        self.template.style.position = 'absolute';
      }
    }
    if (self.resizeHandle == null) {
      self.resizeHandle = setInterval(self.onResize, 20, this);
    }
  }
}




class ChildSizeContainer extends EmptyContainer{
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
  }

  meta(){
    this.update();
  }

  update(self=this) {

    if (self.items.length != 0) {
      if (typeof self.items[0].template.getBoundingClientRect() !== 'undefined') {
        self.childWidth = self.items[0].body.getBoundingClientRect().width;
        self.template.style.width = self.childWidth +'px';
      }
    }
    if (self.updateHandle == null) {
      self.updateHandle = setInterval(self.update, 20, this);
    }
  }
}

class Stage extends EmptyContainer {
constructor(displayName, title, minItems=0, ani=null, displayType='') {
  super(displayName, title, minItems, ani, displayType);
  this.setWidth(100, "%");
  this.setHeight(100, "%");
  this.setBackground("black");
  }

  tickerHook() {
  //  console.log(this.title, 'alala')
  }

  update(self=this) {
    //console.log()
  //  self.body.style.left = (window.innerWidth/2) - (self.body.getBoundingClientRect().width/2) + "px";
  //  self.body.style.top = (window.innerHeight/2) - (self.body.getBoundingClientRect().height/2) + "px";
  //  if (self.updateHandle == null) {
  //    self.updateHandle = setInterval(self.update, 20, this);
  //  }

  }
}

class FlexBox extends EmptyContainer {
constructor(displayName, title, minItems=0, ani=null, displayType='') {
  super(displayName, title, minItems, ani, displayType);
  this.template = cloneHTML("flex-box", this.title,this.title);
  this.body = this.template.getElementsByClassName('body')[0];
  }


  setMargin(n) {
    this.template.style.marginLeft = n + "px";
    for (var child of this.items) {
      if (this.isContructor(child, 'Switch')) {
         //child.template.style.width = this.template.getBoundingClientRect().width + "px";
      }
    }
  }

  childCreated(child) {
     if (this.isContructor(child,'Switch')) {
       this.inerehetDimenensions.push(child);
       if (this.inheretHandler == null) {
      //  this.inheret();
       }
    }
  }
}

class Display extends FlexBox {
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
    this.template = cloneHTML("flex-box", this.title,this.title);
    this.body = this.template.getElementsByClassName('body')[0];
    this.template.style.backgroundColor = "magenta";
    this.body.style.backgroundColor = "green";
  //  this.template.style.padding = "10px";


  }
}

class DisplayContainer extends EmptyContainer {
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
    this.template.style.backgroundColor = "black";
    this.template.style.padding = "100px";
    this.template.style.position = "absolute";
    this.template.style.overflow = "hidden";
  //  this.template.style.padding = "10px";

    this.p = 0;
    this.vp = 0;
    this.targetP = 0;
    this.marginX2 = 0;
    this.a = 0;
    this.targetA = 0;

  }

  meta(){

  }


  test(w,h) {
    if (this.animationName == "easeOutLeft") {
      this.targetX = 0;
      this.targetP = 100;
      this.targetA = 0;
    } else if (this.animationName == "easeOutRight") {
      this.targetX = 0;
      this.targetP = 0;
      this.targetA = 1;
    }

    this.w = this.template.getBoundingClientRect().width;
    this.xDif = this.targetX - this.x;
    this.pDif = this.targetP - this.p;
    this.aDif = this.targetA - this.a;
    this.vx = this.xDif * 0.2;
    this.vp = this.pDif * 0.2;
    this.va = this.aDif * 0.2;
    //console.log('HHH', this.vx)

      this.p += this.vp;
      this.x += this.vx;
      this.a += this.va;

      //console.log('asdl;kasdfl;jkasdfjkl;', this.a)
    this.template.style.opacity = this.a;
    //this.template.style.padding = this.p + "px";
    this.template.style.left = this.x + "px";

    this.marginXTarget = 0 - this.template.getBoundingClientRect().width;

  //  console.log('2',this.marginX2)
    this.template.style.width = w + "px";


    this.template.style.height = h + "px";

  // console.log('B',this.leftPreset, this.marginX2);
  //  this.template.style.marginLeft = this.marginX2 + "px";
  }
}


class Display2 extends FlexBox {
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
    this.template.style.backgroundColor = "white";
    this.template.style.padding = "10px";
    this.body.style.position = "relative";


  }
  meta(){
    //this.update()
  }

  setMargin(n) {
    this.template.style.marginLeft = n + 'px';

    for (var childs of this.items) {
      var parWdith = this.template.getBoundingClientRect().width;
     childs.template.style.width = parWdith + 'px';
    }
  }


  update(self=this) {
    for (var child of self.items) {
      child.test(self.template.offsetWidth,self.template.offsetHeight);
    }

    if (self.updateHandle == null) {
      self.updateHandle = setInterval(self.update, 0, this);
    }
  }

  create2(object, index='end') {

    if (this.checkCurrentDir(object.title) == false) {

      var objectBox = new DisplayContainer('Box', object.title + 'box')
      this.items.push(objectBox);
      objectBox.setParent(this.self);

      object.setParent(this.self);

      objectBox.create2(object);

      objectBox.template.style.opacity = "0";
      objectBox.template.style.zIndex = "0";

     if (this.items.length == 1) {

      //  object.show();
    //    object.clearAni();
    //    object[this.ani[0]]();
    } else {



    }


      if (objectBox.template != null) {
        if (this.body != null) {
          if (index == 'end') {
            this.body.appendChild(objectBox.template);
          } else if (index == 'start') {
            this.body.insertBefore(objectBox.template,this.body.firstChild);
          }
        }
      }
    }
    return object;
  }




    deselect(title) {

      for (var item of this.items) {
        if (title == item.title) {

            if(item.selected == true) {
              console.log('DESELECT')
              item.template.style.zIndex = "0";
              //item.template.style.opacity = "0";
            //  item.template.style.margin = "10px";
            //  item.template.style.padding = "20px";
            //  item.template.style.backgroundColor = "green";

                if (this.ani != null) {
                  //console.log('JAJAJA', item.intervalHandle);
                  item.off();
                  item.clearAni();
                  item[this.ani[1]]();



                } else {
                    item.off();
                  item.hide();

                }

             }

         }
      }
    }

    select(title) {
      for (var item of this.items) {
        if (title == item.title) {
          if(item.selected == false) {
              console.log('SELECt!!!!', item.title)
            ///item.template.style.margin = "0px";
          //  this.selectedChild = item;
           item.template.style.opacity = "1";
            item.template.style.zIndex = "1";
          //  item.template.style.backgroundColor = "magenta";
          //  item.template.style.padding = "0px";
            if (this.ani != null) {
            //  item.show();
              item.on();
              item.clearAni();
              item[this.ani[0]]();

            } else {
              //item.show();
              item.on();
            }


          }

        } else {
          if(item.selected == true) {
          //  console.log('itm', item.title)
            this.deselect(item.title)
          }
        }

      }
    }


}


class Page extends FlexBox {
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
  }

  updateD() {
    this.setWidth(this.par.template.getBoundingClientRect().width);
    for (var child of this.items) {
      if (this.isContructor(child, 'Center')) {
        child.updateD();
      }
    }
  }
};


class PageLeftCenter extends Page {
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
  }

  meta() {




    this.center = this.create2(new Center('wtf', 'center'));
    this.leftSidebar = this.create2(new LeftSidebar('Left container', 'leftcontainer')).getByTitle2('body');

  }
};

class PageRightCenter extends Page {
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
  }

  meta() {
    this.center = this.create2(new Center('wtf', 'center'));
    this.rightSidebar = this.create2(new RightSidebar('Left container', 'leftcontainer')).getByTitle2('body');
  }
};



class MaxDimensions extends EmptyContainer {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, null, '');
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.availableWidth = 0;
    this.availableHeight = 0;
    this.width = maxWidth;
    this.setBorder(0)
    this.setBackground("black");
    this.setPosition("absolute");
  }

  meta() {

    if (this.template != null) {
      this.template.classList.add('n/' + this.n);
      this.template.setAttribute('tabindex', '0');
    }


    this.resize();
    this.addChildren();
  }

  tickerHook(){
    if (this.animation != null) {
      this[this.animation[0]](this.animation[1]);
    }
  }

  addChildren() {}

  resizeHook() {
    this.updateAvailableWidth();
    this.updateAvailableHeight();
    this.updateSize();
    this.updatePos();
    this.metaUpdate();
  }

  updateAvailableWidth() {
    this.availableWidth = this.par.getInnerWidth() - (this.margin*2);

  }
  updateAvailableHeight() {
    this.availableHeight = this.par.getInnerHeight() - (this.margin*2);
  }

  updateSize() {
    this.setMargin(this.margin)
    if (this.maxWidth < this.availableWidth ) {
      this.setWidth(this.maxWidth);
    } else {
      this.setWidth(this.availableWidth);
    }
    if (this.maxHeight < this.availableHeight) {
      this.setHeight(this.maxHeight);
    } else {
      this.setHeight(this.availableHeight);
    }
  }

  updatePos() {
    this.setLeft(((this.par.getWidth()/2) - (this.getWidth()/2)));
    this.setTop((this.par.getHeight()/2) - (this.getHeight()/2));
  }

  metaUpdate(){}
};

class Stack extends MaxDimensions {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight, x=0, y=0, positions={}) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.selectedChild = null;
    this.storedMaxWidth = maxWidth;

    this.template.style.overflow = 'hidden';
    this.setBackground('black');

    this.animations = [];


    this.left = x;
    this.top = y;

    this.notSelectedChildX = 0;
    this.notSelectedChildY = 0;
    this.selectedChildX = 0;
    this.selectedChildY = 0;

    for (var posName of ['notSelectedChildX', 'notSelectedChildY']) {
      for (var position in positions) {
        if (position == posName) {
          this[posName] = positions[position];
        }
      }
    }
  }


  checkSomething(value){
    if (typeof value != 'number'){
      return this[value[0]]() * value[1];
    } else {
      return value;
    }
  }


  updateAvailableHeight() {
    this.availableHeight = this.par.getHeight() - this.top;
  }

  create2(item, insert='end') {

    if (this.items.length == 0) {
      item.left = this.selectedChildX;
      item.top = this.selectedChildY;
      item.selected = true;
      item.setZ(1);
    } else {
      item.selected = false;
      item.left = this.checkSomething(this.notSelectedChildX);
      item.top = this.checkSomething(this.notSelectedChildY);
      item.setOpacity(0);
      item.opacity = 0;
      item.setZ(0);


    }

    this.items.push(item);
    this.setParent(item);
    if (insert == 'end') {
      this.body.appendChild(item.template);
    } else if (insert == 'start') {
      this.body.insertBefore(item.template, this.body.firstChild);
    }
    item.meta();
    return item;
  }

  selectChild(title) {
    if (this.getByTitle2(title).selected == false) {
      this.getByTitle2(title).selected = true;


      this.getByTitle2(title).animate(['moveH',this.selectedChildX]);
      this.getByTitle2(title).animate(['moveV',this.selectedChildY]);
      //this.getByTitle2(title).margin = 0;
      //this.getByTitle2(title).animate(['moveM',0]);
      this.getByTitle2(title).animate(['moveO',100]);
      this.getByTitle2(title).setZ(1);


      for (var child of this.items) {
        if (child.selected == true && child !=  this.getByTitle2(title)) {
          this.deselectChild(child.title);


        }
      }
    }
    //console.log('this', this.getByTitle2(title))
  }

  deselectChild(title) {
    this.getByTitle2(title).selected = false;
    this.getByTitle2(title).animate(['moveH',this.notSelectedChildX]);
    this.getByTitle2(title).animate(['moveV',this.notSelectedChildY]);
    //this.getByTitle2(title).animate(['moveM',50]);
    this.getByTitle2(title).animate(['moveO',0]);
    this.getByTitle2(title).setZ(0);
  }


  updatePos() {
    this.setLeft(this.left);
    this.setTop(this.top);
  }


}



class Menu2 extends MaxDimensions {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.setBackground("white");
    this.setBorder(0)
    this.template.style.overflow = 'auto';
    this.animations = [];
    this.lockV = false;


  }

  tickerHook(){

    for (var animation of this.animations) {
      this[animation[0]](animation[1]);
    }
    if (this.left == this.par.checkSomething(this.par.notSelectedChildX)) {
      this.lockH = true;
    }
    if (this.top == this.par.checkSomething(this.par.notSelectedChildY)) {

      this.lockV = true;
    }
  }

  updatePos() {
    if (this.lockH == true) {
      this.left = this.par.checkSomething(this.par.notSelectedChildX);
    }
    if (this.lockV == true) {
      this.top = this.par.checkSomething(this.par.notSelectedChildY);
    }

    this.setTop(this.top);
    this.setLeft(this.left);
    this.setOpacity(this.opacity)
  }
}




class MaxDimensionsNormal extends MaxDimensions {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight, header=0, footer=0) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.setBackground("white");
    this.template.style.overflow = 'auto';

    this.marginTop = 0;
    this.marginLeft = 0;
    this.footer = footer;
    this.header = header;

  }


  updateAvailableWidth() {
    this.availableWidth = this.par.getInnerWidth() - (this.margin*2) - (this.marginLeft);

  }
  updateAvailableHeight() {
    this.availableHeight = this.par.getInnerHeight() - (this.margin*2) - (this.header) - this.footer;
  }

  updatePos() {
    this.setTop(this.top + this.header);
    this.setLeft(this.left);
  }
}


class Footer extends MaxDimensionsNormal {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight, bottom=0) {
    super(displayName, title, minItems, maxWidth, maxHeight, 0, 0);
    this.setBackground('magenta');

    this.bottom = bottom;
  }
  updatePos() {
    this.template.style.bottom = this.bottom + 'px';
  }
}


class ChatsMenu2 extends Menu2 {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.template.style.overflowX = 'hidden';

  }
  addChildren() {

    this.main = this.create2(new MaxDimensionsNormal('main', 'main',0, this.maxWidth, this.maxHeight))
    this.main.setBackground('white');
    this.main.template.style.backgroundColor = 'white';
    this.main.footer = 50;
    this.main.template.style.overflowY = 'auto';
    this.footer = this.create2(new JustifyCenter('Footer', 'footer'));
    this.footer.template.style.width = '100%';
    this.footer.setPosition('absolute');
    this.footer.template.style.bottom = 0 + "px";
    this.footer.template.style.padding = 4 + "px";
    this.footer.template.style.backgroundColor = 'white';

    this.findContactButton = this.footer.create2(new StackButton('New chat', 'addcontact','menustack', 'contactsmenu'));
    this.findContactButton.template.style.borderRadius = '5px';


  }
}





class ContactsMenu2 extends Menu2 {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.template.style.overflowX = 'hidden';
    this.template.style.backgroundColor = 'white';
  }
  addChildren() {

    this.main = this.create2(new MaxDimensionsNormal('main', 'main',0, this.maxWidth, this.maxHeight-50))
    this.main.footer = 50;
    this.main.template.style.overflowY = 'auto';
    this.footer = this.create2(new JustifyCenter('Footer', 'footer'));
    this.footer.template.style.width = '100%';
    this.footer.setPosition('absolute');
    this.footer.template.style.bottom = 0 + "px";
    this.footer.template.style.padding = 4 + "px";
    this.footer.template.style.backgroundColor = 'white';


    this.findContactButton = this.footer.create2(new StackButton('Add contact', 'addcontact','menustack', 'findcontactmenu'));
    this.findContactButton.template.style.borderRadius = '5px';

  }
}

class CreateGroupMenu extends Menu2 {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.template.style.overflow = 'hidden';
  }
  addChildren() {
    this.main = this.create2(new MaxDimensionsNormal('main', 'main',0, this.maxWidth, this.maxHeight-50))
    this.main.footer = 50;
    this.main.template.style.overflowY = 'auto';
    this.footer = this.create2(new JustifyCenter('Footer', 'footer'));
    this.footer.template.style.width = '100%';
    this.footer.setPosition('absolute');
    this.footer.template.style.bottom = 0 + "px";
    this.footer.template.style.padding = 4 + "px";
    this.footer.template.style.backgroundColor = 'white';


    this.createGroupBtn = this.footer.create2(new CheckboxSubmit2('Create group', 'creategroup', 'create_group'));
    this.createGroupBtn.template.style.width = 'auto';
    this.createGroupBtn.template.style.padding = '9px';
    this.createGroupBtn.template.style.borderRadius = '5px';
  //  this.createGroup = this.footer.create2());


  }
}



// active checkbox
class CheckboxAdmin extends Clickable{
  constructor() {
    super(arguments[0], arguments[1]);
    this.setTemplate(cloneHTML('checkbox-basic', this.title, this.title.toLowerCase()));
    this.body = this.template.getElementsByClassName('body')[0];
    this.checkbox = this.template.getElementsByClassName('checkbox')[0];
    this.value = Array.prototype.slice.call(arguments, 2);
    this.submitButton = null;

  }

  addChildren() {
    //this.create2(new Username(this.title,this.title+'name'));
  }

  toggle() {
    const submit = this.par.getChildren('constructor', 'CheckboxSubmitAdmin')[0];

    if (this.checkbox.checked) {
      this.checkbox.checked = false;
      submit.checks += 1;
    } else {
      this.checkbox.checked = true;
      submit.checks -=1 ;
    }
    if (submit.checks != 0) {
      submit.show();
    } else {
      submit.hide();
    }
  }

  request() {
  }
}


class CheckboxSubmitAdmin extends BasicButton{
  constructor(displayName, title, action) {
    super(displayName, title);
    this.setTemplate(cloneHTML('submit-selected', this.title, this.title, this.action));
    this.body = this.template.getElementsByClassName('body')[0];
    this.body.innerHTML = this.displayName;
    this.action = action;
    this.checks = 0;
    this.values = [];
    this.body.style.paddingLeft = '15px';
    this.body.style.paddingTop = '10px';
    this.body.style.paddingBottom= '10px';

    this.hide();
  }
  addChildren() {

  }

  checked() {
    this.values = [];
    const checkboxes = this.par.par.getChildren('constructor', 'CheckboxAdmin');
    for (var checkbox of checkboxes) {
      if(checkbox.checkbox.checked) {
        this.values.push(checkbox.value);
      }
    }
  }

  request() {
    this.checked();
    console.log('ACTION!', this.action, this.values, this.dir)
    socket.send(JSON.stringify({
      'type':this.action, 'message':this.values, 'dir':this.dir, 'from': username
    }));
    this.hide();
  }


  loader() {
    this.create2(new Spinner('Spinner', 'spinner'));
  }

  response() {
      this.removeByTitle('spinner')
      this.hide();
      this.checks = 0;
  }

}


class LogoutButton extends BasicButton{
  constructor(displayName, title, action) {
    super(displayName, title);
    this.body.innerHTML = 'Logout';
  }

  request() {
    window.location.replace("http://127.0.0.1:8000/logout/");
  }

}





class DeleteChatButton extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1], arguments[2]);
    this.body.innerHTML = this.displayName;
    this.pk = arguments[2];
  }

  request() {
    socket.send(JSON.stringify({
      'type': 'update_membership_of_self', 'message': {'pk':this.pk,'membership':{'status':'deleted'}}, 'from': from
    }));
    root.getByTitle2('chats').removeByTitle('chat' + this.pk);
    root.getByTitle2('chatsmenu').main.removeByTitle('chat' + this.pk);
  }
}

class OpenOptionsButton extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1], arguments[2]);
    this.body.innerHTML = this.displayName;
    this.pk = arguments[2];
  }

  isActive(){}

  isNotActive(){}

  request() {

    var chat = root.getByTitle2('chats').getByTitle2('chat' + this.pk);
    chat.getByTitle2('sidebarbuttonright').select();
  }
}





class BlockChatButton extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1], arguments[2]);

    this.pk = arguments[2];

  }

  addChildren(){
    console.log('status for button', this.par.par.par.par.par.getMemberStatus())
    if (this.par.par.par.par.par.getMemberStatus() == 'blocked') {
      this.body.innerHTML = 'Unblock';
        this.par.par.par.par.par.getByTitle2('chatinput').getByTitle2('input').template.disabled = true;
          this.par.par.par.par.par.getByTitle2('chatinput').getByTitle2('input').template.innerHTML = '';
    } else {
      this.body.innerHTML = 'Block';

      this.par.par.par.par.par.getByTitle2('chatinput').getByTitle2('input').template.disabled = false;
      this.par.par.par.par.par.getByTitle2('chatinput').getByTitle2('input').template.innerHTML = '';
    }
  }

  request() {

    if (this.par.par.par.par.par.getMemberStatus() == 'blocked') {
      socket.send(JSON.stringify({
        'type': 'update_membership_of_self', 'message': {'pk':this.pk,'membership':{'status':'active'}}, 'from': from
      }));
      this.body.innerHTML = 'Block';
      this.par.par.par.par.par.getByTitle2('chatinput').getByTitle2('input').template.innerHTML = '';

     this.par.par.par.par.par.getByTitle2('chatinput').getByTitle2('input').template.disabled = false;


    } else {
      socket.send(JSON.stringify({
        'type': 'update_membership_of_self', 'message': {'pk':this.pk,'membership':{'status':'blocked'}}, 'from': from
      }));
      this.body.innerHTML = 'Unblock';
      this.par.par.par.par.par.getByTitle2('chatinput').getByTitle2('input').template.value = '';
      this.par.par.par.par.par.getByTitle2('chatinput').getByTitle2('input').template.disabled = true;
      this.par.par.par.par.par.getByTitle2('chatinput').getByTitle2('input').par.par.button.hide();


    }

  }

}

class LeaveChatButton extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1], arguments[2]);
    this.body.innerHTML = 'Leave';
    this.pk = arguments[2];
  }

  request() {
    socket.send(JSON.stringify({
      'type': 'update_membership_of_self', 'message': {'pk':this.pk,'membership':{'status':'left'}}, 'from': from
    }));

  }
}





class ChatsOptionsMenu2 extends MaxDimensionsNormal {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.template.style.overflowX = 'hidden';
    this.template.style.overflowY = 'auto';
  }

  addChildren() {
    this.menuStack = this.create2(new Stack('Options','options' + this.par.par.title,0, 1100, 700, 0, 0, {'notSelectedChildY':['getHeight',-1] }));


    if (this.par.par.getMemberRole() == 'admin'){
      this.admin();
    } else {
      this.member();
    }

  }

  admin() {
    this.menuStack.create2(new OptionsMenuMember('Main','main',1100, 1100, 700));
    this.menuStack.create2(new AdminMenuGroup('Members','members',1100, 1100, 700));
  }

  member() {
      this.menuStack.create2(new OptionsMenuMember('Main','main',1100, 1100, 700));
  }
}

class OptionsMenuMember extends Menu2 {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.template.style.overflowX = 'hidden';
    this.template.style.backgroundColor = "#eeeeee";
  }
  addChildren() {
    this.deleteButton = this.create2(new DeleteChatButton('Delete chat','deletechat', this.par.par.par.par.pk));
    this.deleteButton.template.style.marginTop = '50px';
    this.deleteButton.body.innerHTML = 'Delete chat';

    if (this.par.par.par.par.type == 'group') {
      if (this.par.par.par.par.getMemberStatus() == 'active' || this.par.par.par.par.getMemberStatus() == 'inactive') {
        this.create2(new LeaveChatButton('Delete chat','leavechat', this.par.par.par.par.pk));
      } else if(this.par.par.par.par.getMemberStatus() == 'left') {
              this.par.par.par.par.getByTitle2('chatinput').getByTitle2('input').template.disabled = true;
              this.par.par.par.par.getByTitle2('chatinput').getByTitle2('input').template.innerHTML = '';
      }
    } else {
      this.blockButton = this.create2(new BlockChatButton('Delete chat','blockchat', this.par.par.par.par.pk));
    }


    if (this.par.par.par.par.getMemberRole() == 'admin') {
      this.create2(new StackButton('Options', 'button4','options' + this.par.par.par.par.title, 'members'))
    }

  }
}


class AdminMenuGroup extends Menu2 {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.template.style.overflowX = 'hidden';
    this.template.style.backgroundColor = "#eeeeee";


  }
  addChildren() {
    this.back = this.create2(new StackButton('Back', 'back','options' + this.par.par.par.par.title, 'main'))
    this.back.template.style.marginTop = '50px';


    this.makeAdminTxt = this.create2(new TextField('Make admin', 'makeadmintext'))
    this.makeAdminTxt.template.style.padding = '10px';
    this.makeAdminTxt.template.style.marginTop = '10px';
    this.makeAdmin = this.create2(new EmptyContainer('Make admin','makeadmin'));
    this.makeAdmin.create2(new CheckboxSubmitAdmin('Make admin','makeadmin','make_contact_group_admin'));
    this.removeAdminTxt = this.create2(new TextField('Remove admin', 'removeadmintext'))
    this.removeAdminTxt.template.style.padding = '10px';
    this.removeAdminTxt.template.style.marginTop = '10px';
    this.removeAdmin = this.create2(new EmptyContainer('Remove admin','removeadmin'));
    this.removeAdmin.create2(new CheckboxSubmitAdmin('Remove admin','removeadmin','remove_contact_group_admin'));

    this.removeMemberTxt = this.create2(new TextField('Remove member', 'removemembertext'))
    this.removeMemberTxt.template.style.padding = '10px';
    this.removeMemberTxt.template.style.marginTop = '10px';
    this.removeMember = this.create2(new EmptyContainer('Remove member','removemember'));
    this.removeMember.create2(new CheckboxSubmitAdmin('Remove member','removemember','remove_contact_from_group'));
    this.inviteMemberTxt = this.create2(new TextField('Invite member', 'invitemembertext'))
    this.inviteMemberTxt.template.style.padding = '10px';
    this.inviteMemberTxt.template.style.marginTop = '10px';
    this.inviteMember = this.create2(new EmptyContainer('Remove member','invitemember'));
    this.inviteMember.create2(new CheckboxSubmitAdmin('Ivite member','invitemember','add_contact_to_group'));


    for (var member of this.par.par.par.par.members.items) {
      if (member.role == 'admin') {
        if (member.status == 'active' || member.status == 'inactive') {
          var checkbox = this.removeAdmin.create2(new CheckboxAdmin(member.displayName, member.title, member.displayName, this.par.par.par.par.pk),'start')
          checkbox.body.innerHTML = member.displayName;
        }
      }

      else if (member.role == 'member') {
        if (member.status == 'active' || member.status == 'inactive') {
          var checkbox = this.makeAdmin.create2(new CheckboxAdmin(member.displayName, member.title,member.displayName, this.par.par.par.par.pk),'start')
          checkbox.body.innerHTML = member.displayName;
        }
      }

      if (member.status == 'active' || member.status == 'inactive') {
        var checkbox = this.removeMember.create2(new CheckboxAdmin(member.displayName, member.title,member.displayName, this.par.par.par.par.pk),'start')
        checkbox.body.innerHTML = member.displayName;
      }
    }


    for (var contact of root.getByTitle2('contactsmenu').main.items) {
      var found = false;

      for (var member of this.par.par.par.par.members.items) {
        if (contact.displayName == member.displayName) {
          if(member.status == 'active' || member.status == 'inactive') {
            found = true;
            break;
          }
        }
      }
      if (found == false){
        var checkbox = this.inviteMember.create2(new CheckboxAdmin(contact.displayName, contact.title, contact.displayName, this.par.par.par.par.pk),'start')
        checkbox.body.innerHTML = contact.displayName;
      }
    }



  }


}




class ChatInputField extends Clickable {
  constructor(displayName, title) {
    super(displayName, title);
    this.setTemplate(cloneHTML("chat-input", this.title, this.title.toLowerCase()));
    this.template.setAttribute('onkeyup', 'clickable(this,event);');
    this.template.setAttribute('onclick', '');
    this.body = this.template;
    this.inputValidated = false;
    this.typing = false;
  }

  addChildren() {}


  send() {
    var kcode = (window.event) ? event.keyCode : event.which;
    if (this.validateInput(this.body.value)) {

      this.par.par.button.show();
      this.startedTyping();

      var str = this.body.value;
        for (var i = 0; i < str.length; i++) {
          if (str[i] === '\n' || str[i] === '\r') {
              this.inputValidated = true;
              this.stoppedTyping();
          };
      };


    } else {
      this.inputValidated = false;
      this.par.par.button.hide();
      this.stoppedTyping();
    }

  }

  startedTyping() {
    if (this.typing == false) {
      this.typing = true;
      socket.send(JSON.stringify({
        'type': 'activity', 'message': 'yes', 'from': username, 'to':this.par.par.par.par.par.pk
      }));
    }

  }

  stoppedTyping() {
    if (this.typing) {
      this.typing = false;
      socket.send(JSON.stringify({
        'type': 'activity', 'message': 'no', 'from': username, 'to':this.par.par.par.par.par.pk
      }));
    }
  }

  request() {
    if (this.inputValidated) {
      socket.send(JSON.stringify({
        'type': 'message', 'message': this.body.value, 'from': username, 'to':this.par.par.par.par.par.pk
      }));
      this.body.value = '';
      this.par.par.button.hide();
      this.inputValidated = false;
    }
  }

  validateInput(input) {
    var str = input;
    if (str.length != 0) {
      if (!str.replace(/\s/g, '').length) {
        return false;
          console.log('White space!')
      }
       return true;
    }
  }
}


class ChatButton extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1]);
    this.body.innerHTML = this.displayName;
  }

  request() {

    socket.send(JSON.stringify({
      'type': 'message', 'message': this.par.items[0].body.value, 'from': username, 'to':this.par.par.par.par.par.pk
    }));
    this.par.items[0].body.value = '';
    this.par.par.button.hide();
    this.inputValidated = false;
  }
}


class ChatInput extends EmptyContainer {
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
    this.setBackground("black");
    this.template.style.height = '74px';
  }
  meta() {
    this.container = this.create2(new JustifyContentBetween('Bottom', 'bottom'));
    this.container.template.style.padding = "5px";
    this.container.create2(new ChatInputField('Input', 'input'));
    this.button = this.container.create2(new ChatButton('Send', 'send'),'end');
    this.button.template.style.height = "38px";
    this.button.body.innerHTML = "Send";
    this.button.hide();
  }
}



class SearchInputField extends Clickable {
  constructor(displayName, title) {
    super(displayName, title);
    this.setTemplate(cloneHTML("search-input", this.title, this.title.toLowerCase()));
    this.template.setAttribute('onkeyup', 'clickable(this,event);event.stopPropagation();');
    this.template.setAttribute('onclick', '');
    this.body = this.template;
    this.inputValidated = false;
    this.template.style.backgroundColor = '#eeeeee';
  }

  addChildren() {}

  send() {

    var kcode = (window.event) ? event.keyCode : event.which;
    if (this.validateInput(this.body.value)) {
      this.par.par.button.show();

            var str = this.body.value;
              for (var i = 0; i < str.length; i++) {
                if (str[i] === '\n' || str[i] === '\r') {
                    this.inputValidated = true;


                };
            };

    } else {
      this.inputValidated = false;
      this.par.par.button.hide();
    }
  }

  request() {
    if (this.inputValidated) {
      var text = this.body.value.replace(/[\r\n\v]+/g, '');
      socket.send(JSON.stringify({
        'type':'search', 'message':text, 'dir':this.dir
      }));
      this.body.value = '';
      this.par.par.button.hide();
      this.inputValidated = false;
    }
  }

  validateInput(input) {
    var str = input;
    if (str.length != 0) {
      if (!str.replace(/\s/g, '').length) {
        return false;
          console.log('White space!')
      }
       return true;
    }
  }
}


class SearchButton extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1]);
    this.body.innerHTML = this.displayName;
  }

  request(){


    var text = this.par.items[0].body.value.replace(/[\r\n\v]+/g, '');
    socket.send(JSON.stringify({
      'type':'search', 'message':text, 'dir':this.dir
    }));
    this.par.items[0].body.value = '';
    this.par.par.button.hide();
    this.inputValidated = false;
  }

  }




class SearchInput extends EmptyContainer {
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
    this.setBackground("white");
  }
  meta() {
    this.container = this.create2(new JustifyContentBetween('Bottom', 'bottom'));
    this.container.template.style.padding = "5px";
    this.container.create2(new SearchInputField('Input', 'input'));
    this.button = this.container.create2(new SearchButton('Send', 'send'),'end');
    this.button.template.style.height = "38px";
    this.button.body.innerHTML = "Search";
    this.button.hide();
  }
}




class FindContactMenu extends Menu2 {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.template.style.overflow = 'hidden';
  }
  addChildren() {
    this.main = this.create2(new MaxDimensionsNormal('Search results', 'searchresults', 0,1100, 1100));
    this.main.header = 50;
    this.main.template.style.overflowY = 'auto';
    this.header = this.create2(new SearchInput('main', 'main'));

  }
}




class StackButton extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1]);
    this.stack = arguments[2].toString().toLowerCase();
    this.stackItem = arguments[3].toString().toLowerCase();
    //this.template.setAttribute('onclick', 'clickable(this,event);');
    this.template.setAttribute('tabindex', '0');
    this.body.innerHTML = this.displayName.charAt(0).toUpperCase() + this.displayName.slice(1);;
    this.selected = false;
  }

  isNotActive(){}

  isActive(){}

  request(){
    if (this.selected == false) {
      this.selected = true;
      this.isActive();
      for (var item of this.par.items) {
        if (item.title != this.title) {
          item.selected = false;
          item.isNotActive();
        }
      }
    }

    root.getByTitle2(this.stack).getByTitle2(this.stackItem).lockH = false;
    root.getByTitle2(this.stack).getByTitle2(this.stackItem).lockV = false;
    root.getByTitle2(this.stack).selectChild(this.stackItem);
  }
}


class UserButton extends StackButton{
  constructor() {
    super(arguments[0], arguments[1], arguments[2],  arguments[3]);
    this.template.style.backgroundColor = 'white';
    this.template.style.fontStyle = 'bold';
    this.template.style.border = '0px';
    this.template.style.padding = '13px';
    this.template.style.marginLeft = '0px';
  }
}


class ResultsButton extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1]);
    this.body.innerHTML = this.displayName;
  }

  isNotActive(){}

  isActive(){}


  request(){
    //root.getByTitle2('menustack').selectChild('resultsContainer');
    socket.send(JSON.stringify({
      'type':'add_contact', 'message':this.displayName, 'dir':this.dir
    }));
    root.getByTitle2('menustack').selectChild('contactsmenu');
  }
}


class DeleteContactButton extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1], arguments[2]);
    this.body.innerHTML = this.displayName;
    this.value = arguments[2];
  }
  request(){
    socket.send(JSON.stringify({
          'type':'delete_contact', 'message':this.value, 'dir':this.dir
    }));
    root.getByTitle2('contactsmenu').getByTitle2('main').removeByTitle(this.value.toLowerCase());
  }
}


class MaxDimensionsCenter extends MaxDimensions {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.setBackground("green");
    this.setBorder(0);
    this.setZ(0);
  }

  updateAvailableWidth(){
      if (this.par.leftSidebar != null) {
        this.spaceLeft = (this.par.leftSidebar.getWidth()  + this.par.leftSidebar.left);
      } else {
        this.spaceLeft = 0;
      }
      if (this.par.rightSidebar != null) {
        this.spaceRight = (this.par.rightSidebar.getWidth() + this.par.rightSidebar.left)
      } else {
        this.spaceRight = 0;
      }


      if (this.par.getWidth() < (this.par.menuWidth*2)) {

        this.availableWidth = this.par.getWidth();
      } else {
        this.availableWidth =  this.par.getWidth() -
        (this.spaceLeft + this.spaceRight);
      }
  }

  updatePos() {
    if (this.par.getWidth() < (this.par.menuWidth*2)) {
      this.left = 0;
    } else {
      this.left = this.spaceLeft;
    }
  this.setLeft(this.left);
  }

  metaUpdate(){
    if (this.getWidth() < (this.par.menuWidth*2)) {
      for (var child of this.par.items) {
        if (this.par.selectedChild != null) {
          if (child != this.par.selectedChild) {
            //this.par.deselectChild(child.title);
          }
        }
      }
    }
  }
};


class SidebarButton extends Clickable{
  constructor() {
    super(arguments[0], arguments[1]);
    this.setTemplate(cloneHTML('button-basic', this.title, this.title.toLowerCase()));
    this.body = this.template.getElementsByClassName('body')[0];
    this.body.innerHTML = '...';
    this.template.style.borderRadius  = '10px';
    this.template.style.backgroundColor = "red";
    this.template.style.margin = "4px";
    this.template.style.marginLeft = "15px";
    this.setPosition('absolute');
  }

  addChildren() {
    this.updatePos();
  }

  select() {
    //console.log('unlockH', this.par.title)
    this.par.lockH = false;
    this.par.par.selectChild(this.par.title);
    this.selected = true;
  }

  resizeHook() {
    this.updatePos();
  }

  updatePos(){}
  request() {}
}


class SidebarLeftButton extends SidebarButton{
  constructor() {
    super(arguments[0], arguments[1]);
    //this.setZ(99)
    this.body.innerHTML = '╳';
    this.body.style.color = 'black';
    this.template.style.backgroundColor = 'transparent';
    this.template.style.border = '0px';
    this.template.style.paddingLeft = '0px'
    this.body.style.backgroundColor = 'transparent';



  }

  select() {
    if (this.par.selected == true) {
      this.body.innerHTML = '☰';
      this.body.style.color = 'white';
    } else {
      this.body.innerHTML = '╳';
      this.body.style.color = 'black';
    }

    this.par.lockH = false;
    this.par.par.selectChild(this.par.title);
  }


  updatePos(){



    if(this.par.par.getWidth() < 500) {

      console.log('JEKKMMMM2')
      this.template.style.visibility = 'visible';
    } else {

      this.template.style.visibility = 'hidden';
    }
    this.setLeft(0 - this.par.left)
    if (root.getByTitle2(username.toLowerCase()))



    if(this.par.par.getWidth() < 500) {
      root.getByTitle2('header').template.style.marginLeft = '30px';

    } else {
      root.getByTitle2('header').template.style.marginLeft = '0px';
      if (this.par.par.items[0].selected == false) {
        this.par.par.getByTitle2(this.par.title).left = 0;
        this.par.par.selectChild(this.par.title);
      }
    }
  }
}

class SidebarRightButton extends SidebarButton{
  constructor() {
    super(arguments[0], arguments[1]);
    this.setRight(0);
    this.selected = true;
    this.setZ(4)
    this.template.style.backgroundColor = '#eeeeee';
  }

  updatePos(){
    this.setRight(0 - this.par.left)
  }
}

class DropperBtn extends BasicButton {
  constructor(displayName, title, minItems=0){
  super(displayName, title, minItems);
  this.selected = false;
  this.body.innerHTML = '...';

}

  close(){
    this.selected = false;
    this.par.par.main.template.style.display = 'none';
  }

  request(){
    if (this.selected == false) {
      this.selected = true;
      this.par.par.main.template.style.display = 'block';
    } else {
      this.close();

    }

  }

}

class Dropper extends EmptyContainer {
  constructor(displayName, title, minItems=0){
  super(displayName, title, minItems);
  //this.template.style.backgroundColor= 'green';

  }

  meta(){
    this.container = this.create2(new EmptyContainer('wtf' ,'wtf'));
    this.container.template.style.margin = '4px';
    this.container.template.style.marginRight = '16px';

  //  this.container.template.style.marginTop = '16px';
    this.button = this.container.create2(new DropperBtn('wtf2' ,'wtf2'));
    this.button.template.style.border = 'e#####';
    this.button.template.style.borderRadius = '10px';
    this.main = this.container.create2(new EmptyContainer('123123', '1'))
    this.main.template.style.backgroundColor = 'green';
    this.main.template.style.position = 'absolute';
    this.main.template.style.zIndex = '2';
    this.main.template.style.right = '16px';
    this.main.template.style.display = 'none';
  }

}



class MaxDimensionsLeft extends MaxDimensions {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight, selected=true) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.setBackground("white");
    this.setBorder(0);
    this.setZ(3);
    this.lockH = false;
    this.lockV = false;
    this.selected = selected;
    this.animation = null;
    this.animations = [];

    if (this.selected) {
      this.left = 0;
    } else {
      this.left = this.maxWidth*-1;
    }
  }



  tickerHook() {

    for (var animation of this.animations) {
      this[animation[0]](animation[1]);
    }
    if (this.getWidth()*-1 == this.left) {
        this.lockH = true;
    }
  };



  addChildren() {
    this.create2(new SidebarLeftButton('asdf', 'asdf', 'asdf'));
  }

  updateAvailableWidth() {
    this.availableWidth = this.par.getWidth();
  }



  updatePos() {
    if (this.lockH) {
      this.left = this.getWidth()*-1;
      this.setLeft(this.left);
    } else {
      this.setLeft(this.left);
    }
    this.setTop(this.top);
  }


  set() {

    for(var child of this.par.getChildren('constructor', 'LeftCenterRight')) {
      if (child.rightSidebar != null) {
        if (child.superSelectedChild != child.rightSidebar) {
            if (this.par.getWidth() < (this.getWidth() + child.rightSidebar.getWidth())) {
           child.deselectChild(child.rightSidebar.title);
           }
        }
      }
    }
  }

};

class MaxDimensionsRight extends MaxDimensions {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight, selected=false) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.setBackground("orange");
    this.setBorder(0);
    this.setZ(2);
    this.lockH = false;
    this.selected = selected;
    this.animation = null;
    this.animations = [];

    if (this.selected) {
      this.left = 0;
    } else {
      this.left = this.maxWidth*-1;
    }

  }

  tickerHook(){
    for (var animation of this.animations) {
      this[animation[0]](animation[1]);
    }
    if (this.getWidth()*-1 == this.left) {
      this.lockH = true;
    }
  }

  addChildren() {

    //console.log(this.getAncestors('firstOfItsKind', '123').title);
    this.create2(new SidebarRightButton('asdf2', 'sidebarbuttonright', 'asdf'));
  }

  updateAvailableWidth() {
    this.availableWidth = this.par.getWidth();
  }

  updatePos() {
    if (this.lockH) {
      this.left = this.getWidth()*-1;
      this.setLeft(this.par.getInnerWidth() - this.getWidth() - this.left);
    } else {
      this.setLeft(this.par.getInnerWidth() - this.getWidth() - this.left);
    }
  }

  set() {

    for(var ancestor of this.par.getAncestors('constructor', 'LeftCenterRight')) {
      if (ancestor.leftSidebar != null) {
        if (ancestor.superSelectedChild != ancestor.leftSidebar) {
            if (this.par.getWidth() < (this.getWidth() + ancestor.leftSidebar.getWidth())) {
           //ancestor.deselectChild(ancestor.leftSidebar.title);
           }

        }
      }
    }
  }
};

class LeftCenterRight extends MaxDimensions {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.setBackground("red");
    this.setBorder(0)
    this.startLeft = null;
    this.leftSidebar = null;
    this.rightSidebar = null;
    this.center = null;
    this.selectedChild = null;
    this.deselectedChild = null;
    this.superSelectedChild = null;
    this.menuWidth = 301;

    this.notSelectedChildX = ['getWidth',-1];
    this.selectedChildX = 0;
    this.notSelectedChildY = 0;
    this.selectedChildY = 0;
    this.template.style.overflow = "hidden";
  }

  addChildren() {
    this.leftSidebar = this.create2(new MaxDimensionsLeft('Container','left',0, this.menuWidth, this.maxHeight));
    this.rightSidebar = this.create2(new MaxDimensionsRight('Container','right',0, this.menuWidth, this.maxHeight));
    this.center = this.create2(new MaxDimensionsCenter('Container','center',0, this.maxWidth, this.maxHeight));
  }

  selectChild(title) {
    if (this.getByTitle2(title).selected == false) {
      this.selectedChild = this.getByTitle2(title);
      this.setSuperSelectedChild(title);

      this.getByTitle2(title).selected = true;
      this.getByTitle2(title).animate(['moveH',this.selectedChildX]);
      this.getByTitle2(title).animate(['moveV',this.selectedChildY]);


    } else {
      this.deselectChild(title);
    }
  }

  deselectChild(title) {
    this.deselectedChild = this.getByTitle2(title);
    this.getByTitle2(title).selected = false;
    this.getByTitle2(title).animate(['moveH',this.notSelectedChildX]);
    this.getByTitle2(title).animate(['moveV',this.notSelectedChildY]);
  }

  setSuperSelectedChild(title) {
    for (var child of this.getChildren('constructor', 'LeftCenterRight')) {
      child.superSelectedChild = this.getByTitle2(title);
      this.superSelectedChild = this.getByTitle2(title);
    }
    for(var ancestor of this.getAncestors('constructor', 'LeftCenterRight')) {
      ancestor.superSelectedChild = this.getByTitle2(title);
      this.superSelectedChild = this.getByTitle2(title);
    }
  }

  updatePos() {
    this.setLeft(this.left);
    this.setTop(this.top);
  }


};


class CenterRight extends LeftCenterRight {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.animations = [];


  }

  addChildren() {
    this.rightSidebar = this.create2(new MaxDimensionsRight('Container','right',0, this.menuWidth, this.maxHeight));
    this.center = this.create2(new MaxDimensionsCenter('Container','center',0, this.maxWidth, this.maxHeight));
    this.addContent();
  }

  addContent(){

  }

  scrollEvent(){}

  tickerHook() {
    for (var animation of this.animations) {
      this[animation[0]](animation[1]);
    }
    if (this.left == this.par.checkSomething(this.par.notSelectedChildX)) {
      this.lockH = true;
    }
    if (this.top == this.par.checkSomething(this.par.notSelectedChildY)) {
      this.lockV = true;
    }
    this.scrollEvent();
  };


  updateAvailableWidth() {
    this.availableWidth = this.par.getInnerWidth() - (this.margin*2);

  }
  updateAvailableHeight() {
    this.availableHeight = this.par.getInnerHeight() - (this.margin*2);
  }



  updatePos() {
    if (this.lockH == true) {
      this.left = this.par.checkSomething(this.par.notSelectedChildX);
    }
    if (this.lockV == true) {
      this.top = this.par.checkSomething(this.par.notSelectedChildY);
    }
    this.setLeft(this.left);
    this.setTop(this.top);

    this.setOpacity(this.opacity)
  }


};

class LeftCenter extends LeftCenterRight {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight) {
    super(displayName, title, minItems, maxWidth, maxHeight);
  }

  addChildren() {
    this.leftSidebar = this.create2(new MaxDimensionsLeft('Container','left',0, this.menuWidth, this.maxHeight));
    this.center = this.create2(new MaxDimensionsCenter('Container','center',0, this.maxWidth, this.maxHeight));
  }


};



class FlexGrow extends EmptyContainer {
constructor(displayName, title, minItems=0, ani=null, displayType='') {
  super(displayName, title, minItems, ani, displayType);
  this.template = cloneHTML("flex-grow", this.title,this.title);
  this.body = this.template.getElementsByClassName('body')[0];
  }
}





class PassSizeToChild extends EmptyContainer{
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
  }

  meta(){
    this.update();
  }

  update(self=this) {
    self.BCR = self.template.getBoundingClientRect();

    for (var item of self.getCurrentDir()) {
      for (var item of item.getCurrentDir()) {
        item.template.style.width = self.BCR.width + "px";
      }
    }
    if (self.updateHandle == null) {
      self.updateHandle = setInterval(self.update, 20, this);
    }
  }
}


class SizeOfAbsoluteChild extends EmptyContainer{
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
  }

  meta(){
    this.update();
  }

  update(self=this) {
    if (self.items.length != 0) {
      if (typeof self.items[0].selectedChild.BCR !== 'undefined') {
        var visibleWidth = self.items[0].selectedChild.visibleWidth;
        self.template.style.width =  (self.items[0].selectedChild.BCR.width - Math.abs(visibleWidth)) + 10 +'px';
      }
    }
    if (self.updateHandle == null) {
      self.updateHandle = setInterval(self.update, 20, this);
    }
  }
}



class ChatPanelButton extends StackButton{
  constructor() {
    super(arguments[0], arguments[1], arguments[2].toString().toLowerCase(), arguments[3].toString().toLowerCase());
    this.body.innerHTML = '';
    this.setBackground('white');
  }

  addChildren() {
    this.list = this.create2(new ListButtonTitle('List', 'list', 0));
    this.create2(new JustifyContentBetween('Top', 'top'));
    this.leftTop = this.getByTitle2('top').create2(new JustifyContentBetween('Lefttop', 'lefttop'));
    this.leftTop.template.style.overflow = 'hidden';
    this.leftTop.template.style.marginRight = '10px';
    this.leftTop.template.style.whiteSpace = 'nowrap';
    this.getByTitle2('top').create2(new JustifyContentBetween('Righttop', 'righttop'));
    this.timestamp = this.getByTitle2('righttop').create2(new TextField('','timestamp'),'end');
    this.timestamp.template.style.whiteSpace = 'nowrap';

    this.getByTitle2('righttop').create2(new TextField('','1'),'end');
    this.create2(new JustifyContentBetween('Bottom', 'bottom'));
    this.leftBottom = this.getByTitle2('bottom').create2(new JustifyContentBetween('Last message', 'lastmessage'));
    this.leftBottom.create2(new TextField('No messages','placeholder'),'end');
    this.leftBottom.template.style.overflow = 'hidden';
    this.leftBottom.template.style.marginRight = '10px';
    this.leftBottom.template.style.whiteSpace = 'nowrap';
    this.leftBottom.template.style.fontSize = '12px';
    this.leftBottom.template.style.paddingTop = '2px';

    this.dropdown = this.getByTitle2('bottom').create2(new Dropper('...', 'asdf','menustack', 'chatsmenu'));
    this.dropdown.container.template.style.margin = '0px';
    this.dropdown.button.body.innerHTML = '▼';
    this.dropdown.button.template.style.paddingTop = '0px';
    this.dropdown.button.template.style.borderRadius = '2px';
    this.dropdown.button.template.style.fontSize = '10px';
    this.dropdown.button.template.style.marginTop = '5px';
    this.dropdown.button.template.style.paddingBottom = '0px';

    var pk = root.getByTitle2('chats').getByTitle2(this.title).pk;

    this.dropdown.main.create2(new DeleteChatButton('Delete chat','deletechat', pk));

    this.dropdown.main.create2(new OpenOptionsButton('Options', 'options',pk));

    //sidebarbuttonright

  }

  isNotActive(){
    this.template.style.backgroundColor = 'white';
    var chat = root.getByTitle2('chats').getByTitle2(this.title);
    chat.newMessages = 0;

    chat.last_seen = getCurrentDateISO();
    socket.send(JSON.stringify({
      'type': 'update_membership_of_self', 'message': {'pk':chat.pk,'membership':{'last_seen':'left'}}, 'from': from
    }));
  }

  isActive(){
    this.getByTitle2('righttop').removeByTitle('counter');
    this.template.style.backgroundColor = '#0d6dfd';

    var chat = root.getByTitle2('chats').getByTitle2(this.title);
    chat.last_seen = null;
    socket.send(JSON.stringify({
      'type': 'update_membership_of_self', 'message': {'pk':chat.pk,'membership':{'last_seen':'watching'}}, 'from': from
    }));
  }
}


class ContactPanelBtn extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1], arguments[2]);
    this.pk = arguments[2];
    this.template.style.backgroundColor = 'white';
  }
  addChildren() {
    this.jcb = this.create2(new JustifyContentBetween('Jcb', 'jcb'));
    this.jcl = this.jcb.create2(new JustifyLeft('left','left'));
    this.name = this.jcl.create2(new TextField(this.displayName,'name'));
    this.name.template.style.overflow = 'hidden';
    this.name.template.style.marginRight = '10px';
    this.jcl.template.style.overflow = 'hidden';
    this.dropdown = this.jcb.create2(new Dropper('...', 'asdf','menustack', 'chatsmenu'));
    this.dropdown.container.template.style.margin = '0px';

    this.dropdown.container.template.style.margin = '0px';
    this.dropdown.button.body.innerHTML = '▼';
    this.dropdown.button.template.style.paddingTop = '0px';
    this.dropdown.button.template.style.borderRadius = '2px';
    this.dropdown.button.template.style.fontSize = '10px';
    this.dropdown.button.template.style.marginTop = '5px';
    this.dropdown.button.template.style.paddingBottom = '0px';



    this.deleteBtn = this.dropdown.main.create2(new DeleteContactButton('Delete contact','deletecontact', this.displayName));
    this.deleteBtn.body.innerHTML = 'Delete contact';
    this.startBtn = this.dropdown.main.create2(new BasicButton('Start chat','startchat'));
    this.startBtn.body.innerHTML = 'Start chat';
  }

  request() {
    socket.send(JSON.stringify({
     'type': 'create_group', 'message': [[this.displayName,'private']], 'from': username, 'dir': username,
    }));

    root.getByTitle2('menustack').selectChild('chatsmenu');


  }
}


class Badge extends Container{
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
    this.template = cloneHTML('message-badge', this.title, this.title);
    this.body = this.template.getElementsByClassName('body')[0];
  }
}

class List extends Container{
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
  }

  itemCreated(){
    this.createString();
  }

  itemRemoved(){
    this.createString();
  }

  createString(){
    const displayNames = [];
    for (var item of this.items) {
      displayNames.push(item.displayName);
    }
    this.string = displayNames.join(', ');
    this.addString();
  }

  addString(){}
}

class ListButtonTitle extends List{
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
  }
  addString() {
    const target = this.getAncestors('constructor', 'ChatPanelButton')[0].getByTitle2('lefttop');
    target.removeAll();
    target.create2(new TextField(this.string,this.string.toLowerCase()));
  }
}


class ListTypingContainer extends List{
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
  }
  addString() {

    const target = this.par.typingContainerInner.getByTitle2('container');
    const target2 = this.par.button.getByTitle2('lastmessage');
    target.removeAll();
    target2.removeAll();
    if (this.string.length != 0) {
      target.create2(new TextField(this.string + ' ' + 'typing...',this.string.toLowerCase()));
      target2.create2(new TextField(this.string + ' ' + 'typing...',this.string.toLowerCase()));
      this.par.typingContainerInner.selectChild('container');
    } else {
      this.par.typingContainerInner.deselectChild('container');
      target.create2(new TextField(this.string,this.string.toLowerCase()));
      target2.create2(new TextField(this.par.latestMessage.text,this.par.latestMessage.text.toLowerCase()))
    }

  }
}

// deselectete
class ChatsMenuTab extends Container{
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
    this.template = cloneHTML("nav-tab-group", this.title, this.title);
    this.template.setAttribute('data-bs-target', "#nav-pane-group"+ this.title)
    this.template.setAttribute('aria-controls', "nav-pane-group"+ this.title)
    this.body = this.template.getElementsByClassName('body')[0];
  }

  meta() {
    this.create2(new JustifyContentBetween('Top', 'top'));
    this.getByTitle2('top').create2(new JustifyContentBetween('Lefttop', 'lefttop'));
    this.getByTitle2('top').create2(new JustifyContentBetween('Righttop', 'righttop'));
    this.getByTitle2('righttop').create2(new TextField('Time','timestamp'),'end');
    this.create2(new JustifyContentBetween('Bottom', 'bottom'));
    this.getByTitle2('bottom').create2(new TextField('Last message', 'lastmessage'));

    for ( var member of root.getByTitle2('chat' + this.title).getByTitle2('members').items ) {
      if (member.status == 'active' || member.status == 'inactive' || member.status == 'blockHed') {
         this.getByTitle2('lefttop').create2(new TextField(member.name,member.name),'start');
      }
    }
  }
}




class ContacListButton2 extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1]);
  }
  meta() {
    this.create2(new JustifyContentBetween('nametimedelete', 'nametimedelete'));
    this.checkCurrentDir('nametimedelete').create2(new Username(this.title,this.title+'name'));
    this.checkCurrentDir('nametimedelete').create2(new FloatRight(this.title + 'right', this.title + 'right'));
    this.getByTitle2(this.title + 'right').create2(new LastSeen('100:00',this.title+'seen'));
    this.getByTitle2(this.title + 'right').create2(new BasicButton(this.title,this.title, 'delete'));
  }


  request() {
    console.log('DO SOMETHING', this.title)
  }
}

class CheckboxSubmit2 extends Clickable{
  constructor(displayName, title, action) {
    super(displayName, title);
    this.setTemplate(cloneHTML('submit-selected', this.title, this.title, this.action));
    this.body = this.template.getElementsByClassName('body')[0];
    this.body.innerHTML = this.displayName;
    this.action = action;
    this.checks = 0;
    this.values = [];
    this.hide();
  }
  addChildren() {

  }

  checked() {
    this.values = [];
    const checkboxes = this.par.par.getChildren('constructor', 'Checkbox2');
    for (var checkbox of checkboxes) {
      if(checkbox.checkbox.checked) {
        this.values.push(checkbox.value);
      }
    }
  }

  request() {
    this.checked();
    //console.log('ACTION!', this.action, this.values, this.dir)
    socket.send(JSON.stringify({
      'type':this.action, 'message':this.values, 'dir':username, 'from': username
    }));



  }


  loader() {
    this.create2(new Spinner('Spinner', 'spinner'));
  }

  response() {
      this.removeByTitle('spinner')
      this.hide();
      this.checks = 0;
  }

}


class MakeAdminSubmit extends CheckboxSubmit2{
  constructor(displayName, title, action) {
    super(displayName, title, action);
  }
}



class Spinner extends Container {
  constructor(displayName, title) {
    super(displayName, title);
    this.template = cloneHTML('spinner', this.title, this.title);
  }
}





class Username extends Container{
  constructor(displayName, title) {
    super(displayName, title);
    this.template = cloneHTML('username', this.title, this.title.toLowerCase());
    this.body = this.template;
    this.template.innerHTML = this.displayName;
  }
}

class LastSeen extends Container{
  constructor(displayName, title) {
    super(displayName, title);
    this.template = cloneHTML('seen', this.title, this.title.toLowerCase());
    this.body = this.template;
    this.template.innerHTML = this.displayName;
  }
}

class FloatRight extends Container{
  constructor(displayName, title) {
    super(displayName, title);
    this.template = cloneHTML('container-float-right', this.title, this.title.toLowerCase());
    this.body = this.template;
  }
}

class JustifyContentBetween extends Container{
  constructor(displayName, title) {
    super(displayName, title);
    this.template = cloneHTML('container-justify-between', this.title, this.title.toLowerCase());
    this.body = this.template.getElementsByClassName('body')[0];
  }
}

class JustifyLeft extends Container{
  constructor(displayName, title) {
    super(displayName, title);
    this.template = cloneHTML('container-left', this.title, this.title.toLowerCase());
    this.body = this.template.getElementsByClassName('body')[0];
  }
}

class JustifyCenter extends Container{
  constructor(displayName, title) {
    super(displayName, title);
    this.template = cloneHTML('container-center', this.title, this.title.toLowerCase());
    this.body = this.template.getElementsByClassName('body')[0];
  }
}


// active checkbox
class Checkbox2 extends Clickable{
  constructor() {
    super(arguments[0], arguments[1]);
    this.setTemplate(cloneHTML('checkbox-basic', this.title, this.title.toLowerCase()));
    this.body = this.template.getElementsByClassName('body')[0];
    this.checkbox = this.template.getElementsByClassName('checkbox')[0];
    this.value = Array.prototype.slice.call(arguments, 2);
    this.submitButton = null;
    ;

  }

  addChildren() {

    //this.create2(new Username(this.title,this.title+'name'));
  }

  toggle() {
    const submit = this.par.par.getChildren('constructor', 'CheckboxSubmit2')[0];

    if (this.checkbox.checked) {
      this.checkbox.checked = false;
      submit.checks += 1;
    } else {
      this.checkbox.checked = true;
      submit.checks -=1 ;
    }
    if (submit.checks != 0) {
      submit.show();
    } else {
      submit.hide();
    }


  }

  request() {
  //  console.log('checkkkkk', this.title)
  }


}


class CheckboxNewGroup extends Checkbox2{
  constructor() {
    super(arguments[0], arguments[1]);
    this.body = this.template.getElementsByClassName('body')[0];
    this.checkbox = this.template.getElementsByClassName('checkbox')[0];
    this.value = Array.prototype.slice.call(arguments, 2);
  }
  meta() {
    this.create2(new JustifyContentBetween('nametime', 'nametime'));
    this.checkCurrentDir('nametime').create2(new Username(this.title,this.title+'name'));
    this.checkCurrentDir('nametime').create2(new LastSeen('00:00',this.title+'seen'))
  }

  test() {
    console.log('I RUN!')
  }
}



class PanelLeftCenter extends JustifyContentBetween {
  constructor(displayName, title, minItems=0, ani=null, displayType='') {
    super(displayName, title, minItems, ani, displayType);
    //this.body.style.padding = "20px";
  }
}
