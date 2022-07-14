

// Create the root container
var root = new Container('root','ROOT');
root.template = document.getElementById('root');
root.body = root.template;
root.dir = 'ROOT/';
root.par = root;
root.meta();


var stage = root.create2(new MaxDimensions('Container','container',0, 1100, 700));
var page = stage.create2(new LeftCenter('doenotmatter','page',0, 1100, 1100));
var leftSidebar = page.leftSidebar;
var pageStack = page.center.create2(new Stack('Container','chats',0, 1100, 1100, 0, 0, {'notSelectedChildX':['getWidth',-1]}));

var header = leftSidebar.create2(new JustifyContentBetween('Header', 'header'));


if (leftSidebar.par.getWidth() < 500) {
  header.template.style.marginLeft = '30px';
} else {
  header.template.style.marginLeft = '0px';
}


header.create2(new UserButton(username, username,'menustack', 'chatsmenu'));
var dropdown = header.create2(new Dropper('...', 'asdf','menustack', 'chatsmenu'));
dropdown.main.create2(new StackButton('Chats', 'button3','menustack', 'chatsmenu'));
dropdown.main.create2(new StackButton('Contacts', 'button4','menustack', 'contactsmenu'));
dropdown.main.create2(new StackButton('Create group', 'button5','menustack', 'creategroupmenu'));
dropdown.main.create2(new LogoutButton('Logout', 'logout'));


var menuStack = leftSidebar.create2(new Stack('Container','menustack',0, 1100, 700, 0, 50, { 'notSelectedChildY':['getHeight',-1]}));
var chatMenu2 = menuStack.create2(new ChatsMenu2('Container','chatsmenu',0, 1100, 700));


contactsMenu2 = menuStack.create2(new ContactsMenu2('Container','contactsmenu',1100, 1100, 700));
createGroupMenu = menuStack.create2(new CreateGroupMenu('Container','creategroupmenu',1100, 1100, 700));
findContactMenu = menuStack.create2(new FindContactMenu('Container','findcontactmenu',1100, 1100, 700));

var onlineUsers = root.create2(new List('Oline users', 'onlineusers'))


var groups = []
var contacts = []
var online_users = [];
var contactList = [];






class ChatMenu extends EmptyContainer{
  constructor(displayName, title, minItems=null) {
    super(displayName, title, minItems);
  }

}



class ContactsMenu extends EmptyContainer{
  constructor(displayName, title, minItems=null) {
    super(displayName, title, minItems);

  }
  meta() {
    this.self.create2(new Members('Members','members'));
    this.create2(new Accordion2('Contacts accordion', 'contactsaccordion'));
  }
}
