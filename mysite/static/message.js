
class Message extends Container{
  constructor(displayName, title, message) {
    super(displayName, title);
    this.pk = message['pk'];
    this.text = message['text'];
    this.author = message['from'];
    this.timestamp = message['timestamp'];
    this.status = message['status'];


    if (this.status == 'silent'){

      this.template = cloneHTML('message-system',this.title,this.title);
    } else {
      if (this.author == username) {
        this.template = cloneHTML('message-self',this.title,this.title);
      } else {
        this.template = cloneHTML('message',this.title,this.title);
      }
    }
    this.body = this.template.getElementsByClassName('body')[0];
  }

  meta(){
    this.addChildren();
  }

  addChildren() {
    if (this.status == 'default') {
      this.default();

    } else if (this.status == 'removed') {
      this.removed();
    } else if (this.status == 'silent') {
      this.silent();
    }



  }

  silent() {
    console.log(this.text)
    this.textContainer = this.create2(new TextField('Text', 'text'));
    this.textContainer.body.innerHTML = this.text;
  }

  default() {
    this.textContainer = this.create2(new TextField('Text', 'text'));
    this.textContainer.body.innerHTML = this.text;
    this.timeStampContainer = this.create2(new TextField('Timestamp', 'timestamp'));
    this.timeStampContainer.body.innerHTML = getTimeString(this.timestamp);
    this.timeStampContainer.template.style.fontSize = '12px';
    this.authorContainer = this.create2(new TextField('Text', 'author'));
    this.authorContainer.template.style.fontSize = '12px';
    this.authorContainer.body.innerHTML = this.author;
    this.deleteButton = this.create2(new DeleteMessage('Text', 'deletemessage'));
    this.deleteButton.template.style.fontSize = '10px';
    this.deleteButton.template.style.padding = '2px';
    this.deleteButton.template.style.borderRadius = '0px';
    if (this.author == username) {
      this.textContainer.body.style.color = 'white';
      this.timeStampContainer.template.style.color = 'white';
      this.authorContainer.template.style.color = 'white';
    }
  }

  removed() {
    this.removeAll();
    this.textContainer = this.create2(new TextField('Text', 'text'));
    this.textContainer.body.innerHTML = 'Removed';
  }

}

class DeleteMessage extends BasicButton{
  constructor() {
    super(arguments[0], arguments[1]);
    this.body.innerHTML = 'Delete';

  }

  request() {
    socket.send(JSON.stringify({
      'type': 'delete_message', 'message': {'messagePk':this.par.pk, 'groupPk': this.getAncestors('constructor', 'Chat2')[0].pk}, 'from': from
    }));
  }
}
