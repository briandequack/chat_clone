

class User {
  constructor(member) {
    this.member = member;
    this.name = member['name'];
  }
}

class Contact extends User {
  constructor(member) {
    super(member);
    this.template = cloneHTML('contact', this.name, this.name, 'create');
    this.template.getElementsByClassName('username')[0].innerHTML = this.name;
  }
}

class ContactSelect extends User {
  constructor(member) {
    super(member);
    //this.template = cloneHTML('contactCreateGroup', this.name, this.name, 'create');
    var box = new CheckboxItem('createGroup', this.name);
    this.template = box.template;
    //this.template.getElementsByClassName('username')[0].innerHTML = this.name;
  }
}


class Members extends Container {
constructor(displayName, title, attribute,minItems=0) {
  super(displayName, title, minItems);
  }
}

class Contact2 extends Container {
constructor(member, minItems=0) {
  super(member['name'], member['name'], minItems=0);
  this.name = member['name'];
  }
}



class Member2 extends Container {
constructor(member, minItems=0) {
  super(member['name'], member['name'], minItems=0);
  this.name = member['name'];
  this.role = member['membership']['role'];
  this.lastSeen = member['membership']['last_seen'];
  this.status = member['membership']['status'];
  //this.updateMembership(member['membership'])
  }

  updateMembership(membership, updated = true) {

    if (this.status != membership['status'] || updated == false) {
      this.status = membership['status'];

      // FOR SELF
      if (this.name == username) {

        if (this.status == 'active'){
            if (this.par.par.type == 'group'){
                 this.par.par.getByTitle2('main').create2(new LeaveChatButton('Delete chat','leavechat', this.par.par.pk));
                 this.par.par.getByTitle2('chatinput').getByTitle2('input').template.disabled = false;
                 this.par.par.getByTitle2('chatinput').getByTitle2('input').template.innerHTML = '';
            }

        } else if (this.status == 'left'){
          //console.log('PPP2',this.par.par.getByTitle2('main'))
            this.par.par.getByTitle2('chatinput').getByTitle2('input').template.disabled = true;
            this.par.par.getByTitle2('chatinput').getByTitle2('input').template.innerHTML = '';
            this.par.par.getByTitle2('chatinput').getByTitle2('input').par.par.button.hide();
            this.par.par.getByTitle2('main').removeByTitle('leavechat')




        } else if (this.status == 'blocked'){

        }else {
          console.log('Turn off inputk', membership['status']);
        }

      // FOR OTHER
      } else {
        // WHEN OTHER IS IN THE GROUP OR IS INVITED TO THE GROUP
        if (this.status == 'active' || this.status == 'inactive') {
          if (this.par.par.type == 'group') {
            // REMOVE CONTACT FROM INVITE ADMIN MENU

            console.log('INVITE TO GROUP', this.par.par.pk);

            var removeFromGroup = root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('removemember');
            var checkbox = removeFromGroup.create2(new CheckboxAdmin(this.name, this.name.toLowerCase(), this.name, this.par.par.pk),'start')
            checkbox.body.innerHTML = this.name;

            var makeAdmin = root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('makeadmin');
            var checkbox = makeAdmin.create2(new CheckboxAdmin(this.name, this.name.toLowerCase(), this.name, this.par.par.pk),'start')
            checkbox.body.innerHTML = this.name;

            root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('invitemember').removeByTitle(this.name.toLowerCase());

            this.getAncestors('constructor', 'Chat2')[0].button.list.create2(new List(this.name,this.name.toLowerCase()));

            this.getAncestors('constructor', 'Chat2')[0].addUserToHeader(this.name);
          //  this.getAncestors('constructor', 'Chat2')[0].addUserToHeader(this.name);
            //var makeAdmin = root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('makeadmin').removeByTitle(this.name.toLowerCase());

            //this.par.par.getByTitle2('invitecontact').remove(this.name.toLowerCase());
            // ADD CONTACT TO REMOVE ADMMIN MENU
            //this.par.par.getByTitle2('removecontact').create2(new Checkbox2(this.name, this.name, this.name, this.par.par.pk),'start');
          }
          // ADD PERSON TO THE TITLE
        //  this.par.par.getByTitle2('headertitle').create2(new HeaderTitleMember(this.name,this.name));
        //  root.getByTitle2('panelbuttons').getByTitle2('chat'+ this.par.par.pk).getByTitle2('lefttop').create2(new TextField(this.name,this.name));

        }
        // WHEN OTHER BLOCKED GROUP
        else if (this.status == 'blocked') {
        //  this.chat.input.disable();
        }
        // WHEN OTHER LEFT OR DELETED GROUP
        else if (this.status == 'left' || this.status == 'left_and_deleted') {
          if (this.par.par.type == 'group') {
            // REMOVE CONTACT FROM INVITE ADMIN MENU
            // REMOVE MEMBER FROM GROIP
            console.log(this.par.par.getByTitle2('input'));
            var addToGroup = root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('invitemember');
            var checkbox = addToGroup.create2(new CheckboxAdmin(this.name, this.name.toLowerCase(), this.name, this.par.par.pk),'start')
            checkbox.body.innerHTML = this.name;

            root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('makeadmin').removeByTitle(this.name.toLowerCase());
            root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('removeadmin').removeByTitle(this.name.toLowerCase());
            root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('removemember').removeByTitle(this.name.toLowerCase());

            this.getAncestors('constructor', 'Chat2')[0].button.list.removeByTitle(this.name.toLowerCase());
            this.getAncestors('constructor', 'Chat2')[0].headerTitle.removeByTitle(this.name.toLowerCase());
            //var makeAdmin = root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('makeadmin');
            //var checkbox = makeAdmin.create2(new CheckboxAdmin(this.name, this.name.toLowerCase(), this.name, this.par.par.pk),'start')
            //checkbox.body.innerHTML = this.name;


          //  this.par.par.getByTitle2('removecontact').remove(this.name.toLowerCase());
            // ADD CONTACT TO REMOVE ADMMIN MENU
          //  this.par.par.getByTitle2('invitecontact').create2(new Checkbox2(this.name, this.name, this.name, this.par.par.pk),'start');
          }
          // REMOVE PERSON FROM TITLE
        //  this.par.par.getByTitle2('headertitle').removeByTitle(this.name.toLowerCase());
        //  root.getByTitle2('panelbuttons').getByTitle2('chat'+ this.par.par.pk).getByTitle2('lefttop').removeByTitle(this.name.toLowerCase());

        }

        else {
          console.log('Turn off input');
        }
      }
    }


    // If a role gets updates
    if (this.role != membership['role'] || updated == false) {

      this.role = membership['role'];
      // If role of self gets updated
      if (this.name == username) {
        if (this.role == 'admin') {
          // Change menu to admin menu
          this.par.par.buildMenu();

        } else {
          // Change menu to member menu
          this.par.par.buildMenu();
        }
      } else {
        // If role of other user updated
        if (this.role == 'admin') {
          if (this.par.par.type == 'group') {
              if (this.status == 'active' || this.status == 'inactive') {
                console.log('MAKE ADMIN', this.name,  this.par.par.pk)
                var removeAdmin = root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('removeadmin');
                var checkbox = removeAdmin.create2(new CheckboxAdmin(this.name, this.name.toLowerCase(), this.name, this.par.par.pk),'start')
                checkbox.body.innerHTML = this.name;

                var makeAdmin = root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('makeadmin').removeByTitle(this.name.toLowerCase());

              }

          }
        } else if(this.role == 'member') {
          if (this.par.par.type == 'group') {
              console.log('REMOVE ADMIN', this.name)
              if (this.status == 'active' || this.status == 'inactive') {
              var makeAdmin = root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('makeadmin');
              var checkbox = makeAdmin.create2(new CheckboxAdmin(this.name, this.name.toLowerCase(), this.name, this.par.par.pk),'start')
              checkbox.body.innerHTML = this.name;

              var removeAdmin = root.getByTitle2('chats').getByTitle2('chat' + this.par.par.pk).getByTitle2('removeadmin').removeByTitle(this.name.toLowerCase());
            }
        }
        }
      }
    }
  }


