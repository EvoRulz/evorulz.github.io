// @version 1393
document.getElementById('settings-panel').insertAdjacentHTML('beforeend', `
      <div class="settings-group-content" id="sg-clock">
      <div id="clock-tumbler-wrap" data-clock-row="tumbler"></div>
      <div class="color-settings-row"data-clock-row="datecolor">
        <label>Date color</label>
        <div class="color-picker-row">
          <input type="color" id="s-clock-date-color" oninput="onColorPickerChange('s-clock-date-color')">
          <input type="range" class="alpha-slider" id="s-clock-date-color-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-clock-date-color')" data-clock-picker="true">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-clock-date-color-hex" maxlength="9" oninput="onHexInput('s-clock-date-color')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-clock-date-color',this)">Copy</button>
        </div>
      </div>
      <div class="settings-row" data-clock-row="datesize">
        <label>Date text height <span id="s-clock-date-size-val">13px</span></label>
        <input type="range" class="alpha-slider" id="s-clock-date-size" min="8" max="60" value="13" oninput="document.getElementById('s-clock-date-size-val').textContent=this.value+'px';settingsChange()">
      </div>
      <div class="settings-row" data-clock-row="datescalex">
        <label>Date text width <span id="s-clock-date-scalex-val">100%</span></label>
        <input type="range" class="alpha-slider" id="s-clock-date-scalex" min="50" max="200" value="100" oninput="document.getElementById('s-clock-date-scalex-val').textContent=this.value+'%';settingsChange()">
      </div>
      <div class="settings-row" data-clock-row="dateweight">
        <label>Date text thickness <span id="s-clock-date-weight-val">400</span></label>
        <input type="range" class="alpha-slider" id="s-clock-date-weight" min="1" max="2000" value="400" oninput="document.getElementById('s-clock-date-weight-val').textContent=this.value;settingsChange()">
      </div>
      <div class="color-settings-row" data-clock-row="timecolor">
        <label>Time color</label>
        <div class="color-picker-row">
          <input type="color" id="s-clock-time-color" oninput="onColorPickerChange('s-clock-time-color')">
          <input type="range" class="alpha-slider" id="s-clock-time-color-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-clock-time-color')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-clock-time-color-hex" maxlength="9" oninput="onHexInput('s-clock-time-color')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-clock-time-color',this)">Copy</button>
        </div>
      </div>
      <div class="settings-row" data-clock-row="timesize">
        <label>Time text height <span id="s-clock-time-size-val">13px</span></label>
        <input type="range" class="alpha-slider" id="s-clock-time-size" min="8" max="60" value="13" oninput="document.getElementById('s-clock-time-size-val').textContent=this.value+'px';settingsChange()">
      </div>
      <div class="settings-row" data-clock-row="timescalex">
        <label>Time text width <span id="s-clock-time-scalex-val">100%</span></label>
        <input type="range" class="alpha-slider" id="s-clock-time-scalex" min="50" max="200" value="100" oninput="document.getElementById('s-clock-time-scalex-val').textContent=this.value+'%';settingsChange()">
      </div>
      <div class="settings-row" data-clock-row="timeweight">
        <label>Time text thickness <span id="s-clock-time-weight-val">400</span></label>
        <input type="range" class="alpha-slider" id="s-clock-time-weight" min="1" max="2000" value="400" oninput="document.getElementById('s-clock-time-weight-val').textContent=this.value;settingsChange()">
      </div>
      <div class="color-settings-row" data-clock-row="datebg">
        <label>Date background</label>
        <div class="color-picker-row">
          <input type="color" id="s-clock-date-bg" oninput="onColorPickerChange('s-clock-date-bg')">
          <input type="range" class="alpha-slider" id="s-clock-date-bg-alpha" min="0" max="255" value="0" oninput="onAlphaChange('s-clock-date-bg')" data-clock-picker="true">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-clock-date-bg-hex" maxlength="9" oninput="onHexInput('s-clock-date-bg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-clock-date-bg',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-clock-row="timebg">
        <label>Time background</label>
        <div class="color-picker-row">
          <input type="color" id="s-clock-time-bg" oninput="onColorPickerChange('s-clock-time-bg')">
          <input type="range" class="alpha-slider" id="s-clock-time-bg-alpha" min="0" max="255" value="0" oninput="onAlphaChange('s-clock-time-bg')" data-clock-picker="true">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-clock-time-bg-hex" maxlength="9" oninput="onHexInput('s-clock-time-bg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-clock-time-bg',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-clock-row="dateglow">
        <label>Date glow</label>
        <div class="color-picker-row">
          <input type="color" id="s-clock-date-glow" oninput="onColorPickerChange('s-clock-date-glow')">
          <input type="range" class="alpha-slider" id="s-clock-date-glow-alpha" min="0" max="255" value="0" oninput="onAlphaChange('s-clock-date-glow')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-clock-date-glow-hex" maxlength="9" oninput="onHexInput('s-clock-date-glow')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-clock-date-glow',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-clock-row="timeglow">
        <label>Time glow</label>
        <div class="color-picker-row">
          <input type="color" id="s-clock-time-glow" oninput="onColorPickerChange('s-clock-time-glow')">
          <input type="range" class="alpha-slider" id="s-clock-time-glow-alpha" min="0" max="255" value="0" oninput="onAlphaChange('s-clock-time-glow')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-clock-time-glow-hex" maxlength="9" oninput="onHexInput('s-clock-time-glow')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-clock-time-glow',this)">Copy</button>
        </div>
      </div>
      <div class="settings-row" data-clock-row="dateradius">
        <label>Date corner radius <span id="s-clock-date-radius-val">6px</span></label>
        <input type="range" class="alpha-slider" id="s-clock-date-radius" min="0" max="50" value="6" oninput="document.getElementById('s-clock-date-radius-val').textContent=this.value+'px';settingsChange()">
      </div>
      <div class="settings-row" data-clock-row="timeradius:">
        <label>Time corner radius <span id="s-clock-time-radius-val">6px</span></label>
        <input type="range" class="alpha-slider" id="s-clock-time-radius" min="0" max="50" value="6" oninput="document.getElementById('s-clock-time-radius-val').textContent=this.value+'px';settingsChange()">
      </div>
      </div>
    <div class="settings-group-content" id="sg-checkboxes">
      <div class="color-settings-row" data-checkbox-row="checked">
        <label>Checked background</label>
        <div class="color-picker-row">
          <input type="color" id="s-checkbox-checked" oninput="onColorPickerChange('s-checkbox-checked')">
          <input type="range" class="alpha-slider" id="s-checkbox-checked-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-checkbox-checked')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-checkbox-checked-hex" maxlength="9" oninput="onHexInput('s-checkbox-checked')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-checkbox-checked',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-checkbox-row="mark">
        <label>Checkmark color</label>
        <div class="color-picker-row">
          <input type="color" id="s-checkbox-mark" oninput="onColorPickerChange('s-checkbox-mark')">
          <input type="range" class="alpha-slider" id="s-checkbox-mark-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-checkbox-mark')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-checkbox-mark-hex" maxlength="9" oninput="onHexInput('s-checkbox-mark')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-checkbox-mark',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-checkbox-row="border">
        <label>Border color</label>
        <div class="color-picker-row">
          <input type="color" id="s-checkbox-border" oninput="onColorPickerChange('s-checkbox-border')">
          <input type="range" class="alpha-slider" id="s-checkbox-border-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-checkbox-border')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-checkbox-border-hex" maxlength="9" oninput="onHexInput('s-checkbox-border')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-checkbox-border',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-checkbox-row="bg">
        <label>Box background</label>
        <div class="color-picker-row">
          <input type="color" id="s-checkbox-bg" oninput="onColorPickerChange('s-checkbox-bg')">
          <input type="range" class="alpha-slider" id="s-checkbox-bg-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-checkbox-bg')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-checkbox-bg-hex" maxlength="9" oninput="onHexInput('s-checkbox-bg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-checkbox-bg',this)">Copy</button>
        </div>
      </div>
      <div data-checkbox-row="demo" style="margin-top:12px;padding-top:12px;border-top:1px solid #444">
        <label style="font-size:13px;color:#bbb">Demo:</label>
        <div style="display:flex;gap:12px;align-items:center;margin-top:8px">
          <input type="checkbox" id="settings-checkbox" checked style="width:20px;height:20px;cursor:pointer">
          <span style="font-size:13px;color:#888">Checked</span>
        </div>
      </div>
    </div>
    <div class="settings-group-content" id="sg-app">
      <!-- Background type selector -->
      <div class="settings-row">
        <label>Background type</label>
        <select id="s-app-bg-type" onchange="appBgTypeChange()">
          <option value="solid">Solid color</option>
          <option value="gradient2">2-stop gradient</option>
          <option value="gradient3">3-stop gradient</option>
          <option value="gradient4">4-stop gradient</option>
          <option value="pattern-dots">Pattern: Dots</option>
          <option value="pattern-grid">Pattern: Grid</option>
          <option value="pattern-stripes">Pattern: Stripes</option>
          <option value="pattern-diagonal">Pattern: Diagonal</option>
          <option value="pattern-crosshatch">Pattern: Crosshatch</option>
          <option value="image">Image</option>
        </select>
      </div>
      <!-- Gradient direction (hidden for solid/pattern/image) -->
      <div class="settings-row" id="s-app-grad-dir-row">
        <label>Direction</label>
        <select id="s-app-grad-dir" onchange="settingsAppChange()">
          <option value="to bottom">Top → Bottom</option>
          <option value="to right">Left → Right</option>
          <option value="to bottom right">Diagonal ↘</option>
          <option value="to bottom left">Diagonal ↙</option>
          <option value="135deg">135°</option>
          <option value="45deg">45°</option>
        </select>
      </div>
      <!-- Solid / gradient color stops -->
      <div id="s-app-stops-wrap"></div>
      <!-- Pattern color -->
      <div id="s-app-pattern-wrap" style="display:none">
        <div class="color-settings-row">
          <label>Pattern color</label>
          <div class="color-picker-row">
            <input type="color" id="s-app-pat-color" oninput="onColorPickerChange('s-app-pat-color')">
            <input type="range" class="alpha-slider" id="s-app-pat-color-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-pat-color')">
          </div>
          <div class="hex-copy-row">
            <input type="text" class="hex-input" id="s-app-pat-color-hex" maxlength="9" oninput="onHexInput('s-app-pat-color')" spellcheck="false" autocomplete="off">
            <button class="copy-btn" onclick="copyHex('s-app-pat-color',this)">Copy</button>
          </div>
        </div>
        <div class="color-settings-row">
          <label>Pattern background</label>
          <div class="color-picker-row">
            <input type="color" id="s-app-pat-bg" oninput="onColorPickerChange('s-app-pat-bg')">
            <input type="range" class="alpha-slider" id="s-app-pat-bg-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-pat-bg')">
          </div>
          <div class="hex-copy-row">
            <input type="text" class="hex-input" id="s-app-pat-bg-hex" maxlength="9" oninput="onHexInput('s-app-pat-bg')" spellcheck="false" autocomplete="off">
            <button class="copy-btn" onclick="copyHex('s-app-pat-bg',this)">Copy</button>
          </div>
        </div>
        <div class="settings-row">
          <label>Pattern size</label>
          <select id="s-app-pat-size" onchange="settingsAppChange()">
            <option value="4">Tiny (4px)</option>
            <option value="8">Small (8px)</option>
            <option value="16" selected>Medium (16px)</option>
            <option value="32">Large (32px)</option>
            <option value="64">X-Large (64px)</option>
          </select>
        </div>
      </div>
      <!-- Image upload -->
      <div id="s-app-image-wrap" style="display:none;flex-direction:column;gap:8px;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button class="copy-btn" style="padding:6px 14px;font-size:13px;" onclick="document.getElementById('s-app-img-file').click()">Choose image…</button>
          <button class="copy-btn" style="padding:6px 14px;font-size:13px;" onclick="appClearImage()">Clear image</button>
          <input type="file" id="s-app-img-file" accept="image/*" style="display:none" onchange="appLoadImage(this)">
        </div>
        <div id="s-app-img-preview" style="width:100%;max-height:120px;overflow:hidden;border-radius:6px;border:1px solid #444;display:none;">
          <img id="s-app-img-thumb" style="width:100%;object-fit:cover;display:block;" src="">
        </div>
        <div class="settings-row">
          <label>Size</label>
          <select id="s-app-img-size" onchange="settingsAppChange()">
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Actual size</option>
            <option value="50%">50%</option>
            <option value="200%">200%</option>
          </select>
        </div>
        <div class="settings-row">
          <label>Position</label>
          <select id="s-app-img-pos" onchange="settingsAppChange()">
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div class="settings-row">
          <label>Repeat</label>
          <select id="s-app-img-repeat" onchange="settingsAppChange()">
            <option value="no-repeat">No repeat</option>
            <option value="repeat">Tile</option>
            <option value="repeat-x">Tile horizontal</option>
            <option value="repeat-y">Tile vertical</option>
          </select>
        </div>
        <div class="settings-row">
          <label>Attachment</label>
          <select id="s-app-img-attach" onchange="settingsAppChange()">
            <option value="scroll">Scroll with page</option>
            <option value="fixed">Fixed (parallax)</option>
          </select>
        </div>
        <!-- overlay tint over image -->
        <div class="color-settings-row">
          <label>Overlay tint</label>
          <div class="color-picker-row">
            <input type="color" id="s-app-img-tint" oninput="onColorPickerChange('s-app-img-tint')">
            <input type="range" class="alpha-slider" id="s-app-img-tint-alpha" min="0" max="255" value="0" oninput="onAlphaChange('s-app-img-tint')">
          </div>
          <div class="hex-copy-row">
            <input type="text" class="hex-input" id="s-app-img-tint-hex" maxlength="9" oninput="onHexInput('s-app-img-tint')" spellcheck="false" autocomplete="off">
            <button class="copy-btn" onclick="copyHex('s-app-img-tint',this)">Copy</button>
          </div>
        </div>
        <div class="settings-row">
          <label>Status bar color</label>
          <select id="s-app-statusbar-mode" onchange="statusBarModeChange()">
            <option value="auto">Auto (sample image)</option>
            <option value="solid">Solid</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>
        <div class="color-settings-row" id="s-app-statusbar-color-row" style="display:none">
          <label>Status bar</label>
          <div class="color-picker-row">
            <input type="color" id="s-app-statusbar-color" oninput="onColorPickerChange('s-app-statusbar-color')">
            <input type="range" class="alpha-slider" id="s-app-statusbar-color-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-statusbar-color')">
          </div>
          <div class="hex-copy-row">
            <input type="text" class="hex-input" id="s-app-statusbar-color-hex" maxlength="9" oninput="onHexInput('s-app-statusbar-color')" spellcheck="false" autocomplete="off">
            <button class="copy-btn" onclick="copyHex('s-app-statusbar-color',this)">Copy</button>
          </div>
        </div>
      </div>
      <div class="settings-row" data-app-row="statusbar-icons">
        <label>Status bar icons</label>
        <select id="s-app-statusbar-icons" onchange="settingsAppChange()">
          <option value="auto">Auto (from color)</option>
          <option value="light">Light (white icons)</option>
          <option value="dark">Dark (black icons)</option>
        </select>
      </div>
      <!-- Text / UI colors -->
      <div class="color-settings-row" data-app-row="text" style="margin-top:8px">
        <label>Page text color</label>
        <div class="color-picker-row">
          <input type="color" id="s-app-text" oninput="onColorPickerChange('s-app-text')">
          <input type="range" class="alpha-slider" id="s-app-text-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-text')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-app-text-hex" maxlength="9" oninput="onHexInput('s-app-text')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-app-text',this)">Copy</button>
        </div>
      </div>
      </div>
    <div class="settings-group-content" id="sg-tables">
      <div class="color-settings-row" data-app-row="border">
        <label>Table border color</label>
        <div class="color-picker-row">
          <input type="color" id="s-app-border" oninput="onColorPickerChange('s-app-border')">
          <input type="range" class="alpha-slider" id="s-app-border-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-border')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-app-border-hex" maxlength="9" oninput="onHexInput('s-app-border')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-app-border',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-app-row="thead">
        <label>Table header background</label>
        <div class="color-picker-row">
          <input type="color" id="s-app-thead" oninput="onColorPickerChange('s-app-thead')">
          <input type="range" class="alpha-slider" id="s-app-thead-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-thead')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-app-thead-hex" maxlength="9" oninput="onHexInput('s-app-thead')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-app-thead',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-app-row="cellbg">
        <label>Table cell background</label>
        <div class="color-picker-row">
          <input type="color" id="s-app-cell-bg" oninput="onColorPickerChange('s-app-cell-bg')">
          <input type="range" class="alpha-slider" id="s-app-cell-bg-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-cell-bg')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-app-cell-bg-hex" maxlength="9" oninput="onHexInput('s-app-cell-bg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-app-cell-bg',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-app-row="barset">
        <label>Set bar color</label>
        <div class="color-picker-row">
          <input type="color" id="s-app-bar-set" oninput="onColorPickerChange('s-app-bar-set')">
          <input type="range" class="alpha-slider" id="s-app-bar-set-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-bar-set')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-app-bar-set-hex" maxlength="9" oninput="onHexInput('s-app-bar-set')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-app-bar-set',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-app-row="bartotal">
        <label>Total bar color</label>
        <div class="color-picker-row">
          <input type="color" id="s-app-bar-total" oninput="onColorPickerChange('s-app-bar-total')">
          <input type="range" class="alpha-slider" id="s-app-bar-total-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-bar-total')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-app-bar-total-hex" maxlength="9" oninput="onHexInput('s-app-bar-total')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-app-bar-total',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-app-row="barstreak">
        <label>Streak bar color</label>
        <div class="color-picker-row">
          <input type="color" id="s-app-bar-streak" oninput="onColorPickerChange('s-app-bar-streak')">
          <input type="range" class="alpha-slider" id="s-app-bar-streak-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-bar-streak')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-app-bar-streak-hex" maxlength="9" oninput="onHexInput('s-app-bar-streak')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-app-bar-streak',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-app-row="baranti">
        <label>Anti-streak bar color</label>
        <div class="color-picker-row">
          <input type="color" id="s-app-bar-anti-streak" oninput="onColorPickerChange('s-app-bar-anti-streak')">
          <input type="range" class="alpha-slider" id="s-app-bar-anti-streak-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-bar-anti-streak')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-app-bar-anti-streak-hex" maxlength="9" oninput="onHexInput('s-app-bar-anti-streak')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-app-bar-anti-streak',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-app-row="streaktext">
        <label>Streak text color</label>
        <div class="color-picker-row">
          <input type="color" id="s-app-streak-text" oninput="onColorPickerChange('s-app-streak-text')">
          <input type="range" class="alpha-slider" id="s-app-streak-text-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-streak-text')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-app-streak-text-hex" maxlength="9" oninput="onHexInput('s-app-streak-text')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-app-streak-text',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-app-row="antistreaktext">
        <label>Anti-streak text color</label>
        <div class="color-picker-row">
          <input type="color" id="s-app-anti-streak-text" oninput="onColorPickerChange('s-app-anti-streak-text')">
          <input type="range" class="alpha-slider" id="s-app-anti-streak-text-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-anti-streak-text')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-app-anti-streak-text-hex" maxlength="9" oninput="onHexInput('s-app-anti-streak-text')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-app-anti-streak-text',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-app-row="settext">
        <label>Set text color</label>
        <div class="color-picker-row">
          <input type="color" id="s-app-set-text" oninput="onColorPickerChange('s-app-set-text')">
          <input type="range" class="alpha-slider" id="s-app-set-text-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-app-set-text')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-app-set-text-hex" maxlength="9" oninput="onHexInput('s-app-set-text')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-app-set-text',this)">Copy</button>
        </div>
      </div>
      </div>
    <div class="settings-group-content" id="sg-notifications">
        <div class="settings-row" style="justify-content:space-between;gap:12px;">
        <label style="font-size:13px;color:#bbb;">Notifications enabled</label>
        <div id="notif-toggle-wrap" onclick="notifToggle()" style="width:48px;height:26px;border-radius:13px;background:#333;border:1px solid #555;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0;touch-action:manipulation;">
          <div id="notif-toggle-switch" style="position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#666;transition:left 0.2s,background 0.2s;pointer-events:none;"></div>
        </div>
      </div>
      <div id="notif-off-wrap" style="display:flex;flex-direction:column;gap:8px;padding:10px;background:#1a1a1a;border:1px solid #333;border-radius:6px;">
        <div style="font-size:12px;color:#888;">Auto-enable after (all zero = indefinite)</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
          <div style="display:flex;flex-direction:column;gap:3px;align-items:center;">
            <label style="font-size:10px;color:#666;">Years</label>
            <input id="notif-off-years" type="number" min="0" value="0" style="width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:4px;font-size:13px;text-align:center;box-sizing:border-box;">
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;align-items:center;">
            <label style="font-size:10px;color:#666;">Days</label>
            <input id="notif-off-days" type="number" min="0" value="0" style="width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:4px;font-size:13px;text-align:center;box-sizing:border-box;">
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;align-items:center;">
            <label style="font-size:10px;color:#666;">Hours</label>
            <input id="notif-off-hours" type="number" min="0" value="0" style="width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:4px;font-size:13px;text-align:center;box-sizing:border-box;">
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;align-items:center;">
            <label style="font-size:10px;color:#666;">Mins</label>
            <input id="notif-off-mins" type="number" min="0" value="0" style="width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:4px;font-size:13px;text-align:center;box-sizing:border-box;">
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;align-items:center;">
            <label style="font-size:10px;color:#666;">Secs</label>
            <input id="notif-off-secs" type="number" min="0" value="0" style="width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:4px;font-size:13px;text-align:center;box-sizing:border-box;">
          </div>
        </div>
        <div id="notif-countdown-display" style="font-size:12px;color:#aaa;min-height:16px;">Off indefinitely</div>
        <div style="display:flex;gap:8px;">
          <button onclick="notifSetOffTimer()" style="padding:6px 14px;background:#1a2a3a;color:#99ccff;border:none;border-radius:4px;cursor:pointer;font-size:13px;">Set timer</button>
          <button onclick="notifSetOffForever()" style="padding:6px 14px;background:#2a1a1a;color:#ff9999;border:none;border-radius:4px;cursor:pointer;font-size:13px;">Indefinite</button>
        </div>
      </div>
      <div class="settings-row" style="flex-wrap:wrap;gap:6px;">
        <label>Permissions</label>
        <span id="notif-permission-status" style="font-size:12px;color:#aaa;flex:1;min-width:0;">—</span>
      </div>
      <div style="margin-top:-8px;">
        <button onclick="notifRefreshPermission()" style="padding:5px 12px;background:#2a2a2a;color:#aaa;border:1px solid #444;border-radius:4px;cursor:pointer;font-size:12px;">Refresh</button>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
        <button onclick="notifOpenSettings()" style="padding:7px 16px;background:#1a2a3a;color:#99ccff;border:none;border-radius:4px;cursor:pointer;font-size:13px;">Open App Settings</button>
        <button onclick="notifOpenAlarmSettings()" style="padding:7px 16px;background:#1a2a3a;color:#99ccff;border:none;border-radius:4px;cursor:pointer;font-size:13px;">Alarm Permission</button>
        <button id="notif-send-test-btn" onclick="notifSendTest()" style="padding:7px 16px;background:#1a3a1a;color:#99ff99;border:none;border-radius:4px;cursor:pointer;font-size:13px;">Send Test</button>
      </div>
      <div id="notif-status-msg" style="font-size:12px;color:#888;min-height:16px;margin-top:6px;"></div>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid #333;display:flex;flex-direction:column;gap:8px;">
        <div style="font-size:13px;color:#bbb;">Resend interval</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
          <div style="display:flex;flex-direction:column;gap:3px;align-items:center;">
            <label style="font-size:10px;color:#666;">Years</label>
            <input id="notif-years" type="number" min="0" value="0" style="width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:4px;font-size:13px;text-align:center;box-sizing:border-box;">
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;align-items:center;">
            <label style="font-size:10px;color:#666;">Days</label>
            <input id="notif-days" type="number" min="0" value="0" style="width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:4px;font-size:13px;text-align:center;box-sizing:border-box;">
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;align-items:center;">
            <label style="font-size:10px;color:#666;">Hours</label>
            <input id="notif-hours" type="number" min="0" value="1" style="width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:4px;font-size:13px;text-align:center;box-sizing:border-box;">
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;align-items:center;">
            <label style="font-size:10px;color:#666;">Mins</label>
            <input id="notif-minutes" type="number" min="0" value="0" style="width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:4px;font-size:13px;text-align:center;box-sizing:border-box;">
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;align-items:center;">
            <label style="font-size:10px;color:#666;">Secs</label>
            <input id="notif-seconds" type="number" min="0" value="0" style="width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:4px;font-size:13px;text-align:center;box-sizing:border-box;">
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px;">
          <label style="font-size:13px;color:#bbb;">Target reps to stop notifying (0 = ignore)</label>
          <input id="notif-target-reps" type="number" min="0" value="0" style="width:80px;background:#111;color:#fff;border:1px solid #444;border-radius:4px;padding:4px 8px;font-size:13px;text-align:center;">
        </div>
        <button id="notif-save-schedule-btn" onclick="notifSaveSchedule()" style="padding:7px 16px;background:#1a3a1a;color:#99ff99;border:none;border-radius:4px;cursor:pointer;font-size:13px;align-self:flex-start;">Save Schedule</button>
      </div>
    </div>
    <div class="settings-group-content" id="sg-coverflow" style="display:none">
      <div class="settings-row">
        <label>Step spread <span id="cf-step-tx-val"></span></label>
        <input type="range" class="alpha-slider" id="cf-step-tx" min="10" max="100" oninput="cfApplyTuning()">
      </div>
      <div class="settings-row">
        <label>Max angle <span id="cf-max-angle-val"></span></label>
        <input type="range" class="alpha-slider" id="cf-max-angle" min="0" max="89" oninput="cfApplyTuning()">
      </div>
      <div class="settings-row">
        <label>Scale falloff <span id="cf-scale-val"></span></label>
        <input type="range" class="alpha-slider" id="cf-scale" min="0" max="100" oninput="cfApplyTuning()">
      </div>
      <div class="settings-row">
        <label>Opacity falloff <span id="cf-opacity-val"></span></label>
        <input type="range" class="alpha-slider" id="cf-opacity" min="0" max="100" oninput="cfApplyTuning()">
      </div>
      <div class="settings-row">
        <label>Animation speed <span id="cf-duration-val"></span></label>
        <input type="range" class="alpha-slider" id="cf-duration" min="50" max="800" oninput="cfApplyTuning()">
      </div>
      <div class="settings-row">
        <label>Card width <span id="cf-card-w-val"></span></label>
        <input type="range" class="alpha-slider" id="cf-card-w" min="10" max="80" oninput="cfApplyTuning()">
      </div>
      <div class="settings-row">
        <label>Corner radius <span id="cf-shape-val">6px</span></label>
        <input type="range" class="alpha-slider" id="cf-shape" min="0" max="50" value="6" oninput="document.getElementById('cf-shape-val').textContent=this.value+'px';cfApplyTuning()">
      </div>
    </div>
    <div class="settings-group-content" id="sg-swatches">
      <div class="color-settings-row" data-swatch-row="cp-bg">
        <label>Popup background</label>
        <div class="color-picker-row">
          <input type="color" id="s-cp-bg" oninput="onColorPickerChange('s-cp-bg')">
          <input type="range" class="alpha-slider" id="s-cp-bg-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-cp-bg')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-cp-bg-hex" maxlength="9" oninput="onHexInput('s-cp-bg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-cp-bg',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-swatch-row="cp-border">
        <label>Popup border</label>
        <div class="color-picker-row">
          <input type="color" id="s-cp-border" oninput="onColorPickerChange('s-cp-border')">
          <input type="range" class="alpha-slider" id="s-cp-border-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-cp-border')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-cp-border-hex" maxlength="9" oninput="onHexInput('s-cp-border')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-cp-border',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-swatch-row="cp-text">
        <label>Popup text</label>
        <div class="color-picker-row">
          <input type="color" id="s-cp-text" oninput="onColorPickerChange('s-cp-text')">
          <input type="range" class="alpha-slider" id="s-cp-text-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-cp-text')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-cp-text-hex" maxlength="9" oninput="onHexInput('s-cp-text')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-cp-text',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-swatch-row="cp-label-outline">
        <label>Label outline</label>
        <div class="color-picker-row">
          <input type="color" id="s-cp-label-outline" oninput="onColorPickerChange('s-cp-label-outline')">
          <input type="range" class="alpha-slider" id="s-cp-label-outline-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-cp-label-outline')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-cp-label-outline-hex" maxlength="9" oninput="onHexInput('s-cp-label-outline')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-cp-label-outline',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-swatch-row="cp-label">
        <label>Label</label>
        <div class="color-picker-row">
          <input type="color" id="s-cp-label" oninput="onColorPickerChange('s-cp-label')">
          <input type="range" class="alpha-slider" id="s-cp-label-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-cp-label')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-cp-label-hex" maxlength="9" oninput="onHexInput('s-cp-label')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-cp-label',this)">Copy</button>
        </div>
      </div>
      <div class="settings-row" data-swatch-row="label-size">
        <label>Label size <span id="s-cp-label-size-val">8px</span></label>
        <input type="range" class="alpha-slider" id="s-cp-label-size" min="4" max="20" value="8" oninput="document.getElementById('s-cp-label-size-val').textContent=this.value+'px';if(window._cpSaveFromUI)window._cpSaveFromUI();if(window._applyLabelToSwatches)window._applyLabelToSwatches();">
      </div>
      <div class="settings-row" data-swatch-row="label-stroke">
        <label>Label stroke <span id="s-cp-label-stroke-val">0.5px</span></label>
        <input type="range" class="alpha-slider" id="s-cp-label-stroke" min="0" max="50" value="5" oninput="document.getElementById('s-cp-label-stroke-val').textContent=(this.value/10).toFixed(1)+'px';if(window._cpSaveFromUI)window._cpSaveFromUI();if(window._applyLabelToSwatches)window._applyLabelToSwatches();">
      </div>
      <div class="settings-row" data-swatch-row="label-font">
        <label>Label font</label>
        <select id="s-cp-label-font" onchange="if(window._cpSaveFromUI)window._cpSaveFromUI();if(window._applyLabelToSwatches)window._applyLabelToSwatches();" style="display:none">
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
        <div id="font-tumbler-wrap-swatch" style="flex:1;max-width:180px;background:#1c1c1c;border:1px solid #444;border-radius:6px;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;min-height:52px;"></div>
      </div>
    </div>
    <div class="settings-group-content" id="sg-toggles">
      <div class="color-settings-row" data-toggle-row="off-bg">
        <label>Track off background</label>
        <div class="color-picker-row">
          <input type="color" id="s-toggle-off-bg" oninput="onColorPickerChange('s-toggle-off-bg')">
          <input type="range" class="alpha-slider" id="s-toggle-off-bg-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-toggle-off-bg')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-toggle-off-bg-hex" maxlength="9" oninput="onHexInput('s-toggle-off-bg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-toggle-off-bg',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-toggle-row="on-bg">
        <label>Track on background</label>
        <div class="color-picker-row">
          <input type="color" id="s-toggle-on-bg" oninput="onColorPickerChange('s-toggle-on-bg')">
          <input type="range" class="alpha-slider" id="s-toggle-on-bg-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-toggle-on-bg')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-toggle-on-bg-hex" maxlength="9" oninput="onHexInput('s-toggle-on-bg')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-toggle-on-bg',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-toggle-row="switch-off">
        <label>Switch off color</label>
        <div class="color-picker-row">
          <input type="color" id="s-toggle-switch-off" oninput="onColorPickerChange('s-toggle-switch-off')">
          <input type="range" class="alpha-slider" id="s-toggle-switch-off-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-toggle-switch-off')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-toggle-switch-off-hex" maxlength="9" oninput="onHexInput('s-toggle-switch-off')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-toggle-switch-off',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-toggle-row="switch-on">
        <label>Switch on color</label>
        <div class="color-picker-row">
          <input type="color" id="s-toggle-switch-on" oninput="onColorPickerChange('s-toggle-switch-on')">
          <input type="range" class="alpha-slider" id="s-toggle-switch-on-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-toggle-switch-on')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-toggle-switch-on-hex" maxlength="9" oninput="onHexInput('s-toggle-switch-on')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-toggle-switch-on',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-toggle-row="border-off">
        <label>Border off color</label>
        <div class="color-picker-row">
          <input type="color" id="s-toggle-border-off" oninput="onColorPickerChange('s-toggle-border-off')">
          <input type="range" class="alpha-slider" id="s-toggle-border-off-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-toggle-border-off')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-toggle-border-off-hex" maxlength="9" oninput="onHexInput('s-toggle-border-off')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-toggle-border-off',this)">Copy</button>
        </div>
      </div>
      <div class="color-settings-row" data-toggle-row="border-on">
        <label>Border on color</label>
        <div class="color-picker-row">
          <input type="color" id="s-toggle-border-on" oninput="onColorPickerChange('s-toggle-border-on')">
          <input type="range" class="alpha-slider" id="s-toggle-border-on-alpha" min="0" max="255" value="255" oninput="onAlphaChange('s-toggle-border-on')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="s-toggle-border-on-hex" maxlength="9" oninput="onHexInput('s-toggle-border-on')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('s-toggle-border-on',this)">Copy</button>
        </div>
      </div>
      <div class="settings-row" data-toggle-row="w">
        <label>Toggle width <span id="s-toggle-w-val">44px</span></label>
        <input type="range" class="alpha-slider" id="s-toggle-w" min="24" max="80" value="44" oninput="document.getElementById('s-toggle-w-val').textContent=this.value+'px';settingsChange()">
      </div>
      <div class="settings-row" data-toggle-row="h">
        <label>Toggle height <span id="s-toggle-h-val">24px</span></label>
        <input type="range" class="alpha-slider" id="s-toggle-h" min="14" max="48" value="24" oninput="document.getElementById('s-toggle-h-val').textContent=this.value+'px';settingsChange()">
      </div>
      <div class="settings-row" data-toggle-row="switch-size">
        <label>Switch size <span id="s-toggle-switch-size-val">16px</span></label>
        <input type="range" class="alpha-slider" id="s-toggle-switch-size" min="8" max="40" value="16" oninput="document.getElementById('s-toggle-switch-size-val').textContent=this.value+'px';settingsChange()">
      </div>
      <div data-toggle-row="demo" style="margin-top:12px;padding-top:12px;border-top:1px solid #444;width:100%;display:flex;align-items:center;gap:12px;">
        <label style="font-size:13px;color:#bbb">Demo:</label>
        <div class="ctrl-toggle" onclick="this.classList.toggle('on')"><div class="ctrl-switch"></div></div>
      </div>
    </div>
    <div id="settings-footer">
      <button id="settings-save" onclick="settingsSave()">Save</button>
      <button id="settings-undo" onclick="settingsUndo()" disabled>Undo</button>
      <button id="settings-redo" onclick="settingsRedo()" disabled>Redo</button>
      <button id="settings-cancel" onclick="settingsCancel()">Close</button>
      <button id="settings-reset" onclick="settingsReset()">Default</button>
    </div>
    <div id="settings-footer">
      <button id="settings-export" onclick="settingsExport()">Export</button>
      <button id="settings-import-btn" onclick="document.getElementById('settings-import-file').click()">Import</button>
      <input type="file" id="settings-import-file" accept=".json" style="display:none" onchange="settingsImport(this)">
    </div>
`);




























































































