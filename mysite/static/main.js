

var groups = []
var contacts = []
var online_users = [];
var chats = [];

var socket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/sendreceive/'
    + username
    + '/'
);

socket.onmessage = function(e) {
    const data = JSON.parse(e.data);

    if (data['type'] == 'ping'){
        socket.send(JSON.stringify({
        'type': 'ping', 'from': data['from']
        }));
    }

    if (data['type'] == 'pong'){
        socket.send(JSON.stringify({
        'type': 'pong', 'from': data['from']
        }));
    }

    if (data['type'] == 'receive_groups_of_self'){
        for (var group of data['message']){
            updateGroups(group)
        }
    }

    if (data['type'] == 'online_contacts'){
        online_users = [];
        for (let i = 0; i < data['message'].length; i++) {
              online_users.push(data['message'][i].name);
        }
        document.getElementById('online_contacts').innerHTML = 'online: ' + online_users
    }

    if (data['type'] == 'offline'){
        socket.send(JSON.stringify({
        'type': 'offline', 'from': data['from']
        }));
    }

    if (data['type'] == 'message'){
        pk = data['to']
        current_group = getGroup(pk)
        current_membership = getMembership(current_group)
        console.log('my currennt membership', current_membership)
        if (current_membership['status'] == 'inactive' || current_membership['status'] == 'deleted'){
            current_membership['status'] = 'active';
            updateMembershipStatus(pk, 'active');
            console.log('current_group', current_group)
            addGroup(current_group);
            addMessage(data['to'],data['message'])
        } else {
            addMessage(data['to'],data['message'])
        }
      }


            if (data['type'] == 'membership_has_been_updated'){
              console.log('update')
                group = data['message'];
                pk = group['room']['pk'];
                old_group = getGroup(pk);

                new_membership = getMembership(group);
                if (old_group != false){
                  old_membership = getMembership(old_group);

                  // Check if your status has been updated
                  if (old_membership['status'] != new_membership['status']){
                    console.log('my membership changed')
                      if(new_membership['status'] == 'active' || new_membership['status'] == 'blocked'){

                          if (old_membership['status'] != 'left'){
                            addGroup(data['message']);
                          }

                          if (old_membership['status'] == 'left'){
                            setNavigation(group)
                          }

                          setNavigation(group)
                      } if (new_membership['status'] == 'left'){
                        setNavigation(group)
                      }
                  }
                  // Check if your role has been updated
                  if (old_membership['role'] != new_membership['role']){
                        if(new_membership['status'] == 'active'){
                              setNavigation(group)
                      }
                  }

                } else {
                    if (data['from'] == '{{ user }}'){

                        new_membership['status'] = 'active'
                        updateMembershipStatus(pk, 'active');
                        addGroup(data['message']);

                    }
                }

                updateGroups(group);

                membership = getMembership(group)
                if (group['room']['type'] == 'group'){
                    if (membership['status'] == 'active'){
                        setGroupTitle(group)
                        if (membership['role'] == 'admin'){
                          setAdminPanel(group)
                        }
                    }
                  }
            }


            if (data['type'] == 'search_results'){
                searchResults(data);
            }

        };
