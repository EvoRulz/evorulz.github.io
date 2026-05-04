// @version 1230

document.querySelectorAll('.alpha-slider').forEach(function(s){
  if (s.closest('.color-settings-row')) return;
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;z-index:10;cursor:pointer;touch-action:pan-y;';
  var par = s.parentElement;
  if(getComputedStyle(par).position === 'static') par.style.position = 'relative';
  par.appendChild(overlay);

var dragging = false;
  var grabOffsetX = 0;
  var initialValue = 0;
  var grabClientX = 0;
  var cachedRect = null;
  var cachedHandleW = 16;
  var cachedMin = 0;
  var cachedMax = 255;

  overlay.addEventListener('pointerdown', function(e){
    cachedRect = s.getBoundingClientRect();
    cachedMin = parseFloat(s.min)||0;
    cachedMax = parseFloat(s.max)||255;
    cachedHandleW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slider-handle-w'))||16;
    var ratio = (parseFloat(s.value)-cachedMin)/(cachedMax-cachedMin);
    var thumbCX = cachedRect.left + ratio*(cachedRect.width-cachedHandleW) + cachedHandleW/2;
    var hitRadius = Math.max(cachedHandleW, 28);
    if (Math.abs(e.clientX - thumbCX) > hitRadius) return;
    overlay.style.touchAction = 'none';
    s.classList.add('handle-active');
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    grabOffsetX = e.clientX - thumbCX;
    initialValue = parseFloat(s.value);
    grabClientX = e.clientX;
    overlay.setPointerCapture(e.pointerId);
  });

  overlay.addEventListener('pointermove', function(e){
    if(!dragging) return;
    e.preventDefault();
    e.stopPropagation();
    var trackLeft = cachedRect.left + cachedHandleW / 2;
    var trackWidth = cachedRect.width - cachedHandleW;
    var ratio = (e.clientX - trackLeft) / trackWidth;
    var newVal = cachedMin + ratio * (cachedMax - cachedMin);
    s.value = Math.max(cachedMin, Math.min(cachedMax, newVal));
    s.dispatchEvent(new Event('input', {bubbles:true}));
  });

  overlay.addEventListener('pointerup', function(e){
    if(dragging){ e.stopPropagation(); }
    dragging = false;
    grabOffsetX = 0;
    overlay.style.touchAction = 'pan-y';
    s.classList.remove('handle-active');
  });
  overlay.addEventListener('pointercancel', function(){
    dragging = false;
    grabOffsetX = 0;
    overlay.style.touchAction = 'pan-y';
    s.classList.remove('handle-active');
  });
});


