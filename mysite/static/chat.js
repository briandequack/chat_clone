
var chats = [];

class Chat2 extends CenterRight {
  constructor(displayName, title, minItems=0, maxWidth, maxHeight, group) {
    super(displayName, title, minItems, maxWidth, maxHeight);
    this.last_seen = group['room']['last_seen'];
    this.pk = group['room']['pk'];
    this.name = 'chat name ' + this.pk;
    this.type = group['room']['type'];
    this.loadingMessages = false;
    this.num_loaded = 0;
    this.lastMessage = 'No messages';
    this.newMessages = 0;
    this.headerTitle = null;
    this.setBackground('green');
  }

  addContent() {

    this.button = root.getByTitle2('chatsmenu').main.create2(new ChatPanelButton(this.displayName,this.title,'chats', this.title));

    if (root.getByTitle2('chatsmenu').main.items.length == 1) {
      this.button.request()
    }

    this.header = this.center.create2(new MaxDimensionsNormal('Header','header',0,1100,50));
    this.header.setBackground('black');
    this.header.template.style.overflow = "hidden";


    this.headerTitle = this.header.create2(new JustifyLeft('Members', 'members'));
    this.headerTitle.body.style.height = '50px';
    this.headerTitle.template.style.marginRight = "60px";
    this.headerTitle.template.style.overflow = "hidden";
    this.headerTitle.template.style.marginLeft = '10px';
    this.members = this.create2(new Members('Members','members'));
    this.getMembers();
    this.messages = this.center.create2(new MaxDimensionsNormal('Messages','messages',0,1100,700,50,74));

    this.messages.template.style.paddingBottom = '37px';
    this.messages.template.style.backgroundColor = '#e6e6e6';


    this.typingContainer = this.center.create2(new Footer('Typing activity', 'footertop', 0,1100, 30, 74));

    this.typingContainer.template.style.overflow = 'hidden';
    this.typingContainer.template.style.backgroundColor = 'transparent';
    this.typingContainerInner = this.typingContainer.create2(new Stack('Typing', 'typingstack', 0, 1100,700))
    this.typingContainerInner.template.style.backgroundColor = 'transparent';
    this.typingContainerInner.create2(new Menu2('Container', 'container'));
    this.listTyping = this.create2(new ListTypingContainer('List', 'list'));
    this.typingContainerInner.deselectChild('container');
    this.getByTitle2('container').template.style.backgroundColor = 'transparent';
    this.getByTitle2('container').template.style.paddingLeft = '10px';

    this.getMessages();
    this.footer = this.center.create2(new Footer('Footer', 'footer',0,1100,74));
    this.footer.create2(new ChatInput('Chat input','chatinput'));



  }

  metaUpdate(){
    if (this.headerTitle != null) {
    if(this.par.par.par.getWidth() < 500) {
      this.headerTitle.template.style.marginLeft = '65px';
    } else {
      this.headerTitle.template.style.marginLeft = '20px';
    }
    }
  }

  scrollEvent() {
    if (this.messages.template.scrollHeight != 0) {
      if ( this.messages.template.scrollTop == 0 && this.scrollDisY > this.messages.template.scrollTop && this.loadingMessages == false) {
          this.getMessages();
    }
      this.scrollDisY = this.messages.template.scrollTop;
    }
  }

  scrollDown(){
    this.messages.template.scrollTop = (this.messages.template.scrollHeight);
  }

  getMembers() {
    socket.send(JSON.stringify({
       'type': 'request_members','pk':this.pk, 'from': username, 'to': username
    }));
  }

  loadMembers(members) {
    for (var member of members) {
      var newMember = this.members.create2(new Member2(member));
      if (newMember.status == 'active' || newMember.status == 'inactive'){
        if (member['name'] != username){
          this.addUserToHeader(member['name']);
        }
      }

    }

    this.buildMenu();

  }

  addUserToHeader(member){
    var titleObject = this.headerTitle.create2(new HeaderTitleObject(member, member.toLowerCase()));
    if (root.getByTitle2('onlineusers').getByTitle2(member.toLowerCase())) {
      titleObject.status.setBackground('green')
    }
    this.button.getByTitle2('list').create2(new List(member, member.toLowerCase()))

  }

