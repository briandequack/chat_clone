
document.onclick = test;

function test() {
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
     rootLeftSidebars[0].items[0].body.innerHTML = '☰';
     rootLeftSidebars[0].items[0].body.style.color = 'white';
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
}


function addGroup(group, openTab = false){

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


function updateMembershipStatus(pk, membership, from = username){
  socket.send(JSON.stringify({
    'type': 'update_membership_of_self', 'message': {'pk':pk,'membership':membership}, 'from': from
  }));
}
