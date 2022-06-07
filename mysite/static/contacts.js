
function addContactToDatabase(username){
    console.log('Request: add', username, 'to DB.')
    socket.send(JSON.stringify({
      'type': 'add_contact', 'message': username
    }));
}


function addContact(self) {
  var contact = {'name':self.id.replace('search-content-username-add', "")}
  addContactToDatabase(contact['name']);
  addContactToList(contact);
  toggleAdd(contact);
}

function removeContact(self, origin = ''){

    if(origin == 'search'){
        var contact = {'name':self.id.replace('search-content-username-remove', "")}
    } else {
        var contact = {'name':self.id.replace('contacts-content-username-remove', "")}
    }

    removeContactFromDatabase(contact['name']);
    removeContactFromList(contact);
    toggleRemove(contact);
}




function checkIfContact(username, contacts){
    for(var contact of contacts){
        if(contact['name'] == username){
            return true;
        }
    }
    return false
}

function isContactInGroup(contact, group){
    for(var member of group['members']){
        if(contact['name'] == member['name'] && member['membership'] == 'active'){
            return true
        }
    }
    return false
}


function addContactToList(contact){

    for(var group of groups){
        if(group['room']['type'] == 'group'){
            addContactToInvitePanel(contact, group);
        }
    }

    // contact list
    var container = document.getElementById("contacts-content-list");

    var contactListItemExist = document.getElementById("contacts-content-username" + contact['name']);
    if (contactListItemExist == null){
        //console.log('ADD', username)
        template = cloneHTML("contacts-content-item", contact['name'], contact['name']);
        container.appendChild(template);
        document.getElementById("contacts-content-username" + contact['name']).innerHTML = contact['name'];
    }

    // create group list
    var container = document.getElementById("group-content-list");

    var contactListItemExist = document.getElementById("group-content-username" + contact['name']);
    if (contactListItemExist == null){
          template = cloneHTML("group-content-item", contact['name'],contact['name']);
          container.appendChild(template);
          document.getElementById("group-content-username" + contact['name']).innerHTML = contact['name'];
    }

    getContactDateTime(contact['name']);
}

function removeContactFromList(contact){

  for(var group of groups){
      if(group['room']['type'] == 'group'){
          removeContactFromInvitePanel(contact, group);
      }
  }


  // remove from contact list
  document.getElementById("contacts-content-item" + contact['name']).remove();

  // remove from private list
  document.getElementById("group-content-item" + contact['name']).remove();



}


function toggleRemove(contact){
    searchResult = document.getElementById('result-options'+contact['name']);
    if(searchResult != null){
      document.getElementById('result-options'+contact['name']).innerHTML = '';
      optionsHolder = document.getElementById('result-options'+contact['name']);
      optionsTemplate = cloneHTML("search-result-options", contact['name']);
      optionsHolder.appendChild(optionsTemplate);
    }
}

function toggleAdd(contact){
    searchResult = document.getElementById('result-options'+contact['name']);
    if(searchResult != null){
      document.getElementById('result-options'+contact['name']).innerHTML = '';
      optionsHolder = document.getElementById('result-options'+contact['name']);
      optionsTemplate = cloneHTML("search-result-options-contact", contact['name']);
      optionsHolder.appendChild(optionsTemplate);
    }
}
