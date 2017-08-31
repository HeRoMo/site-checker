"use strict";
(function(){
  var disp = document.createElement("img")
  disp.setAttribute("class","disp")
  disp.setAttribute("style","display:none; position:fixed; top:10px; left:400px; width:600px; border:solid gray 3px; background-color:white; padding:10px; margin:10px")
  document.querySelector("body").appendChild(disp)

  var imgTags = document.querySelectorAll("img.capture");
  imgTags.forEach(function(img){
    img.addEventListener('mouseover', function(e){
      var src = e.target.src
      disp.setAttribute("src",src);
      disp.style.display="block"
    })
    img.addEventListener('mouseout', function(){
      disp.style.display="none"
    })
  })
})();
