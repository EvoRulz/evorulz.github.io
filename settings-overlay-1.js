// @version 1465
document.body.insertAdjacentHTML('beforeend', `
<!-- Settings overlay -->
<div id="settings-overlay">
  <div id="settings-panel">
    <div id="settings-groups-grid">
      <div class="settings-group-item" data-group="sg-buttons">Buttons</div>
      <div class="settings-group-item" data-group="sg-sliders">Sliders</div>
      <div class="settings-group-item" data-group="sg-clock">Clock</div>
      <div class="settings-group-item" data-group="sg-checkboxes">Checkboxes</div>
      <div class="settings-group-item" data-group="sg-app">App</div>
      <div class="settings-group-item" data-group="sg-tables">Tables</div>
      <div class="settings-group-item" data-group="sg-notifications">Notifications</div>
      <div class="settings-group-item" data-group="sg-swatches">Swatches</div>
      <div class="settings-group-item" data-group="sg-toggles">Toggles</div>
    </div>
    <div class="settings-group-content" id="sg-buttons">
      <div id="cf-outer" style="margin-left:-20px;margin-right:-20px;">
        <div id="cf-stage"></div>
      </div>
      <div id="cf-select-bar" style="display:flex;align-items:center;gap:8px;padding:6px 0 4px 0;flex-wrap:wrap;">
        <div id="cf-sel-count" style="font-size:11px;color:#555;min-height:13px;flex-shrink:0;"></div>
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;color:#aaa;cursor:pointer;user-select:none;-webkit-user-select:none;"><input type="checkbox" id="cf-sel-all" style="width:14px;height:14px;margin:0;cursor:pointer;"> Select All</label>
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;color:#aaa;cursor:pointer;user-select:none;-webkit-user-select:none;"><input type="checkbox" id="cf-sel-current" style="width:14px;height:14px;margin:0;cursor:pointer;"> Select</label>
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;color:#aaa;cursor:pointer;user-select:none;-webkit-user-select:none;"><input type="checkbox" id="cf-sel-group" style="width:14px;height:14px;margin:0;cursor:pointer;"> Group:</label>
        <div id="cf-group-wrap" style="position:relative;flex:1;min-width:0;">
          <input id="cf-group-input" type="text" placeholder="Group..." autocomplete="off" spellcheck="false" style="width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:2px 6px;font-size:12px;outline:none;box-sizing:border-box;">
          <div id="cf-group-dropdown" style="display:none;position:fixed;background:#1a1a1a;border:1px solid #555;border-radius:6px;z-index:99999;overflow-y:auto;max-height:200px;min-width:140px;box-shadow:0 4px 16px rgba(0,0,0,0.7);"></div>
        </div>
      </div>
      <div class="color-settings-row" data-btn-row="bg">
        <label>Background color</label>
        <div class="color-picker-row">
          <input type="color" id="s-bg" oninput="onColorPickerChange('s-bg')">
          <input type="range" class="alpha-slider" id="s-bg-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-bg')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-bg-hex" maxlength="9" oninput="onHexInput('s-bg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-bg',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-btn-row="fg">
        <label>Text color</label>
        <div class="color-picker-row">
          <input type="color" id="s-fg" oninput="onColorPickerChange('s-fg')">
          <input type="range" class="alpha-slider" id="s-fg-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-fg')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-fg-hex" maxlength="9" oninput="onHexInput('s-fg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-fg',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-btn-row="glow">
        <label>Glow color</label>
        <div class="color-picker-row">
          <input type="color" id="s-glow" oninput="onColorPickerChange('s-glow')">
          <input type="range" class="alpha-slider" id="s-glow-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-glow')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-glow-hex" maxlength="9" oninput="onHexInput('s-glow')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-glow',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-btn-row="activeglow">
        <label>Active glow color</label>
        <div class="color-picker-row">
          <input type="color" id="s-activeglow" oninput="onColorPickerChange('s-activeglow')">
          <input type="range" class="alpha-slider" id="s-activeglow-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-activeglow')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-activeglow-hex" maxlength="9" oninput="onHexInput('s-activeglow')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-activeglow',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-btn-row="activebg">
        <label>Active background</label>
        <div class="color-picker-row">
          <input type="color" id="s-activebg" oninput="onColorPickerChange('s-activebg')">
          <input type="range" class="alpha-slider" id="s-activebg-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-activebg')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-activebg-hex" maxlength="9" oninput="onHexInput('s-activebg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-activebg',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-btn-row="tap">
        <label>Tap color</label>
        <div class="color-picker-row">
          <input type="color" id="s-tap" oninput="onColorPickerChange('s-tap')">
          <input type="range" class="alpha-slider" id="s-tap-alpha" min="0" max="255" value="64" oninput="onAlphaChange('s-tap')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-tap-hex" maxlength="9" oninput="onHexInput('s-tap')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-tap',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-btn-row="fgstroke">
        <label>Text outline color</label>
        <div class="color-picker-row">
          <input type="color" id="s-fgstroke" oninput="onColorPickerChange('s-fgstroke')">
          <input type="range" class="alpha-slider" id="s-fgstroke-alpha" min="0" max="255" value="0" oninput="onAlphaChange('s-fgstroke')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-fgstroke-hex" maxlength="9" oninput="onHexInput('s-fgstroke')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-fgstroke',this)">Copy</button>
        </div>
      </div>
      <div class="settings-row" data-btn-row="fgstrokew">
        <label>Text outline width <span id="s-fgstrokew-val">0px</span></label>
        <input type="range" class="alpha-slider" id="s-fgstrokew" min="0" max="20" value="0" oninput="document.getElementById('s-fgstrokew-val').textContent=this.value+'px';settingsChange()">
      </div>
      <div class="color-settings-row" data-btn-row="border">
        <label>Border color</label>
        <div class="color-picker-row">
          <input type="color" id="s-border" oninput="onColorPickerChange('s-border')">
          <input type="range" class="alpha-slider" id="s-border-alpha" min="0" max="255" value="0" oninput="onAlphaChange('s-border')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-border-hex" maxlength="9" oninput="onHexInput('s-border')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-border',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-btn-row="activeborder">
        <label>Active border color</label>
        <div class="color-picker-row">
          <input type="color" id="s-activeborder" oninput="onColorPickerChange('s-activeborder')">
          <input type="range" class="alpha-slider" id="s-activeborder-alpha" min="0" max="255" value="0" oninput="onAlphaChange('s-activeborder')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-activeborder-hex" maxlength="9" oninput="onHexInput('s-activeborder')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-activeborder',this)">Copy</button>
        </div>
      </div>
      <div class="settings-row" data-btn-row="radius">
        <label>Corner radius <span id="s-radius-val">6px</span></label>
        <input type="range" class="alpha-slider" id="s-radius" min="0" max="50" value="6" oninput="document.getElementById('s-radius-val').textContent=this.value+'px';settingsChange()">
      </div>
      <div class="settings-row" data-btn-row="fontsize">
        <label>Text height <span id="s-fontsize-val">16px</span></label>
        <input type="range" class="alpha-slider" id="s-fontsize" min="8" max="60" value="16" oninput="document.getElementById('s-fontsize-val').textContent=this.value+'px';settingsChange()">
      </div>
      <div class="settings-row" data-btn-row="fontscalex">
        <label>Text width <span id="s-fontscalex-val">100%</span></label>
        <input type="range" class="alpha-slider" id="s-fontscalex" min="50" max="200" value="100" oninput="document.getElementById('s-fontscalex-val').textContent=this.value+'%';settingsChange()">
      </div>
      <div class="settings-row" data-btn-row="fontweight">
        <label>Text thickness <span id="s-fontweight-val">400</span></label>
        <input type="range" class="alpha-slider" id="s-fontweight" min="1" max="900" value="400" oninput="document.getElementById('s-fontweight-val').textContent=this.value;settingsChange()">
      </div>
        <div class="settings-row" data-btn-row="font">
        <label>Font</label>
        <select id="s-font" onchange="settingsChange()" style="display:none">
          <option value="sans-serif">Sans-serif</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
          <option value="cursive">Cursive</option>
          <option value="fantasy">Fantasy</option>
          <option value="system-ui">System UI</option>
          <option value="'Roboto', sans-serif">Roboto</option>
          <option value="'Open Sans', sans-serif">Open Sans</option>
          <option value="'Noto Sans', sans-serif">Noto Sans</option>
          <option value="'Montserrat', sans-serif">Montserrat</option>
          <option value="'Poppins', sans-serif">Poppins</option>
          <option value="'Raleway', sans-serif">Raleway</option>
          <option value="'Oswald', sans-serif">Oswald</option>
          <option value="'Jost', sans-serif">Jost</option>
          <option value="'Josefin Sans', sans-serif">Josefin Sans</option>
          <option value="'Rubik', sans-serif">Rubik</option>
          <option value="'Work Sans', sans-serif">Work Sans</option>
          <option value="'Nunito', sans-serif">Nunito</option>
          <option value="'Exo 2', sans-serif">Exo 2</option>
          <option value="'Titillium Web', sans-serif">Titillium Web</option>
          <option value="'Teko', sans-serif">Teko</option>
          <option value="'Roboto Condensed', sans-serif">Roboto Condensed</option>
          <option value="'Arimo', sans-serif">Arimo</option>
          <option value="'PT Sans', sans-serif">PT Sans</option>
          <option value="'Ubuntu', sans-serif">Ubuntu</option>
          <option value="'Comfortaa', sans-serif">Comfortaa</option>
          <option value="'Philosopher', sans-serif">Philosopher</option>
          <option value="'Libre Franklin', sans-serif">Libre Franklin</option>
          <option value="'Noto Serif', serif">Noto Serif</option>
          <option value="'Merriweather', serif">Merriweather</option>
          <option value="'Playfair Display', serif">Playfair Display</option>
          <option value="'Lora', serif">Lora</option>
          <option value="'EB Garamond', serif">EB Garamond</option>
          <option value="'Libre Baskerville', serif">Libre Baskerville</option>
          <option value="'Roboto Slab', serif">Roboto Slab</option>
          <option value="'PT Serif', serif">PT Serif</option>
          <option value="'Gelasio', serif">Gelasio</option>
          <option value="'Unna', serif">Unna</option>
          <option value="'Cinzel', serif">Cinzel</option>
          <option value="'Abril Fatface', cursive">Abril Fatface</option>
          <option value="'Dancing Script', cursive">Dancing Script</option>
          <option value="'Roboto Mono', monospace">Roboto Mono</option>
          <option value="'Fira Code', monospace">Fira Code</option>
          <option value="'Source Code Pro', monospace">Source Code Pro</option>
          <option value="'Inconsolata', monospace">Inconsolata</option>
          <option value="'IBM Plex Mono', monospace">IBM Plex Mono</option>
          <option value="'Cousine', monospace">Cousine</option>
          <option value="'PT Mono', monospace">PT Mono</option>
          <option value="'Ubuntu Mono', monospace">Ubuntu Mono</option>
          <option value="ui-monospace">UI Monospace</option>
        </select>
        <div id="font-tumbler-wrap" style="flex:1;max-width:180px;background:#1c1c1c;border:1px solid #444;border-radius:6px;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;min-height:52px;"></div>
      </div>
    </div>
    <div class="settings-group-content" id="sg-sliders">
      <div class="color-settings-row" data-slider-row="sliderborder"><span class="slider-row-handle">⠿</span>
        <label>Slider border color</label>
        <div class="color-picker-row">
          <input type="color" id="s-sliderborder" oninput="onColorPickerChange('s-sliderborder')">
          <input type="range" class="alpha-slider" id="s-sliderborder-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-sliderborder')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-sliderborder-hex" maxlength="9" oninput="onHexInput('s-sliderborder')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-sliderborder',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-slider-row="slidertrack"><span class="slider-row-handle">⠿</span>
        <label>Slider track background</label>
        <div class="color-picker-row">
          <input type="color" id="s-slidertrack" oninput="onColorPickerChange('s-slidertrack')">
          <input type="range" class="alpha-slider" id="s-slidertrack-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-slidertrack')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-slidertrack-hex" maxlength="9" oninput="onHexInput('s-slidertrack')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-slidertrack',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-slider-row="sliderfill"><span class="slider-row-handle">⠿</span>
        <label>Slider fill color</label>
        <div class="color-picker-row">
          <input type="color" id="s-sliderfill" oninput="onColorPickerChange('s-sliderfill')">
          <input type="range" class="alpha-slider" id="s-sliderfill-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-sliderfill')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-sliderfill-hex" maxlength="9" oninput="onHexInput('s-sliderfill')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-sliderfill',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-slider-row="sliderhandle"><span class="slider-row-handle">⠿</span>
        <label>Handle color</label>
        <div class="color-picker-row">
          <input type="color" id="s-sliderhandle" oninput="onColorPickerChange('s-sliderhandle')">
          <input type="range" class="alpha-slider" id="s-sliderhandle-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-sliderhandle')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-sliderhandle-hex" maxlength="9" oninput="onHexInput('s-sliderhandle')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-sliderhandle',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-slider-row="sliderhandleborder"><span class="slider-row-handle">⠿</span>
        <label>Handle border color</label>
        <div class="color-picker-row">
          <input type="color" id="s-sliderhandleborder" oninput="onColorPickerChange('s-sliderhandleborder')">
          <input type="range" class="alpha-slider" id="s-sliderhandleborder-alpha" min="0" max="255" value="0" oninput="onAlphaChange('s-sliderhandleborder')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-sliderhandleborder-hex" maxlength="9" oninput="onHexInput('s-sliderhandleborder')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-sliderhandleborder',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-slider-row="sliderhandleglow"><span class="slider-row-handle">⠿</span>
        <label>Handle glow</label>
        <div class="color-picker-row">
          <input type="color" id="s-sliderhandleglow" oninput="onColorPickerChange('s-sliderhandleglow')">
          <input type="range" class="alpha-slider" id="s-sliderhandleglow-alpha" min="0" max="255" value="0" oninput="onAlphaChange('s-sliderhandleglow')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-sliderhandleglow-hex" maxlength="9" oninput="onHexInput('s-sliderhandleglow')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-sliderhandleglow',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-slider-row="sliderhandleactiveglow"><span class="slider-row-handle">⠿</span>
        <label>Handle active glow</label>
        <div class="color-picker-row">
          <input type="color" id="s-sliderhandleactiveglow" oninput="onColorPickerChange('s-sliderhandleactiveglow')">
          <input type="range" class="alpha-slider" id="s-sliderhandleactiveglow-alpha" min="0" max="255" value="217" oninput="onAlphaChange('s-sliderhandleactiveglow')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-sliderhandleactiveglow-hex" maxlength="9" oninput="onHexInput('s-sliderhandleactiveglow')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-sliderhandleactiveglow',this)">Copy</button>
        </div>
      </div>
      <div class="settings-row" data-slider-row="sliderh"><span class="slider-row-handle">⠿</span>
        <label>Slider height <span id="s-sliderh-val">8px</span></label>
        <input type="range" class="alpha-slider" id="s-sliderh" min="0" max="100" value="8" oninput="document.getElementById('s-sliderh-val').textContent=this.value+'px';settingsChange()">
      </div>
      <div class="settings-row" data-slider-row="sliderr"><span class="slider-row-handle">⠿</span>
          <label>Slider corners <span id="s-sliderr-val">4%</span></label>
          <input type="range" class="alpha-slider" id="s-sliderr" min="0" max="100" value="4" oninput="document.getElementById('s-sliderr-val').textContent=this.value+'%';settingsChange()">
        </div>
        <div class="settings-row" data-slider-row="sliderspread"><span class="slider-row-handle">⠿</span>
          <label>Corner spread <span id="s-sliderspread-val">4px</span></label>
          <input type="range" class="alpha-slider" id="s-sliderspread" min="0" max="100" value="4" oninput="document.getElementById('s-sliderspread-val').textContent=this.value+'px';settingsChange()">
        </div>
        <div class="settings-row" data-slider-row="sliderhandleh"><span class="slider-row-handle">⠿</span>
          <label>Handle height <span id="s-sliderhandleh-val">16px</span></label>
          <input type="range" class="alpha-slider" id="s-sliderhandleh" min="4" max="60" value="16" oninput="document.getElementById('s-sliderhandleh-val').textContent=this.value+'px';settingsChange()">
        </div>
        <div class="settings-row" data-slider-row="sliderhandler"><span class="slider-row-handle">⠿</span>
          <label>Handle corners <span id="s-sliderhandler-val">3%</span></label>
          <input type="range" class="alpha-slider" id="s-sliderhandler" min="0" max="100" value="3" oninput="document.getElementById('s-sliderhandler-val').textContent=this.value+'%';settingsChange()">
        </div>
        <div class="settings-row" data-slider-row="sliderw"><span class="slider-row-handle">⠿</span>
          <label>Slider width <span id="s-sliderw-val">100%</span></label>
          <input type="range" class="alpha-slider" id="s-sliderw" min="10" max="100" value="100" oninput="document.getElementById('s-sliderw-val').textContent=this.value+'%';settingsChange()">
        </div>
        <div class="settings-row" data-slider-row="sliderhandlehole"><span class="slider-row-handle">⠿</span>
          <label>Handle hole <span id="s-sliderhandlehole-val">0%</span></label>
          <input type="range" class="alpha-slider" id="s-sliderhandlehole" min="0" max="100" value="0" oninput="document.getElementById('s-sliderhandlehole-val').textContent=this.value+'%';settingsChange()">
        </div>
        <div class="settings-row" data-slider-row="sliderhandlew"><span class="slider-row-handle">⠿</span>
          <label>Handle width <span id="s-sliderhandlew-val">16px</span></label>
          <input type="range" class="alpha-slider" id="s-sliderhandlew" min="4" max="60" value="16" oninput="document.getElementById('s-sliderhandlew-val').textContent=this.value+'px';settingsChange()">
        </div>
        <div class="color-settings-row" data-slider-row="sliderbtnbg"><span class="slider-row-handle">⠿</span>
        <label>Button background</label>
        <div class="color-picker-row">
          <input type="color" id="s-sliderbtnbg" oninput="onColorPickerChange('s-sliderbtnbg')">
          <input type="range" class="alpha-slider" id="s-sliderbtnbg-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-sliderbtnbg')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-sliderbtnbg-hex" maxlength="9" oninput="onHexInput('s-sliderbtnbg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-sliderbtnbg',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-slider-row="sliderbtnfg"><span class="slider-row-handle">⠿</span>
        <label>Button text color</label>
        <div class="color-picker-row">
          <input type="color" id="s-sliderbtnfg" oninput="onColorPickerChange('s-sliderbtnfg')">
          <input type="range" class="alpha-slider" id="s-sliderbtnfg-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-sliderbtnfg')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-sliderbtnfg-hex" maxlength="9" oninput="onHexInput('s-sliderbtnfg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-sliderbtnfg',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-slider-row="sliderbtnborder"><span class="slider-row-handle">⠿</span>
        <label>Button border color</label>
        <div class="color-picker-row">
          <input type="color" id="s-sliderbtnborder" oninput="onColorPickerChange('s-sliderbtnborder')">
          <input type="range" class="alpha-slider" id="s-sliderbtnborder-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-sliderbtnborder')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-sliderbtnborder-hex" maxlength="9" oninput="onHexInput('s-sliderbtnborder')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-sliderbtnborder',this)">Copy</button>
        </div>
      </div>
      <div class="settings-row" data-slider-row="sliderbtnspacing"><span class="slider-row-handle">⠿</span>
          <label>Button spacing <span id="s-sliderbtnspacing-val">0px</span></label>
          <input type="range" class="alpha-slider" id="s-sliderbtnspacing" min="-15" max="20" value="0" oninput="document.getElementById('s-sliderbtnspacing-val').textContent=this.value+'px';settingsChange()">
        </div>
        <div class="settings-row" data-slider-row="sliderbtnw"><span class="slider-row-handle">⠿</span>
          <label>Button width <span id="s-sliderbtnw-val">22px</span></label>
          <input type="range" class="alpha-slider" id="s-sliderbtnw" min="4" max="60" value="22" oninput="document.getElementById('s-sliderbtnw-val').textContent=this.value+'px';settingsChange()">
        </div>
        <div class="settings-row" data-slider-row="sliderbtnh"><span class="slider-row-handle">⠿</span>
          <label>Button height <span id="s-sliderbtnh-val">22px</span></label>
          <input type="range" class="alpha-slider" id="s-sliderbtnh" min="4" max="60" value="22" oninput="document.getElementById('s-sliderbtnh-val').textContent=this.value+'px';settingsChange()">
        </div>
        <div class="settings-row" data-slider-row="sliderbtnr"><span class="slider-row-handle">⠿</span>
          <label>Button corners <span id="s-sliderbtnr-val">4px</span></label>
          <input type="range" class="alpha-slider" id="s-sliderbtnr" min="0" max="30" value="4" oninput="document.getElementById('s-sliderbtnr-val').textContent=this.value+'px';settingsChange()">
        </div>
      </div>
  </div>
</div>
`);

