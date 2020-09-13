'use strict';
(function() {
  let disp = document.createElement('img');
  disp.setAttribute('class', "disp");
  disp.setAttribute('style', "display:none; position:fixed; top:10px; left:400px; width:600px; border:solid gray 3px; background-color:white; padding:10px; margin:10px");
  document.querySelector('body').appendChild(disp);

  let imgTags = document.querySelectorAll('img.capture');
  imgTags.forEach(function(img) {
    img.addEventListener('mouseover', function(e) {
      let src = e.target.src;
      disp.setAttribute('src', src);
      disp.style.display='block'
    });
    img.addEventListener('mouseout', function() {
      disp.style.display='none'
    });
  });
})();
