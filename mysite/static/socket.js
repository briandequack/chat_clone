
// Create sock variables
var socket = null;
var initialized = false;

// Connect to WebSocket
function connect () {

  // Create a websocket object
  socket = new WebSocket(
      'ws://'
      + window.location.host
      + '/ws/sendreceive/'
      + username
      + '/'
  );

  // Reconnect WebSocket when closed unexpectedly
  socket.onclose = function(e) {
    console.log('reconnect')
    socket = null;
    connect();
  }


  //  All on message functions.
  socket.onmessage = function(e) {

      const data = JSON.parse(e.data);

      // When connection is established.
      if (data['type'] == 'connected') {
        if (initialized == false) {
          // If first connection get all groups and contacts/
          getContacts();
          getGroups();
        } else {
          // When reconnecting.
          //getContacts();
          //getGroups();
        }
      }

      // When contact is removed from contact list.
      if (data['type'] == 'response_contact_deleted') {
        deleted_contact = data['message'];
        // Remove contact from group menu.
        root.getByTitle2('creategroupmenu').main.removeByTitle(deleted_contact.toString().toLowerCase())
      }

      // When a another user is typing.
      if (data['type'] == 'response_user_activity') {
        var pk = data['message'][2];
        var name = data['message'][1];
        var activity = data['message'][0];
        if (activity == 'yes'){
          // If a user is typing.
          root.getByTitle2('chats').getByTitle2('chat' + pk).listTyping.create2(new List(name, name.toLowerCase()));
        } else {
          // If a user is no longer typing.
          root.getByTitle2('chats').getByTitle2('chat' + pk).listTyping.removeByTitle(name.toLowerCase());
        }
      }

      // When and membership status changes.
      if(data['type'] == 'response_membership_updated') {
        var group = data['message'];
        var pk = data['message']['room']['pk'];
        var chat = root.getByTitle2('chats').getByTitle2('chat' + pk);

        if (chat != false) {
          // When the chat exist on the page only update the current memberships.
          var members = data['message']['members'];
          for (var member of members) {
            chat.updateMembership(member);
          }
        } else {
          // Add the chat to page.
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

      // When a member check if your online.
      if (data['type'] == 'ping'){
          // Send a ping back.
          socket.send(JSON.stringify({
          'type': 'ping', 'from': data['from']
          }));
          root.getByTitle2('onlineusers').create2(new List(data['from'], data['from'].toLowerCase()))
          for (var chat of root.getByTitle2('chats').items) {
              // Update the member status to online.
              var member = chat.headerTitle.getByTitle2(data['from'].toLowerCase());
              if (member != false) {
                member.status.setBackground('green');
              }
          }
      }

      // When another member is online.
      if (data['type'] == 'pong'){
          // Send a pong back.
          socket.send(JSON.stringify({
          'type': 'pong', 'from': data['from']
        }));
         root.getByTitle2('onlineusers').create2(new List(data['from'], data['from'].toLowerCase()))
          for (var chat of root.getByTitle2('chats').items) {
              var member = chat.headerTitle.getByTitle2(data['from'].toLowerCase());
              if (member != false) {
                member.status.setBackground('none');
              }
          }
      }

      // When another user is goes offline.
      if (data['type'] == 'offline') {
        socket.send(JSON.stringify({
        'type': 'offline', 'from': data['from']
        }));
        root.getByTitle2('onlineusers').removeByTitle(data['from'].toLowerCase())
        for (var chat of root.getByTitle2('chats').items) {
            chat.listTyping.removeByTitle(data['from'].toLowerCase());
            var member = chat.headerTitle.getByTitle2(data['from'].toLowerCase());
            if (member != false) {
              // Update membership to offline.
              member.status.setBackground('red');
            }
        }
      }


    // Add a newly created contact
    if (data['type'] == 'response_added_contact'){
      var contactsContainer = root.getByTitle2('contactsmenu');
      var createGroupContainer = root.getByTitle2('creategroupmenu');
      if (contactsContainer.getByTitle2(data['message'].toLowerCase()) == false) {
        // If the user not yet on the page add the user.
        var contactButton = contactsContainer.main.create2(new ContactPanelBtn(data['message'], data['message'].toLowerCase()),'start');
        var createGroupButton = createGroupContainer.main.create2(new Checkbox2(data['message'], data['message'].toLowerCase(), data['message'],'group'),'start');
        createGroupButton.template.style.backgroundColor = 'white';
        createGroupButton.body.innerHTML = data['message'];
      }
    }


    // Add contacts
    if (data['type'] == 'response_contacts'){
      var contactsContainer = root.getByTitle2('contactsmenu');
      var createGroupContainer = root.getByTitle2('creategroupmenu');
      for (var contact of data['message']) {
        if (contactsContainer.getByTitle2(contact['name'].toLowerCase()) == false) {
          // If the contact is not yet on the page add them.
          var contactButton = contactsContainer.main.create2(new ContactPanelBtn(contact['name'], contact['name']))
          var createGroupButton = createGroupContainer.main.create2(new Checkbox2(contact['name'], contact['name'].toLowerCase(), contact['name'],'group'),'start');
          createGroupButton.template.style.backgroundColor = 'white';
          createGroupButton.body.innerHTML = contact['name'];
        }
      }
    }


    // When searching for another member.
    if (data['type'] == 'search_results'){
      var resultsContainer = root.getByTitle2('findcontactmenu');
      resultsContainer.main.body.innerHTML = '';
      for (var result of data['message']) {
        // Add all results to the div.
        var button = resultsContainer.main.create2(new ResultsButton(result['name'],result['name']))
        button.body.innerHTML = result['name'];
      }
      if (data['message'].length == 0) {
        // Display no results.
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
      root.getByTitle2('chats').getByTitle2(chatTitle).loadMessages(messages);
    }


    // If a message gets deleted.
    if (data['type'] == 'response_message_deleted'){
      var messagePk = data['message']['messagePk'];
      var groupPk = data['message']['groupPk'];
      var chat = root.getByTitle2('chats').getByTitle2('chat' + groupPk)
      if (chat != false) {
        // Check if this chat exist on the page.
        chat.getByTitle2(messagePk).removed();
        if (chat.latestMessage.title == messagePk) {
          // Remove the message.
          chat.latestMessage.text = 'Removed';
          chat.updateLatestMessage();
        }
      }
    }


    // When recieving a message.
    if (data['type'] == 'message') {

      var pk = pk = data['to'];
      var chat = root.getByTitle2('chats').getByTitle2('chat' + pk);
      var newMessage = new Message(pk,data['message']['pk'].toString(), data['message']);
      var message = data['message']['message'];
      var chat = root.getByTitle2('chats').getByTitle2('chat' + pk);

      if (chat == false) {
          // If the chat does not exist update the membership status.
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

  }

};

connect();
