
document.onclick = test;

function test() {
  console.log('click document')
//  console.log(urls)


  var activeElement = document.activeElement;

//var openMenus = root.getChildren('constructor', 'DropperBtn');
//for (var menu of openMenus) {
//  if (activeElement != menu.template) {
  //  menu.close();
    //console.log('YES', activeElement, menu.template)
//  }
//}


//



 var dirs = [];
 for (var string of activeElement.classList) {
   if (string.startsWith("n/")) {
     const n = string.split("/")[1];
     for (var url of urls) {
       if (n == url['n']) {
         dirs = url['url'].split("/").slice(1,-1);
         var currentDir = root;
         for (var dir of dirs) {
           currentDir = currentDir.getByTitle2(dir);
         }
         currentDir.click();
        }
     }
   }
 }

var rightSidebarsAncestors = currentDir.getAncestors('constructor', 'MaxDimensionsRight');
 var rootRightSidebars = root.getChildren('constructor', 'MaxDimensionsRight');
 if (rightSidebarsAncestors.length == 0) {
   if (currentDir.constructor.name != 'OpenOptionsButton'){
      if(rootRightSidebars.length != 0){
        for (var rsb of rootRightSidebars) {
          rsb.par.deselectChild(rsb.title)
        }

      }

   }

 }

 var leftSidebarsAncestors = currentDir.getAncestors('constructor', 'MaxDimensionsLeft');
 var rootLeftSidebars = root.getChildren('constructor', 'MaxDimensionsLeft');

 if (leftSidebarsAncestors.length == 0) {
   rootLeftSidebars[0].par.deselectChild(rootLeftSidebars[0].title)
 }

 var droppersAncestors = currentDir.getAncestors('constructor', 'MaxDimensionsLeft');
 var allDroppers = root.getChildren('constructor', 'DropperBtn');
 for (var dropper of allDroppers) {
   if (dropper != currentDir) {
     dropper.close();
   }
 }


 var chatPanelButtonAncestors = currentDir.getAncestors('constructor', 'ChatPanelButton');
 if (chatPanelButtonAncestors.length != 0) {
   if (currentDir.constructor.name != 'DeleteChatButton') {
     chatPanelButtonAncestors[0].request();
   }


 }

 var contactPanelButtonAncestors = currentDir.getAncestors('constructor', 'ContactPanelBtn');
 if (contactPanelButtonAncestors.length != 0) {
   if (currentDir.constructor.name == 'DropperBtn' || currentDir.constructor.name == 'DeleteContactButton'){

   } else {
     contactPanelButtonAncestors[0].request();
   }
 }


  //root.getByTitle2('leftcenterright').getByTitle2('left').setWidth(100);
  //root.getByTitle2('leftcenterright').getByTitle2('left').setMaxWidth(100);

  //root.getByTitle2('containerleft').setMaxWidth(100);
  //root.getByTitle2('containerleft').setWidth(100);
  //root.getByTitle2('containercenter').resize();
//  console.log('DOCUMENT CLICKED', root.getAllByProperty('open=true'));
/*
 var items = root.getAllByProperty('open=true');



var stuffs = root.getAllTemplates();
var parents = [];
for (var stuff of stuffs) {
  if(stuff.template == activeElement) {
  //  console.log('FOUDN IT', );
    if (stuff.ignoreParents != true) {
      parents = stuff.getParents();
   }
  }
}
console.log(stuff.length)

 if ( items != false) {

for (var item of items) {
  var found = false;
  //
    for (var parent of parents) {
      if (item.template == parent.template) {
        found = true;
      }
    }
//  }


  if (found == false) {
     if(activeElement != item.include.template){
      // item.par.deselect(item.title);
     }
  }


 }


 }

*/
};


function clickable(self,event) {

  var activeElement = document.activeElement;
  var dirs = [];
  for (var string of activeElement.classList) {
    if (string.startsWith("n/")) {
      const n = string.split("/")[1];
      for (var url of urls) {
        if (n == url['n']) {
          dirs = url['url'].split("/").slice(1,-1);
          var currentDir = root;
          for (var dir of dirs) {
            currentDir = currentDir.getByTitle2(dir);
          }
          currentDir.click();
         }
      }
    }
  }
  //var current_dir = root;
//  dirs.pop();



/*
//console.log('DIRRRR',dirs)
  for (var dir of dirs) {

    //console.log('A',current_dir.title);
    var new_dir = current_dir.getByTitle(dir);
    current_dir = new_dir;
  }
  current_dir.click()
  */
//  console.log('CURRENT', current_dir)
}