  buildMenu() {
    this.rightSidebar.removeAll();
    this.menu = this.rightSidebar.create2(new ChatsOptionsMenu2('Header','options',0,1100,1100));
  }

  getMessages() {
    //this.addMessageLoader();
    if (this.first_message_timestamp == null) {
      var timestamp = new Date();
      var b = timestamp.toISOString();
    } else {
      var b = this.first_message_timestamp;
    }
    socket.send(JSON.stringify({
       'type': 'request_messages','pk':this.pk, 'from': username, 'to': username, 'date_time':b
    }));
  }

  loadMessages(messages) {
    if (messages.length != 0) {
      for (var message of messages) {
          this.messages.create2(new Message(message['pk'].toString(),message['pk'].toString(), message), 'start')

            if(this.last_seen != null) {
              var isNew = this.checkIfMessageIsNew(message.timestamp, this.last_seen);
              if (isNew) {
                this.newMessages += 1;
                this.addToCounter();
              }
            }




      }
      var timestamp = new Date(messages[messages.length - 1]['timestamp']);
      timestamp.setSeconds( timestamp.getSeconds() - 1);
      var a = timestamp.toISOString();
      this.first_message_timestamp = a;
      this.num_loaded += 1;
      if (this.num_loaded == 1) {
        if (messages.length != 0) {
          this.latestMessage = this.messages.items[0];
          this.updateLatestMessage();
        }
        this.scrollDown();
      }
    } else {
        this.loadingMessages = null;
    }


  };

  updateLatestMessage() {
    this.button.getByTitle2('lastmessage').removeAll();
    this.button.getByTitle2('lastmessage').create2(new TextField(this.latestMessage.text,'placeholder'),'end');

    this.button.getByTitle2('timestamp').body.innerHTML = getTimeString(this.latestMessage.timestamp);
  }

  updateMembership(member) {

      if (this.members.getByTitle2(member['name'].toLowerCase()) != false) {
        this.members.getByTitle2(member['name'].toLowerCase()).updateMembership(member['membership'])

      } else {
        this.members.create2(new Member2(member));
        this.members.getByTitle2(member['name'].toLowerCase()).updateMembership(member['membership'], false);

      }

  }

  addToCounter() {
    this.counter = this.button.getByTitle2('righttop').create2(new Badge('','counter'),'end');
    this.counter.body.innerHTML = this.newMessages;
  }

  getMemberRole(name=username) {
    for (var member of this.members.items){
        if(member.displayName == username) {
          return member.role;
        }
    }
  }

  getMemberStatus(name=username) {
    for (var member of this.members.items){
        if(member.displayName == username) {
          return member.status;
        }
    }
  }


  checkIfMessageIsNew(time1,time2) {
    return new Date(time1) > new Date(time2);
  }


}

class HeaderTitleObject extends JustifyContentBetween{
  constructor(displayName, title, minItems=0) {
    super(displayName, title, minItems);
  }
  meta(){
    this.addChildren();
  }
  addChildren(){
    this.template.style.whiteSpace="nowrap";
    this.status = this.create2(new EmptyContainer('', ''));
    this.status.template.style.width = '23px';
    this.status.template.style.borderRadius = '15px';
    this.status.template.style.backgroundColor = 'red';
    this.name = this.create2(new TextField(this.displayName, this.title));
    this.name.template.style.marginLeft = '5px';
    this.name.template.style.marginRight = '10px';
    this.name.template.style.color = "white";

  }
};

class Chat extends EmptyContainer{
  constructor(group,displayName, title) {
    super(displayName, title);

    this.self = this;
    this.group = group;
    this.last_seen = group['room']['last_seen'];
    this.pk = group['room']['pk'];
    this.name = 'chat name ' + this.pk;
    this.type = group['room']['type'];
    this.members = group['members'];
    this.messages = [];
    this.first_message_timestamp = null;
    this.scrollDisY = 0;
    this.loadingMessages = false;
    this.num_loaded = 0;
    this.myMembers = [];


  //  this.create(new ChatTitle(this.self, 'title', 'title'));

    this.input = null;


    this.template = cloneHTML("chat-content", this.pk, this.pk);
    this.body = this.template.getElementsByClassName('body')[0];


    this.template.style.backgroundColor = "green";
    this.body.style.backgroundColor = "green";

  }

