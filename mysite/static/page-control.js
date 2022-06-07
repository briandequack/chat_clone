
var selectedGroup = [];

function selectGroup(self) {

}


function closeMenu() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  if(w > 768){
    if(menu.style.visibility == 'visible'){
      menu = document.getElementById('left');
      menu.style.visibility = 'hidden';
    }
  }
}


function hideMenu(){
//  menu = document.getElementById('left');
//  menu.style.visibility = 'hidden';
}


$(document).ready(function () {
  $(document).click(function (event) {
    $('.sub').collapse('hide');
    hideMenu();
  });
});


function toggle(){
  /*
  menu = document.getElementById('left');
  if(menu.style.visibility == 'visible'){
    menu.style.visibility = 'hidden';
  } else {
    menu.style.visibility = 'visible';
  }*/
}


function openGroup(group){
  var idSuffix = group['room']['pk'];
    $('#nav-home-tab').click();
    $('#nav-tab-group' + idSuffix).click();
}

function openContacts(){
    $('#nav-profile-tab').click();
}

function openSearch(){
    console.log('open search');
    $('#nav-tab-group-search').click();
}

function openCreateGroup(){
    $('#nav-home-tab').click();
}
