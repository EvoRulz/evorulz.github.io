(function(){
  function _buildFontList(){
    var sel=document.getElementById('s-font');
    var list=document.getElementById('font-picker-list');
    if(!sel||!list)return;
    list.innerHTML='';
    var rect=document.getElementById('font-picker-trigger').getBoundingClientRect();
    list.style.left=rect.left+'px';
    list.style.top=(rect.bottom+2)+'px';
    list.style.width=Math.max(rect.width,180)+'px';
    Array.from(sel.options).forEach(function(opt){
      var d=document.createElement('div');
      d.className='font-picker-option';
      d.textContent=opt.text;
      d.style.fontFamily=opt.value;
      d.dataset.value=opt.value;
      if(sel.value===opt.value)d.classList.add('selected');
      d.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();});
      d.addEventListener('click',function(e){
        e.stopPropagation();
        sel.value=opt.value;
        sel.dispatchEvent(new Event('change'));
        var lbl=document.getElementById('font-picker-label');
        lbl.textContent=opt.text;lbl.style.fontFamily=opt.value;
        list.querySelectorAll('.font-picker-option').forEach(function(x){x.classList.remove('selected');});
        d.classList.add('selected');
        list.classList.remove('open');
      });
      list.appendChild(d);
    });
    var selected=list.querySelector('.selected');
    if(selected)setTimeout(function(){selected.scrollIntoView({block:'nearest'});},10);
  }
  window.fontPickerToggle=function(e){
    if(e)e.stopPropagation();
    var list=document.getElementById('font-picker-list');
    if(list.classList.contains('open')){list.classList.remove('open');}
    else{_buildFontList();list.classList.add('open');}
  };
  window.fontPickerSync=function(){
    var sel=document.getElementById('s-font');
    if(!sel)return;
    var opt=sel.options[sel.selectedIndex];
    if(!opt)return;
    var lbl=document.getElementById('font-picker-label');
    if(lbl){lbl.textContent=opt.text;lbl.style.fontFamily=opt.value;}
  };
  document.addEventListener('click',function(e){
    if(!e.target.closest('#font-picker-wrap')&&!e.target.closest('#font-picker-list')){
      var list=document.getElementById('font-picker-list');
      if(list)list.classList.remove('open');
    }
  });
})();