  meta() {


    this.create2(new Members('Members','members'));
    this.create2(new ChatHeader('header', 'header'),'start');

    this.create2(new Chatlog(this.pk.toString(),'messages'));

    this.create2(new TypingInput(this.pk.toString(), 'typingcontainer'),'end');

  }


  scroll() {
    var container = document.getElementById("chat-log-container" + this.pk);
    if (container.scrollHeight != 0) {
      console.log('scroll',container.scrollTop,container.scrollHeight, this.pk);

      if ( container.scrollTop == 0 && this.scrollDisY > container.scrollTop && this.loadingMessages == false) {
          this.getMessages();
      }
      this.scrollDisY = container.scrollTop;
    }
  }

  scrollDown() {
    var container = document.getElementById("chat-log-container" + this.pk);
    container.scrollTop = (container.scrollHeight);
  }

  addMessageLoader() {
    //this.num_loaded += 1;
    //this.loadingMessages = true;
    //var loader = cloneHTML('message-loader', this.pk);
    //var loaderContainer = document.getElementById("chat-load-messages-container"+this.pk);
    //loaderContainer.appendChild(loader);
  }

  removeMessageLoader() {
    //this.loadingMessages = false;
    //document.getElementById("chat-load-messages-container"+this.pk).innerHTML = '';
  }

  addMessage(message, position = 'bottom') {

    /*
    var new_message = new Message(message);
    if (position == 'bottom') {
      this.messages.push(new_message);
    } else {
      this.messages.unshift(new_message);
    }

    var list = document.getElementById("chat-log-list"+ this.pk)
    if (new_message.author != username){
      var messageTemplate = cloneHTML("message", new_message.pk);
    } else{
         var messageTemplate = cloneHTML("message_me", new_message.pk);
    }
    if (position == 'bottom') {
      list.appendChild(messageTemplate);
    } else {
      list.insertBefore(messageTemplate,list.firstChild);
    }
    document.getElementById('text'+ new_message.pk).innerHTML = new_message.text;
    document.getElementById('from'+ new_message.pk).innerHTML = new_message.author;
    var timeString = getTimeString(new_message.timestamp);
    document.getElementById('chat-message-timestamp'+ new_message.pk).innerHTML = timeString;
    this.addLatestMessage()

    if (this.last_seen != null) {
      var isNew = this.checkIfMessageIsNew(message.timestamp, this.last_seen);
      if (isNew) {
        //console.log('add to counter!!!')
        this.addToCounter();
      }
    }

    if (position == 'bottom') {
      this.scrollDown();
    } else {
      if (this.num_loaded == 1){
        this.scrollDown();
      }
    }
    */
  }

  select() {
    this.last_seen = null;
    this.removeFromCounter();
  }

  deselect() {
    this.last_seen = getCurrentDateISO();
  }


  addToCounter() {
    var counterExist = document.getElementById("counter"+ this.pk);
    if (counterExist != null){
      var current_value = document.getElementById('counter'+this.pk).innerHTML;
      var number = parseInt(current_value);
      var new_value = number += 1;

      document.getElementById('counter'+this.pk).innerHTML = new_value;
    } else {
      //console.log('run')
    //  var counterHolder = document.getElementById('counter-holder'+this.pk);
    //  var counterTemplate = cloneHTML('counter',this.pk);
      //counterHolder.appendChild(counterTemplate);
    //  document.getElementById('counter'+this.pk).innerHTML = 1;
    }
  }

  removeFromCounter() {
    var counterExist = document.getElementById("counter"+ this.pk);
    if (counterExist != null){
      document.getElementById("counter"+ this.pk).remove();
    }
  }

  delete() {
    for (let i = 0; i < chats.length; i++) {
      if (this.pk == chats[i].pk) {
        chats.splice(i, 1)
      }
    }
  }

