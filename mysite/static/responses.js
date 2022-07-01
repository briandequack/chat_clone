
var loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc non urna at sapien pretium rutrum quis sagittis dolor. Ut at ornare ante.";



// ROOT
var root = new Container('root','ROOT');
root.template = document.getElementById('root');
root.body = root.template;
root.dir = 'ROOT/';
root.par = root;
root.meta();


var stage = root.create2(new MaxDimensions('Container','container',0, 1100, 700));
var page = stage.create2(new LeftCenter('doenotmatter','page',0, 1100, 1100));
var leftSidebar = page.leftSidebar;

//'notSelectedChildX':['getWidth',-1]

var pageStack = page.center.create2(new Stack('Container','chats',0, 1100, 1100, 0, 0, {'notSelectedChildX':['getWidth',-1]}));

//var chat1 = pageStack.create2(new CenterRight('Container','chat1',0, 1100, 500));
//chat1.center.body.innerHTML = loremIpsum;
//var chat2 = pageStack.create2(new CenterRight('Container','chat2',0, 1100, 500));
//chat2.center.body.innerHTML = loremIpsum;

//leftSidebar.create2(new Dropdown2('Button11', 'button32','menustack', 'chatsmenu'))


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

//'notSelectedChildX':['getWidth',-1]
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
var initialized = false;






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

/*
leftContainer.create2(new ChatMenu('Chatsmenu', 'chatsmenu'));
leftContainer.create2(new ContactsMenu('contacts', 'contacts'));

root.getByTitle2('chatsmenu').create2(new SwitchMenu('asd', 'panelbuttons',0, 'fade'));
root.getByTitle2('panelbuttons').template.style.width = "280px";
*/

var socket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/sendreceive/'
    + username
    + '/'
);


socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data['type'] == 'connected'){
        getContacts();
        getGroups();
    }

    if (data['type'] == 'response_contact_deleted') {
      deleted_contact = data['message'];
      root.getByTitle2('creategroupmenu').main.removeByTitle(deleted_contact.toString().toLowerCase())

    }


    if (data['type'] == 'response_user_activity') {
      var pk = data['message'][2];
      var name = data['message'][1];
      var activity = data['message'][0];
      if (activity == 'yes'){
        root.getByTitle2('chats').getByTitle2('chat' + pk).listTyping.create2(new List(name, name.toLowerCase()));
      } else {
        root.getByTitle2('chats').getByTitle2('chat' + pk).listTyping.removeByTitle(name.toLowerCase());
      }



    }






    if(data['type'] == 'response_membership_updated') {

      //console.log('asdf', data['message'])
      /*
      const myArray = data['from'].split("/");

      var dirs = myArray.splice(1,myArray.length-1);
      dirs.pop();

      var current_dir = root;


      for (var dir of dirs) {
        console.log('B',current_dir.title);
       var new_dir = current_dir.getByTitle(dir);
        current_dir = new_dir;
      }

      current_dir.response();


      var pk = data['message']['room']['pk'];


      var chat = getChat(pk);
      var group = data['message'];
      if (chat != false) {
        //console.log('Membership resonpse:',chat.myMembers)
        var members = data['message']['members'];
        for (var member of members) {
          chat.updateMembership(member);
        }
      } else {
        //updateGroups(group)
        addGroup(group)
      }
      */
      console.log('UPDATE MEMBERSHIP')
      var group = data['message'];
      var pk = data['message']['room']['pk'];
      var chat = root.getByTitle2('chats').getByTitle2('chat' + pk);
      if (chat != false) {

        var members = data['message']['members'];
        for (var member of members) {
          chat.updateMembership(member);
        }

      } else {
        addGroup(group);

        if (data['from'] == username) {
          root.getByTitle2('menustack').selectChild('chatsmenu');
          root.getByTitle2('chats').selectChild('chat' + pk);
          root.getByTitle2('chatsmenu').getByTitle2('chat' + pk).request();
        }

      }
    }



    // Get groups
    if (data['type'] == 'receive_groups_of_self'){
      for (var group of data['message']){
        addGroup(group)
      }
    }



    if (data['type'] == 'ping'){
        socket.send(JSON.stringify({
        'type': 'ping', 'from': data['from']
        }));
        root.getByTitle2('onlineusers').create2(new List(data['from'], data['from'].toLowerCase()))
      // console.log('PING', root.getByTitle2('onlineusers').items)
        for (var chat of root.getByTitle2('chats').items) {
            var member = chat.headerTitle.getByTitle2(data['from'].toLowerCase());
            if (member != false) {
              member.status.setBackground('green');
            }

        }
    }

    if (data['type'] == 'pong'){
        socket.send(JSON.stringify({
        'type': 'pong', 'from': data['from']
      }));
       root.getByTitle2('onlineusers').create2(new List(data['from'], data['from'].toLowerCase()))
       console.log('PONG', root.getByTitle2('onlineusers').items)
//
    //  console.log('PONG', root.getByTitle2('onlineusers').items)
        for (var chat of root.getByTitle2('chats').items) {
            var member = chat.headerTitle.getByTitle2(data['from'].toLowerCase());
            if (member != false) {
              member.status.setBackground('none');
            }
        }
    }

    if (data['type'] == 'offline') {
      socket.send(JSON.stringify({
      'type': 'offline', 'from': data['from']
      }));


      root.getByTitle2('onlineusers').removeByTitle(data['from'].toLowerCase())
      for (var chat of root.getByTitle2('chats').items) {

          chat.listTyping.removeByTitle(data['from'].toLowerCase());
          var member = chat.headerTitle.getByTitle2(data['from'].toLowerCase());
          if (member != false) {
            member.status.setBackground('red');
          }
      }
    }



  // Add a newly created contact
  if (data['type'] == 'response_added_contact'){
    var contactsContainer = root.getByTitle2('contactsmenu');
    var createGroupContainer = root.getByTitle2('creategroupmenu');
    if (contactsContainer.getByTitle2(data['message'].toLowerCase()) == false) {
      var contactButton = contactsContainer.main.create2(new ContactPanelBtn(data['message'], data['message'].toLowerCase()),'start');
      var createGroupButton = createGroupContainer.main.create2(new Checkbox2(data['message'], data['message'].toLowerCase(), data['message'],'group'),'start');
      createGroupButton.template.style.backgroundColor = 'white';
      createGroupButton.body.innerHTML = data['message'];
    }
  }

  // Add all contacts from contact list
  if (data['type'] == 'response_contacts'){
    var contactsContainer = root.getByTitle2('contactsmenu');
    var createGroupContainer = root.getByTitle2('creategroupmenu');
    for (var contact of data['message']) {
      if (contactsContainer.getByTitle2(contact['name'].toLowerCase()) == false) {
        var contactButton = contactsContainer.main.create2(new ContactPanelBtn(contact['name'], contact['name']))
        var createGroupButton = createGroupContainer.main.create2(new Checkbox2(contact['name'], contact['name'].toLowerCase(), contact['name'],'group'),'start');
        createGroupButton.template.style.backgroundColor = 'white';
        createGroupButton.body.innerHTML = contact['name'];
      }
    }
  }


  if (data['type'] == 'search_results'){
    var resultsContainer = root.getByTitle2('findcontactmenu');
    resultsContainer.main.body.innerHTML = '';
    for (var result of data['message']) {
      var button = resultsContainer.main.create2(new ResultsButton(result['name'],result['name']))
      button.body.innerHTML = result['name'];
    }
    if (data['message'].length == 0) {
      resultsContainer.main.create2(new TextField('Nothing found','nothingfound'))
    }
  }


  // Get members
  if (data['type'] == 'response_members'){
    var members = data['message']['members'];
    var chatTitle = 'chat' + data['message']['room']['pk'];
    root.getByTitle2('chats').getByTitle2(chatTitle).loadMembers(members);
  }

  // Get messages
  if (data['type'] == 'response_messages'){
    var messages = data['message']['messages']
    var chatTitle = 'chat' + data['message']['room']['pk'];
    console.log(messages)
    root.getByTitle2('chats').getByTitle2(chatTitle).loadMessages(messages);
  }

  if (data['type'] == 'response_message_deleted'){
    var messagePk = data['message']['messagePk'];
    var groupPk = data['message']['groupPk'];
    var chat = root.getByTitle2('chats').getByTitle2('chat' + groupPk)
    if (chat != false) {
      chat.getByTitle2(messagePk).removed();
      if (chat.latestMessage.title == messagePk) {
        chat.latestMessage.text = 'Removed';
        chat.updateLatestMessage();
      }
    }
  }



  if (data['type'] == 'message') {
    var pk = pk = data['to'];
    var chat = root.getByTitle2('chats').getByTitle2('chat' + pk);
    var newMessage = new Message(pk,data['message']['pk'].toString(), data['message']);
    var message = data['message']['message'];

    var chat = root.getByTitle2('chats').getByTitle2('chat' + pk);
    if (chat == false) {
        updateMembershipStatus(pk,{'status':'active'}, data['from']);
    } else {
        chat.latestMessage = newMessage;
        chat.updateLatestMessage();
        if (chat.last_seen != null) {
          chat.newMessages += 1;
          chat.addToCounter();
        }
        var messages = chat.getByTitle2('messages')
        messages.create2(newMessage);
        chat.scrollDown();
    }


  }



};
