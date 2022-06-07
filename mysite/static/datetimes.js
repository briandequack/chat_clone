


function updateDateTime(user){
    var classes = document.getElementsByClassName('%ltsn' + user['name']);
    timestring = getTimeString(user['last_seen']);
    for (var myClass of classes){
        myClass.innerHTML = timestring;
    }
}

function updateStatus(user, status){
    var classes = document.getElementsByClassName('ltsn' +'-'+ user['name']);
    console.log('HHAHAHAH', status)
    for (var myClass of classes){
        myClass.innerHTML = status;
    }
}

function  getCurrentDateISO(){
  const now = new Date();
  let iso = now.toISOString();
  return iso
}

function getTimeString(dateISOString){

      var timestamp = new Date(dateISOString);
      var year = timestamp.getFullYear();
      var month = timestamp.getMonth()+1;
      var day = timestamp.getDate();
      var hour = timestamp.getHours();
      var minutes = timestamp.getMinutes();

      if(minutes<10){
          minutes = '0' + minutes;
      }

      var time = hour +':'+ minutes;
      var date = day +'-'+ month + '-' + year;

      var timestamp_now = new Date();
      var year_now = timestamp_now.getFullYear()
      var month_now = timestamp_now.getMonth()+1;
      var day_now = timestamp_now.getDate();

      // Check if it is today
      timestamp_day = year +'-' + month+'-' + day;
      today = year_now +'-' + month_now+'-' + day_now;
      if(timestamp_day == today){
          var string = 'Today' + ' - ' + time;
      } else {
          var string = date + ' - ' + time
      }

      return string
}