  loadMessages(messages) {
    this.removeMessageLoader();

    if (messages.length != 0) {
      for (var message of messages) {
          this.getByTitle2('messages').create2(new Message(message['pk'].toString(),message['pk'].toString(), message), 'start')
      }
      var timestamp = new Date(messages[messages.length - 1]['timestamp']);
      timestamp.setSeconds( timestamp.getSeconds() - 1);
      var a = timestamp.toISOString();
      this.first_message_timestamp = a;
    } else {
        this.loadingMessages = null;
    }
  }

  getMessages() {
    this.addMessageLoader();
    if (this.first_message_timestamp == null) {
      var timestamp = new Date();
      var b = timestamp.toISOString();
    } else {
      var b = this.first_message_timestamp;
    }
    socket.send(JSON.stringify({
       'type': 'request_messages','pk':this.pk, 'from': username, 'to': username, 'date_time':b
    }));
  }



  // Return true if time 1 is later
  checkIfMessageIsNew(time1,time2) {
    return new Date(time1) > new Date(time2);
  }

  getLastMessage() {
    if (this.messages.length != 0) {
      return this.messages[this.messages.length - 1];
    } else {
      return false;
    }
  }

  getMembers() {
  //  console.log('GET MEMBERSS!')
    socket.send(JSON.stringify({
       'type': 'request_members','pk':this.pk, 'from': username, 'to': username
    }));
  }



  getMemberRole(name=username) {
    return this.getMemberObject(name).role;
  }

  getMemberStatus(name=username) {
    return this.getMemberObject(name).status;
  }

  getMemberObject(name=username) {
    for (var member of this.myMembers) {
      if (name == member.name) {
        return member;
      }
    }
    return false;
  }

  // Member stuff
  addMember(member) {
    if (this.checkMember(member)) {
      //this.chatTitle.add(member.name);
      //this.getByTitle('title').add(member.name);

      //this.tab.add(member.name);
    } else {

      var member = new Member(member, this.self);
      this.myMembers.push(member);

    //  this.chatTitle.add(member.name);
      //this.getByTitle('title').create(member.name);
      //this.tab.add(member.name);
    }

    //console.log('list', this.myMembers)
  }


  replaceMember(member) {
    for (let i = 0; i < this.myMembers.length; i++) {
      if (member['name'] == this.myMembers[i]['name']) {
      //  console.log('FUD', member['name'])
        this.myMembers.splice(i,1);
        break;
      }
    }
    var member = new Member(member, this.self);
    this.myMembers.push(member);
    return member;
  }


  checkMember(member) {
    for (let i = 0; i < this.myMembers.length; i++) {
      if (member['name'] == this.myMembers[i]['name']) {
        return true;
      //  console.log('found', member['name'])
      }
    }
    return false;
  //  console.log('not found', member['name'])
  }


  updateMembership(member) {
    console.log('membership update', member);
    if (this.getByTitle2('members').getByTitle2(member['name'].toLowerCase()) != false) {
      this.getByTitle2('members').getByTitle2(member['name'].toLowerCase()).updateMembership(member['membership']);
      //console.log('FOUND!')
    } else {
      this.self.getByTitle2('members').create2(new Member2(member));
      this.getByTitle2('members').getByTitle2(member['name'].toLowerCase()).updateMembership(member['membership'], false);
      //console.log('NOT FOUND!')
    }



  }


  loadMembers(members) {
    for (var member of members) {
      this.self.getByTitle2('members').create2(new Member2(member));
    }
    console.log('SET UP PANEL')
    this.getByTitle2('header').create2(new HeaderTitle('Header title', 'headertitle'),'start');
    this.getByTitle2('header').create2(new CollapseableOptions('Options', 'options'));

    if (root.getByTitle2('panelbuttons').items.length == 0) {
      root.getByTitle2('panelbuttons').create2(new ChatPanelButton(this.displayName, this.displayName, 'mypanel', this.displayName), 'end', true);
    } else {
        root.getByTitle2('panelbuttons').create2(new ChatPanelButton(this.displayName, this.displayName, 'mypanel', this.displayName));
    }
  }



}



// Get chat object
function getChat(pk) {
  for (var chat of chats) {
    if(chat.pk == pk) {
      return chat;
    }
  }
  return false;
}

// All chat even that need a listener
function chatEvents(){
    for (var chat of chats) {
    //  chat.scroll();
      //chat.TypingInput()
    }
}

setInterval(chatEvents, 500);