function addGroup(group, openTab = false){

  console.log('group', group)

  idSuffix = group['room']['pk'];

  var pk = group['room']['pk'];
  var members = group['members'];

  for (var member of members) {
    if (member['name'] == username) {
      var membership = member['membership']
      break;
    }
  }

  if(membership['status'] == 'active' || membership['status'] == 'left'|| membership['status'] == 'blocked'){
    groupExist = document.getElementById("chat-content"+ idSuffix);
    if (groupExist == null){


      var chatsContainer = root.getByTitle2('chats')
      var chatDisplayName = 'chat' + group['room']['pk'];


      //chat1.center.body.innerHTML = loremIpsum;

      chatsContainer.create2(new Chat2(chatDisplayName, chatDisplayName.toLowerCase(),0,1000,1000, group))

    //  var displayName = 'chat' + group['room']['pk'];
    //  var chat = new Chat(group,displayName, displayName);

    //  chats.push(chat);

    //  chatsContainer.create2(chat)

    //  //if (root.getByTitle2('mypanel').items.length == 0) {
  //    //  root.getByTitle2('mypanel').create2(new PageRightCenter(displayName + "p", displayName + "p"),'end', true);
  //  //  } else {
  //  //    root.getByTitle2('mypanel').create2(new PageRightCenter(displayName + "p", displayName + "p"));
//    //  }



//    //  root.getByTitle2(displayName + "p").getByTitle2('center').create2(chat);
    //  console.log('MFFF', root.getByTitle2(displayName + "p").par)
    //  root.getByTitle2('mypanel')



      //console.log('DIS NAME', root.getByTitle2('panelbuttons'))
      //console.log('content', root.getByTitle2('panelbuttons').items)


    ////  var chat2 = root.getByTitle2('mypanel').getByTitle2(displayName);

    ////  chat2.getMembers();
    ////  chat2.getMessages();



    //  root.getByTitle2('panelbuttons').create2(new PanelButton('asd', 'asd1', 'mypanel', 'a'));


    //  console.log('ROOT123123', root.getByTitle('rightcontainer').dir)

        return true;
      }
    }

      return false;
  };






  function removeContactFromDatabase(username){
    socket.send(JSON.stringify({
      'type': 'remove_contact', 'message': username
    }));
  }



function send(self){

    var pk = self.id.replace('chat-submit', "");
    //  console.log('send to', self);
    var message = document.getElementById('chat-input'+pk).value;
    document.getElementById('chat-input'+pk).value = '';
    socket.send(JSON.stringify({
        'type': 'message', 'message': message, 'from': username, 'to':pk
      }));
}



function submitMessage(self){
  var pk = self.id.replace('chat-input', "");
  var kcode = (window.event) ? event.keyCode : event.which;

  this.focus();


  if (kcode === 13) {
      var message = document.getElementById('chat-input'+pk).value;
      if (validateMessageInput(message)){
        document.getElementById('chat-input'+pk).value = '';
        socket.send(JSON.stringify({
          'type': 'message', 'message': message, 'from': username, 'to':pk
        }));
      }

  }
}



function stopProp(event){
    event.stopPropagation();
}

var searchPageActive = false;
function addSearchPage(){
    if (searchPageActive == false){
      searchPageholder = document.getElementById('nav-pane-group-search');
      searchPage = cloneHTML('search-page-inactive',1);
      searchPageholder.appendChild(searchPage);
      searchPageActive = true;
    } else{
      document.getElementById('nav-pane-group-search').innerHTML = '';
      searchPage = cloneHTML('search-page-active',1);
      searchPageholder.appendChild(searchPage);
    }



}

function searchResults(data){
    console.log('result',data)
    var container = document.getElementById("search-content-list1");
    container.innerHTML = '';
    for (var message of data['message']) {
      template = cloneHTML("search-content-item", message['name']);
      container.appendChild(template);
      document.getElementById("search-content-username" + message['name']).innerHTML = message['name'];

      optionsHolder = document.getElementById('result-options'+ message['name']);
      if (message['relation'] == 'contact'){
          optionsTemplate = cloneHTML("search-result-options-contact", message['name']);
      } else {
          optionsTemplate = cloneHTML("search-result-options", message['name']);
      }
      optionsHolder.appendChild(optionsTemplate);

    }
};

function search(self){

    searchTerm = document.getElementById('search-input1').value;

    socket.send(JSON.stringify({
        'type': 'search', 'message': searchTerm, 'from': username, 'to':''
    }));

    addSearchPage();
    openContacts();

}

function updateMembershipStatus(pk, membership, from = username){
  socket.send(JSON.stringify({
    'type': 'update_membership_of_self', 'message': {'pk':pk,'membership':membership}, 'from': from
  }));
}



//setInterval(checkSelfIsTyping, 500);