  getRole() {
    return this.role;
  }

}




class Member extends User {
  constructor(member, chat) {
    super(member);
    this.chat = chat;
    this.pk = this.chat.pk;
    this.role = member['membership']['role'];
    this.lastSeen = member['membership']['last_seen'];
    this.status = member['membership']['status'];
  }

  updateMembership(membership, updated = true) {

    if (this.status != membership['status'] || updated == false) {
        console.log('updated MEM!')
      this.status = membership['status'];

      // FOR SELF
      if (this.name == username) {

        if (this.status == 'active'){

          //root.getByTitle('chat'+this.pk).getByTitle('title').add(this.name);
          root.getByTitle('rightcontainer').getByTitle('chat'+this.pk).getByTitle('title').add(this.name);
          //this.chat.chatTitle.add(this.name);

          this.chat.tab.add(this.name);
          this.chat.input.enable();

          this.chat.options.member(this.status);

        } else if (this.status == 'left'){
          //root.getByTitle('chat'+this.pk).getByTitle('title').remove(this.name);
          root.getByTitle('rightcontainer').getByTitle('chat'+this.pk).getByTitle('title').remove(this.name);
          //this.chat.chatTitle.remove(this.name);

          this.chat.tab.remove(this.name);
          this.chat.input.disable();

          // OPTIONS
          this.chat.options.member(this.status);

        } else if (this.status == 'blocked'){
          this.chat.input.disable();

          // OPTIONS
          this.chat.options.member(this.status);
        }else {
          console.log('Turn off inputk', membership['status']);
        }

      } else {

        if (this.status == 'active' || this.status == 'inactive') {
          //root.getByTitle('chat'+this.pk).getByTitle('title').add(this.name);
          root.getByTitle('rightcontainer').getByTitle('chat'+this.pk).getByTitle('title').add(this.name);
          //this.chat.chatTitle.add(this.name);

          this.chat.tab.add(this.name);
          this.chat.input.enable();
          if (this.chat.type == 'group') {

            // OPTIONS
            var accordion = this.chat.options.menu.menu.getByDisplayName('Admin menu accordion'+this.pk);
            var inviteItem = new AccordionItem(null,'Invite', 'Invite', accordion);
            var removeItem = new AccordionItem(null,'Remove', 'Remove', accordion);
            var checkbox = new CheckboxItem(this.name, 'Remove'+this.pk);
            var submitBtn = new SubmitSelected('Remove', 'Remove'+this.pk, this.pk, 'Remove');

            accordion.getOrCreate(inviteItem).deleteByDisplayName(this.name);
            accordion.getOrCreate(removeItem).getOrCreate(checkbox, 'start');
            accordion.getOrCreate(removeItem).getOrCreate(submitBtn, 'end');


          }

        }
        else if (this.status == 'blocked') {
          this.chat.input.disable();
        }
        if (this.status == 'left' || this.status == 'left_and_deleted') {
          //root.getByTitle('chat'+this.pk).getByTitle('title').remove(this.name);
          root.getByTitle('rightcontainer').getByTitle('chat'+this.pk).getByTitle('title').remove(this.name);
          //this.chat.chatTitle.remove(this.name);

          this.chat.tab.remove(this.name);

          if (this.chat.type == 'group') {


            var accordion = this.chat.options.menu.menu.getByDisplayName('Admin menu accordion'+this.pk);
            var inviteItem = new AccordionItem(null,'Invite', 'Invite', accordion);
            var removeItem = new AccordionItem(null,'Remove', 'Remove', accordion);
            var checkbox = new CheckboxItem(this.name, 'Invite'+this.pk);
            var submitBtn = new SubmitSelected('Invite', 'Invite'+this.pk, this.pk, 'Invite');

            accordion.getOrCreate(removeItem).deleteByDisplayName(this.name);
            accordion.getOrCreate(inviteItem).getOrCreate(checkbox, 'start');
            accordion.getOrCreate(inviteItem).getOrCreate(submitBtn, 'end');

          }

        }

        else {
          console.log('Turn off input');
        }
      }
    }


    // If a role gets updates
    if (this.role != membership['role'] || updated == false) {

      this.role = membership['role'];
      // If role of self gets updated
      if (this.name == username) {
        if (this.role == 'admin') {
          // Change menu to admin menu
          this.chat.options.admin();
        } else {
          // Change menu to member menu
          this.chat.options.member(this.status);
        }
      } else {
        // If role of other user updated
        if (this.role == 'admin') {
          if (this.chat.type == 'group') {
            console.log('MAKE ADMIN', this.name, this.par)

         //this.getByTitle2('accordion').create2(new AccordionItem2('Remove admin','removeadmin'));
        //  this.getByTitle2('removeadmin').create2(new Checkbox2(member.name, member.name, member.name, this.par.par.pk),'start');
        //  this.getByTitle2('removeadmin').create2(new CheckboxSubmit2('Remove admin', 'removeadmin', 'remove_contact_group_admin'),'end');

          //this.getByTitle2('accordion').create2(new AccordionItem2('Make admin','makeadmin'));
          //this.getByTitle2('makeadmin').create2(new Checkbox2(member.name, member.name, member.name, this.par.par.pk),'start');
          //this.getByTitle2('makeadmin').create2(new CheckboxSubmit2('Make admin', 'makeadmin', 'make_contact_group_admin'),'end');

        //  var accordion = this.chat.options.menu.menu.getByDisplayName('Admin menu accordion'+this.pk);

          //var makeAdminItem = new AccordionItem(null,'Makeadmin', 'Makeadmin', accordion);
          //var removeAdminItem = new AccordionItem(null,'Removeadmin', 'Removeadmin', accordion);
          //var checkbox = new CheckboxItem(this.name, 'Removeadmin'+this.pk);
        //  var submitBtn = new SubmitSelected('Removeadmin', 'Removeadmin'+this.pk, this.pk, 'Removeadmin');

        //  accordion.getOrCreate(makeAdminItem).deleteByDisplayName(this.name);
        //  accordion.getOrCreate(removeAdminItem).getOrCreate(checkbox, 'start');
        //  accordion.getOrCreate(removeAdminItem).getOrCreate(submitBtn, 'end');

          }
        } else if(this.role == 'member') {
          if (this.chat.type == 'group') {

            var accordion = this.chat.options.menu.menu.getByDisplayName('Admin menu accordion'+this.pk);
            var makeAdminItem = new AccordionItem(null,'Makeadmin', 'Makeadmin', accordion);
            var removeAdminItem = new AccordionItem(null,'Removeadmin', 'Removeadmin', accordion);
            var checkbox = new CheckboxItem(this.name, 'Makeadmin'+this.pk);
            var submitBtn = new SubmitSelected('Makeadmin', 'Makeadmin'+this.pk, this.pk, 'Makeadmin');

            accordion.getOrCreate(removeAdminItem).deleteByDisplayName(this.name);
            accordion.getOrCreate(makeAdminItem).getOrCreate(checkbox, 'start');
            accordion.getOrCreate(makeAdminItem).getOrCreate(submitBtn, 'end');

        }
        }
      }
    }
  }


  getRole() {
    return this.role;
  }

}
