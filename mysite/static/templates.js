

// Parameters: templateID; idSuffix; classSuffix++;
function cloneHTML() {
  const tags = ["div","ul","input","li","p", "button", "label", "span", "h5", "h2", "textarea", "small"];
  const templateId = arguments[0];
  const idSuffix = arguments[1];
  var node = document.getElementById(templateId).cloneNode(true);
  node.id = templateId + idSuffix;
  var new_arguments = Array.prototype.slice.call(arguments,2);
  new_arguments.unshift(node);
  changeClasses(new_arguments);
  for (let i = 0; i < tags.length; i++) {
    var list = node.getElementsByTagName(tags[i]);
    for (let element of list) {
    if (element.id.length != 0){
      element.id = element.id + idSuffix;
    }
    var new_arguments = Array.prototype.slice.call(arguments,2);
    new_arguments.unshift(element);
    changeClasses(new_arguments);
    }
  }
  return node;
};

// Parameters: HTML element; classSuffix++;
function changeClasses() {
  var arguments = arguments[0];
  const element = arguments[0];
  const classArray = element.className.split(" ");
  for (var className of classArray) {
    var suffixNum = className.split('%').length -1;
    if(suffixNum != 0) {
      var end = 0;
      if(suffixNum >= arguments.length-1) {
        end = arguments.length-1;
      } else {
        end = suffixNum;
      }
      var newClassName = className.slice(0, - suffixNum)
      for (let i = 1; i < end+1; i++) {
         newClassName += '-' + arguments[i];
      }
      element.classList.add(newClassName);
      element.classList.remove(className);
    }
  }
};
