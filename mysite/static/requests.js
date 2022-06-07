
function getGroups(){
    console.log('Requesting groups')
    socket.send(JSON.stringify({
       'type': 'request_groups', 'from': username, 'to': username
    }));
}

function getContactStatus(name){
    socket.send(JSON.stringify({
      'type': 'request_contact_status', 'from': username, 'to': name
    }));
}

function getContacts(){
    console.log('Requesting contacts')
    socket.send(JSON.stringify({
    'type': 'request_contacts', 'from': username
    }));
}

function getContactDateTime(name){
    socket.send(JSON.stringify({
    'type': 'request_user_datetime', 'message': {'name':name}, 'from': username
    }));
}
