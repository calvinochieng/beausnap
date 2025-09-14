
// Comprehensive Effects UI Management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all effect controls
    initializeEffectControls();
  
    // Sync sliders with counters
    setupSliderCounterSync();
  
    // Setup Glow presets
    setupGlowPresets();
  
    // Setup Skew presets
    setupSkewPresets();
  
    // Setup Float presets
    setupFloatPresets();
  
    // Dynamically reflect color picker into Outer Halo preset preview
    const colorInput = document.getElementById('glow-color-ui');
    const outerHaloBtn = document.querySelector('.glow-preset[data-key="outer-halo"]');
    function updateOuterHaloPreviewColor() {
      if (!outerHaloBtn || !colorInput) return;
      const hex = colorInput.value || '#9aa0a6';
      outerHaloBtn.style.setProperty('--preset-color', hex);
    }
  
  // Float presets catalog
  const floatPresets = {
    'subtle': { shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 14, shadowOffsetX: 0, shadowOffsetY: 8, elevation: 8 },
    'medium': { shadowColor: 'rgba(0,0,0,0.35)', shadowBlur: 22, shadowOffsetX: 0, shadowOffsetY: 12, elevation: 12 },
    'high': { shadowColor: 'rgba(0,0,0,0.45)', shadowBlur: 28, shadowOffsetX: 0, shadowOffsetY: 18, elevation: 18 },
    'long-soft': { shadowColor: 'rgba(0,0,0,0.3)', shadowBlur: 32, shadowOffsetX: 10, shadowOffsetY: 22, elevation: 20 },
  };
  
  function applyFloatPreset(key) {
    const presetsContainer = document.getElementById('float-presets');
    const floatCustom = document.getElementById('float-custom-controls');
    const toggle = document.getElementById('float-enable-ui');
  
    appState.ui.floatSelectedPreset = key;
  
    if (key === 'none') {
      appState.effects.float.active = false;
      appState.ui.floatShowControls = false;
      if (floatCustom) floatCustom.style.display = 'none';
      if (toggle) toggle.checked = false;
      updateFloatPresetSelectionUI(presetsContainer);
      renderScene();
      return;
    }
  
    if (key === 'custom') {
      // Ensure effect is on and keep current values
      appState.effects.float.active = true;
      appState.ui.floatShowControls = true;
      if (floatCustom) floatCustom.style.display = 'block';
      if (toggle) toggle.checked = true;
      initializeEffectControls();
      updateFloatPresetSelectionUI(presetsContainer);
      renderScene();
      return;
    }
  
    const preset = floatPresets[key];
    if (preset) {
      Object.assign(appState.effects.float, preset);
    }
    appState.effects.float.active = true;
    appState.ui.floatShowControls = false; // hide unless Custom
    if (floatCustom) floatCustom.style.display = 'none';
    if (toggle) toggle.checked = true;
  
    // Sync UI inputs to reflect preset values
    initializeEffectControls();
    updateFloatPresetSelectionUI(presetsContainer);
    renderScene();
  }
  
  function updateFloatPresetSelectionUI(container) {
    if (!container) return;
    const tiles = container.querySelectorAll('.float-preset');
    tiles.forEach(t => {
      if (t.dataset.key === appState.ui.floatSelectedPreset) t.classList.add('selected');
      else t.classList.remove('selected');
    });
  }
  
  function setupFloatPresets() {
    const container = document.getElementById('float-presets');
    if (!container) return;
  
    container.querySelectorAll('.float-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        applyFloatPreset(key);
      });
    });
  
    // Initialize default selection if none
    if (!appState.ui.floatSelectedPreset) {
      appState.ui.floatSelectedPreset = 'none';
    }
    // default auto-elevation on first load
    if (appState.ui.floatAutoElevation === undefined) {
      appState.ui.floatAutoElevation = true;
    }
    updateFloatPresetSelectionUI(container);
  }
    if (colorInput) {
      updateOuterHaloPreviewColor();
      colorInput.addEventListener('input', updateOuterHaloPreviewColor);
      colorInput.addEventListener('change', updateOuterHaloPreviewColor);
    }
  });
  
  // Touch move mirrors mousemove for mobile interactions
  document.addEventListener('touchmove', (e) => {
    if (!isDragging && !isResizing) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
  
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
  
    if (isDragging) {
      appState.image.x = startLeft + dx;
      appState.image.y = startTop + dy;
  
      if (ALIGN_CONFIG.showGuides) {
        const cx = appState.scene.width / 2;
        const cy = appState.scene.height / 2;
        const imgCenterX = appState.image.x + appState.image.width / 2;
        const imgCenterY = appState.image.y + appState.image.height / 2;
        let snappedX = false;
        let snappedY = false;
        if (Math.abs(imgCenterX - cx) <= ALIGN_CONFIG.threshold) {
          centerGuideX.style.opacity = '1';
          if (ALIGN_CONFIG.snap) {
            appState.image.x = cx - appState.image.width / 2;
            snappedX = true;
          }
        } else {
          centerGuideX.style.opacity = '0';
        }
        if (Math.abs(imgCenterY - cy) <= ALIGN_CONFIG.threshold) {
          centerGuideY.style.opacity = '1';
          if (ALIGN_CONFIG.snap) {
            appState.image.y = cy - appState.image.height / 2;
            snappedY = true;
          }
        } else {
          centerGuideY.style.opacity = '0';
        }
        if (snappedX || snappedY) {
          imageContainerUI.style.left = `${appState.image.x}px`;
          imageContainerUI.style.top = `${appState.image.y}px`;
        }
      }
  
      imageContainerUI.style.left = `${appState.image.x}px`;
      imageContainerUI.style.top = `${appState.image.y}px`;
      renderScene();
    } else if (isResizing && currentHandle) {
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;
  
      const dx2 = dx; // reuse
      const dy2 = dy;
      switch (currentHandle) {
        case 'bottom-right':
          if (Math.abs(dx2) > Math.abs(dy2)) {
            newWidth = startWidth + dx2;
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = startHeight + dy2;
            newWidth = newHeight * aspectRatio;
          }
          break;
        case 'top-left':
          if (Math.abs(dx2) > Math.abs(dy2)) {
            newWidth = startWidth - dx2;
            newHeight = newWidth / aspectRatio;
            newLeft = startLeft + dx2;
            newTop = startTop + (startHeight - newHeight);
          } else {
            newHeight = startHeight - dy2;
            newWidth = newHeight * aspectRatio;
            newLeft = startLeft + (startWidth - newWidth);
            newTop = startTop + dy2;
          }
          break;
        case 'top-right':
          if (Math.abs(dx2) > Math.abs(dy2)) {
            newWidth = startWidth + dx2;
            newHeight = newWidth / aspectRatio;
            newTop = startTop + (startHeight - newHeight);
          } else {
            newHeight = startHeight - dy2;
            newWidth = newHeight * aspectRatio;
            newTop = startTop + dy2;
          }
          break;
        case 'bottom-left':
          if (Math.abs(dx2) > Math.abs(dy2)) {
            newWidth = startWidth - dx2;
            newHeight = newWidth / aspectRatio;
            newLeft = startLeft + dx2;
          } else {
            newHeight = startHeight + dy2;
            newWidth = newHeight * aspectRatio;
            newLeft = startLeft + (startWidth - newWidth);
          }
          break;
        case 'top':
          newHeight = startHeight - dy2;
          newWidth = newHeight * aspectRatio;
          newTop = startTop + dy2;
          break;
        case 'bottom':
          newHeight = startHeight + dy2;
          newWidth = newHeight * aspectRatio;
          break;
        case 'left':
          newWidth = startWidth - dx2;
          newHeight = newWidth / aspectRatio;
          newLeft = startLeft + dx2;
          break;
        case 'right':
          newWidth = startWidth + dx2;
          newHeight = newWidth / aspectRatio;
          break;
      }
  
      const minSize = 50;
      if (newWidth < minSize) {
        newWidth = minSize;
        newHeight = newWidth / aspectRatio;
      }
      if (newHeight < minSize) {
        newHeight = minSize;
        newWidth = newHeight * aspectRatio;
      }
  
      appState.image.width = newWidth;
      appState.image.height = newHeight;
      appState.image.x = newLeft;
      appState.image.y = newTop;
  
      imageContainerUI.style.left = `${newLeft}px`;
      imageContainerUI.style.top = `${newTop}px`;
      imageContainerUI.style.width = `${newWidth}px`;
      imageContainerUI.style.height = `${newHeight}px`;
      renderScene();
    }
    e.preventDefault();
  }, { passive: false });
  
  // Initialize all effect controls from appState
  function initializeEffectControls() {
    // Glow Effect
    const glowEnable = document.getElementById('glow-enable-ui');
    const glowColor = document.getElementById('glow-color-ui');
    const glowBlur = document.getElementById('glow-blur-ui');
    const glowBlurCounter = document.getElementById('glow-blur-counter');
    const glowOffsetX = document.getElementById('glow-offset-x-ui');
    const glowOffsetXCounter = document.getElementById('glow-offset-x-counter');
    const glowOffsetY = document.getElementById('glow-offset-y-ui');
    const glowOffsetYCounter = document.getElementById('glow-offset-y-counter');
  
    if (glowEnable) glowEnable.checked = appState.effects.glow.active;
    if (glowColor) glowColor.value = appState.effects.glow.color;
    if (glowBlur) glowBlur.value = appState.effects.glow.blur;
    if (glowBlurCounter) glowBlurCounter.value = appState.effects.glow.blur;
    if (glowOffsetX) glowOffsetX.value = appState.effects.glow.offsetX;
    if (glowOffsetXCounter) glowOffsetXCounter.value = appState.effects.glow.offsetX;
    if (glowOffsetY) glowOffsetY.value = appState.effects.glow.offsetY;
    if (glowOffsetYCounter) glowOffsetYCounter.value = appState.effects.glow.offsetY;
  
    // Show/hide custom controls based on UI state
    const glowCustom = document.getElementById('glow-custom-controls');
    if (glowCustom) {
      glowCustom.style.display = appState.ui.glowShowControls ? 'block' : 'none';
    }
  
    // Skew controls visibility
    const skewCustom = document.getElementById('skew-custom-controls');
    if (skewCustom) {
      skewCustom.style.display = appState.ui.skewShowControls ? 'block' : 'none';
    }
  
    // Skew Effect
    const skewEnable = document.getElementById('skew-enable-ui');
    const skewX = document.getElementById('skew-x-ui');
    const skewXCounter = document.getElementById('skew-x-counter');
    const skewY = document.getElementById('skew-y-ui');
    const skewYCounter = document.getElementById('skew-y-counter');
  
    if (skewEnable) skewEnable.checked = appState.effects.skew.active;
    if (skewX) skewX.value = appState.effects.skew.xAngle;
    if (skewXCounter) skewXCounter.value = appState.effects.skew.xAngle;
    if (skewY) skewY.value = appState.effects.skew.yAngle;
    if (skewYCounter) skewYCounter.value = appState.effects.skew.yAngle;
  
  
    // Float Effect
    const floatEnable = document.getElementById('float-enable-ui');
    const floatShadowColor = document.getElementById('float-shadow-color-ui');
    const floatBlur = document.getElementById('float-blur-ui');
    const floatBlurCounter = document.getElementById('float-blur-counter');
    const floatOffsetX = document.getElementById('float-offset-x-ui');
    const floatOffsetXCounter = document.getElementById('float-offset-x-counter');
    const floatOffsetY = document.getElementById('float-offset-y-ui');
    const floatOffsetYCounter = document.getElementById('float-offset-y-counter');
    const floatOpacity = document.getElementById('float-opacity-ui');
    const floatOpacityCounter = document.getElementById('float-opacity-counter');
    const floatAutoElevation = document.getElementById('float-auto-elevation');
    const floatCustom = document.getElementById('float-custom-controls');
  
    if (floatEnable) floatEnable.checked = appState.effects.float.active;
    if (floatShadowColor) {
      const { hex, alpha } = rgbaToHexAlpha(appState.effects.float.shadowColor);
      floatShadowColor.value = hex;
      if (floatOpacity) floatOpacity.value = alpha;
      if (floatOpacityCounter) floatOpacityCounter.value = alpha;
    }
    if (floatBlur) floatBlur.value = appState.effects.float.shadowBlur;
    if (floatBlurCounter) floatBlurCounter.value = appState.effects.float.shadowBlur;
    if (floatOffsetX) floatOffsetX.value = appState.effects.float.shadowOffsetX;
    if (floatOffsetXCounter) floatOffsetXCounter.value = appState.effects.float.shadowOffsetX;
    if (floatOffsetY) floatOffsetY.value = appState.effects.float.shadowOffsetY;
    if (floatOffsetYCounter) floatOffsetYCounter.value = appState.effects.float.shadowOffsetY;
    // opacity already set from rgba above
    if (floatAutoElevation) floatAutoElevation.checked = !!appState.ui.floatAutoElevation;
    if (floatCustom) {
      floatCustom.style.display = appState.ui.floatShowControls ? 'block' : 'none';
    }
  }
  
  // Setup bidirectional sync between sliders and counters
  function setupSliderCounterSync() {
    // Glow Effect
    syncSliderCounter('glow-blur-ui', 'glow-blur-counter', value => {
      appState.effects.glow.blur = parseInt(value);
      renderScene();
    });
  
    syncSliderCounter('glow-offset-x-ui', 'glow-offset-x-counter', value => {
      appState.effects.glow.offsetX = parseInt(value);
      renderScene();
    });
  
    syncSliderCounter('glow-offset-y-ui', 'glow-offset-y-counter', value => {
      appState.effects.glow.offsetY = parseInt(value);
      renderScene();
    });
  
    // Skew Effect
    syncSliderCounter('skew-x-ui', 'skew-x-counter', value => {
      appState.effects.skew.xAngle = parseFloat(value);
      renderScene();
    });
  
    syncSliderCounter('skew-y-ui', 'skew-y-counter', value => {
      appState.effects.skew.yAngle = parseFloat(value);
      renderScene();
    });
  
  
    // Float Effect
    syncSliderCounter('float-blur-ui', 'float-blur-counter', value => {
      appState.effects.float.shadowBlur = parseInt(value);
      renderScene();
    });
  
    syncSliderCounter('float-offset-x-ui', 'float-offset-x-counter', value => {
      appState.effects.float.shadowOffsetX = parseInt(value);
      renderScene();
    });
  
    syncSliderCounter('float-offset-y-ui', 'float-offset-y-counter', value => {
      const elev = parseInt(value);
      appState.effects.float.elevation = elev;
      appState.effects.float.shadowOffsetY = elev;
  
      // Auto-map other params from elevation if enabled
      if (appState.ui.floatAutoElevation) {
        const autoBlur = Math.round(10 + elev * 1.2); // 10..46
        const autoAlpha = Math.max(0.1, Math.min(0.6, 0.15 + elev * 0.015)); // ~0.15..0.6
  
        appState.effects.float.shadowBlur = autoBlur;
        // keep hex but update rgba with new alpha
        const currentHex = document.getElementById('float-shadow-color-ui')?.value || '#000000';
        appState.effects.float.shadowColor = hexToRgba(currentHex, autoAlpha);
  
        // Reflect into UI controls so users see the mapping
        const blurEl = document.getElementById('float-blur-ui');
        const blurCounter = document.getElementById('float-blur-counter');
        const opEl = document.getElementById('float-opacity-ui');
        const opCounter = document.getElementById('float-opacity-counter');
        if (blurEl) blurEl.value = String(autoBlur);
        if (blurCounter) blurCounter.value = String(autoBlur);
        if (opEl) opEl.value = String(Number(autoAlpha.toFixed(1)));
        if (opCounter) opCounter.value = String(Number(autoAlpha.toFixed(1)));
      }
  
      renderScene();
    });
  
    syncSliderCounter('float-opacity-ui', 'float-opacity-counter', value => {
      const color = document.getElementById('float-shadow-color-ui').value || '#000000';
      appState.effects.float.shadowColor = hexToRgba(color, parseFloat(value));
      renderScene();
    });
  
    // Color picker
    const glowColor = document.getElementById('glow-color-ui');
    const colorValue = document.querySelector('.color-value');
  
    if (glowColor) {
      glowColor.addEventListener('input', function() {
        appState.effects.glow.color = this.value;
        if (colorValue) colorValue.textContent = this.value;
        renderScene();
      });
    }
  
    // Float color picker
    const floatShadowColor = document.getElementById('float-shadow-color-ui');
    const floatColorValue = document.querySelector('#float-panel .color-value');
  
    if (floatShadowColor) {
      floatShadowColor.addEventListener('input', function() {
        const opacity = parseFloat(document.getElementById('float-opacity-ui').value || 0.3);
        appState.effects.float.shadowColor = hexToRgba(this.value, opacity);
        if (floatColorValue) floatColorValue.textContent = this.value;
        renderScene();
      });
    }
  
    // Auto-elevation toggle
    const floatAutoElevationToggle = document.getElementById('float-auto-elevation');
    if (floatAutoElevationToggle) {
      floatAutoElevationToggle.addEventListener('change', function() {
        appState.ui.floatAutoElevation = this.checked;
      });
    }
  
    // Effect toggles
    setupEffectToggle('glow-enable-ui', 'glow');
    setupEffectToggle('skew-enable-ui', 'skew');
    setupEffectToggle('float-enable-ui', 'float');
  
  }
  
  // Helper function to sync slider and counter
  function syncSliderCounter(sliderId, counterId, onChange) {
    const slider = document.getElementById(sliderId);
    const counter = document.getElementById(counterId);
  
    if (!slider || !counter) return;
  
    // Slider to counter
    slider.addEventListener('input', function() {
      counter.value = this.value;
      onChange(this.value);
    });
  
    // Counter to slider
    counter.addEventListener('input', function() {
      slider.value = this.value;
      onChange(this.value);
    });
  
    counter.addEventListener('change', function() {
      // Ensure value is within bounds
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      let value = parseFloat(this.value);
  
      if (value < min) value = min;
      if (value > max) value = max;
  
      this.value = value;
      slider.value = value;
      onChange(value);
    });
  }
  
  // Helper function to setup effect toggles
  function setupEffectToggle(toggleId, effectKey) {
    const toggle = document.getElementById(toggleId);
    if (!toggle) return;
  
    toggle.addEventListener('change', function() {
      const turningOn = this.checked;
      appState.effects[effectKey].active = turningOn;
  
      // Mirror glow preset selection when toggling the glow switch
      if (effectKey === 'glow') {
        if (turningOn && appState.ui.glowSelectedPreset === 'none') {
          applyGlowPreset('soft-blue');
          return; // applyGlowPreset will render
        }
        if (!turningOn) {
          applyGlowPreset('none');
          return;
        }
      } else if (effectKey === 'skew') {
        if (turningOn && appState.ui.skewSelectedPreset === 'none') {
          applySkewPreset('subtle-x');
          return;
        }
        if (!turningOn) {
          applySkewPreset('none');
          return;
        }
      } else if (turningOn && appState.effectsMeta[effectKey] && !appState.effectsMeta[effectKey].autoApplied) {
        // Apply best preset once for other effects
        const preset = getBestPreset(effectKey);
        if (preset) {
          Object.assign(appState.effects[effectKey], preset);
        }
        appState.effectsMeta[effectKey].autoApplied = true;
        initializeEffectControls();
      }
  
      renderScene();
    });
  }
  
  // Returns a good-looking starting preset per effect
  function getBestPreset(effectKey) {
    switch (effectKey) {
      case 'glow': {
        const colorInput = document.getElementById('glow-color-ui');
        const hex = colorInput && colorInput.value ? colorInput.value : '#2196F3';
        return { color: hex, blur: 24, offsetX: 0, offsetY: 0 };
      }
      case 'float': {
        return { shadowColor: 'rgba(0, 0, 0, 0.4)', shadowBlur: 25, shadowOffsetX: 0, shadowOffsetY: 15, elevation: 10 };
      }
      case 'skew': {
        return { xAngle: 8, yAngle: 0 };
      }
      default:
        return null;
    }
  }
  
  // Glow presets catalog
  const glowPresets = {
    'soft-blue': { color: '#2196F3', blur: 24, offsetX: 0, offsetY: 0 },
    'magenta-pop': { color: '#FF00FF', blur: 30, offsetX: 0, offsetY: 0 },
    'electric-cyan': { color: '#00E5FF', blur: 28, offsetX: 0, offsetY: 0 },
    'warm-amber': { color: '#FFC107', blur: 26, offsetX: 0, offsetY: 0 },
    'deep-purple': { color: '#7C4DFF', blur: 32, offsetX: 0, offsetY: 0 },
    'outer-halo': 'dynamic',
  };
  
  // Skew presets catalog
  const skewPresets = {
    'subtle-x': { xAngle: 8, yAngle: 0 },
    'subtle-y': { xAngle: 0, yAngle: 8 },
    'slant-right': { xAngle: 15, yAngle: 0 },
    'slant-left': { xAngle: -15, yAngle: 0 },
    'perspective-light': { xAngle: 10, yAngle: 6 },
    'perspective-heavy': { xAngle: 20, yAngle: 12 },
  };
  
  function applySkewPreset(key) {
    const presetsContainer = document.getElementById('skew-presets');
    const skewCustom = document.getElementById('skew-custom-controls');
    const toggle = document.getElementById('skew-enable-ui');
  
    appState.ui.skewSelectedPreset = key;
  
    if (key === 'none') {
      appState.effects.skew.active = false;
      appState.ui.skewShowControls = false;
      if (skewCustom) skewCustom.style.display = 'none';
      if (toggle) toggle.checked = false;
      updateSkewPresetSelectionUI(presetsContainer);
      renderScene();
      return;
    }
  
    if (key === 'custom') {
      // Keep controls visible; just ensure effect is on
      appState.effects.skew.active = true;
      appState.ui.skewShowControls = true;
      if (skewCustom) skewCustom.style.display = 'block';
      if (toggle) toggle.checked = true;
      initializeEffectControls();
      updateSkewPresetSelectionUI(presetsContainer);
      renderScene();
      return;
    }
  
    const preset = skewPresets[key];
    if (preset) {
      Object.assign(appState.effects.skew, preset);
    }
    appState.effects.skew.active = true;
    appState.ui.skewShowControls = false; // hide unless Custom
    if (skewCustom) skewCustom.style.display = 'none';
    if (toggle) toggle.checked = true;
  
    initializeEffectControls();
    updateSkewPresetSelectionUI(presetsContainer);
    renderScene();
  }
  
  function updateSkewPresetSelectionUI(container) {
    if (!container) return;
    const tiles = container.querySelectorAll('.skew-preset');
    tiles.forEach(t => {
      if (t.dataset.key === appState.ui.skewSelectedPreset) t.classList.add('selected');
      else t.classList.remove('selected');
    });
  }
  
  function setupSkewPresets() {
    const container = document.getElementById('skew-presets');
    if (!container) return;
  
    container.querySelectorAll('.skew-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        applySkewPreset(key);
      });
    });
  
    // Initialize default selection if none
    if (!appState.ui.skewSelectedPreset) {
      appState.ui.skewSelectedPreset = 'none';
    }
    updateSkewPresetSelectionUI(container);
  }
  
  function applyGlowPreset(key) {
    const presetsContainer = document.getElementById('glow-presets');
    const glowCustom = document.getElementById('glow-custom-controls');
    const toggle = document.getElementById('glow-enable-ui');
  
    appState.ui.glowSelectedPreset = key;
  
    if (key === 'none') {
      appState.effects.glow.active = false;
      appState.ui.glowShowControls = false;
      if (glowCustom) glowCustom.style.display = 'none';
      if (toggle) toggle.checked = false;
      updateGlowPresetSelectionUI(presetsContainer);
      renderScene();
      return;
    }
  
    if (key === 'custom') {
      appState.effects.glow.active = true;
      appState.ui.glowShowControls = true;
      if (glowCustom) glowCustom.style.display = 'block';
      if (toggle) toggle.checked = true;
      // Ensure controls reflect current appState values when entering Custom
      initializeEffectControls();
      updateGlowPresetSelectionUI(presetsContainer);
      renderScene();
      return;
    }
  
    // Apply predefined preset values
    let preset = glowPresets[key];
    if (key === 'outer-halo') {
      const colorInput = document.getElementById('glow-color-ui');
      const hex = colorInput && colorInput.value ? colorInput.value : '#2196F3';
      preset = { color: hex, blur: 40, offsetX: 0, offsetY: 0 };
    }
  
    if (preset) {
      Object.assign(appState.effects.glow, preset);
    }
    appState.effects.glow.active = true;
    appState.ui.glowShowControls = false; // hide controls unless Custom
    if (glowCustom) glowCustom.style.display = 'none';
    if (toggle) toggle.checked = true;
  
    // Sync UI inputs to reflect preset values
    initializeEffectControls();
    updateGlowPresetSelectionUI(presetsContainer);
    renderScene();
  }
  
  function updateGlowPresetSelectionUI(container) {
    if (!container) return;
    const tiles = container.querySelectorAll('.glow-preset');
    tiles.forEach(t => {
      if (t.dataset.key === appState.ui.glowSelectedPreset) t.classList.add('selected');
      else t.classList.remove('selected');
    });
  }
  
  function setupGlowPresets() {
    const container = document.getElementById('glow-presets');
    if (!container) return;
  
    container.querySelectorAll('.glow-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        applyGlowPreset(key);
      });
    });
  
    // Initialize default selection if none
    if (!appState.ui.glowSelectedPreset) {
      appState.ui.glowSelectedPreset = 'none';
      appState.ui.glowShowControls = false;
    }
    updateGlowPresetSelectionUI(container);
  }



 function apply3DPreset(transform) {
    // Ensure transform state exists
    if (!appState.scene.transform) {
        appState.scene.transform = {
            rotate: 0,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            translateZ: 0,
            perspective: 100,
            scale: 100
        };
    }

    // Apply 3D transform values
    appState.scene.transform.rotateX = transform.rotateX || 0;
    appState.scene.transform.rotateY = transform.rotateY || 0;
    appState.scene.transform.rotateZ = transform.rotateZ || transform.rotate || 0;
    appState.scene.transform.translateZ = transform.translateZ || 0;
    appState.scene.transform.perspective = transform.perspective || 100;
    appState.scene.transform.scale = transform.scale || 100;

    // Optional: Also apply Skew if provided
    if (transform.skewX !== undefined || transform.skewY !== undefined) {
        appState.effects.skew.xAngle = transform.skewX || 0;
        appState.effects.skew.yAngle = transform.skewY || 0;
        appState.effects.skew.active = true;
    }

    // Update UI sliders (if they exist)
    const rotateSlider = document.getElementById('rotate-ui');
    const scaleSlider = document.getElementById('scale-ui');
    const rotateValue = document.getElementById('rotate-value');
    const scaleValue = document.getElementById('scale-value');

    if (rotateSlider) rotateSlider.value = appState.scene.transform.rotateZ;
    if (scaleSlider) scaleSlider.value = appState.scene.transform.scale;
    if (rotateValue) rotateValue.textContent = appState.scene.transform.rotateZ;
    if (scaleValue) scaleValue.textContent = appState.scene.transform.scale;

    // Re-render the scene
    renderScene();
}





// ✅ FIXED: Reset All Effects (with confirmation + 3D Transforms)
function resetAllEffects() {
    // ⚠️ ASK USER TO CONFIRM FIRST
    if (!confirm('⚠️ Are you sure you want to reset ALL effects?\n\nThis will clear Glow, Float, Skew, Rotate, Scale, and 3D transforms.\n\nThis action cannot be undone.')) {
        return; // User clicked "Cancel" — do nothing
    }

    // Reset all effect states
    Object.keys(appState.effects).forEach(effectKey => {
        appState.effects[effectKey].active = false;
    });

    // Reset Glow
    appState.effects.glow = { 
        active: false, 
        color: '#2196F3', 
        blur: 8, 
        offsetX: 0, 
        offsetY: 0 
    };

    // Reset Skew
    appState.effects.skew = { 
        active: false, 
        xAngle: 0, 
        yAngle: 0 
    };

    // Reset Float
    appState.effects.float = {
        active: false,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 20,
        shadowOffsetX: 0,
        shadowOffsetY: 10,
        elevation: 10
    };

    // ✅ RESET 3D TRANSFORM
    if (!appState.scene.transform) {
        appState.scene.transform = {};
    }
    appState.scene.transform.rotate = 0;
    appState.scene.transform.scale = 100;
    appState.scene.transform.rotateX = 0;
    appState.scene.transform.rotateY = 0;
    appState.scene.transform.rotateZ = 0;
    appState.scene.transform.translateZ = 0;
    appState.scene.transform.perspective = 100;

    // Reset meta so next enable re-applies best presets
    appState.effectsMeta = {
        glow: { autoApplied: false },
        float: { autoApplied: false },
        skew: { autoApplied: false },
    };

    // ✅ RESET UI CONTROLS
    // Skew sliders/counters
    const skewXSlider = document.getElementById('skew-x-ui');
    const skewYSlider = document.getElementById('skew-y-ui');
    const skewXCounter = document.getElementById('skew-x-counter');
    const skewYCounter = document.getElementById('skew-y-counter');
    if (skewXSlider) skewXSlider.value = 0;
    if (skewYSlider) skewYSlider.value = 0;
    if (skewXCounter) skewXCounter.value = 0;
    if (skewYCounter) skewYCounter.value = 0;

    // Rotate slider/counter
    const rotateSlider = document.getElementById('rotate-ui');
    const rotateValue = document.getElementById('rotate-value');
    if (rotateSlider) rotateSlider.value = 0;
    if (rotateValue) rotateValue.textContent = '0';

    // Scale slider/counter
    const scaleSlider = document.getElementById('scale-ui');
    const scaleValue = document.getElementById('scale-value');
    if (scaleSlider) scaleSlider.value = 100;
    if (scaleValue) scaleValue.textContent = '100';

    // Reinitialize other controls (Glow/Float UI)
    initializeEffectControls();

    // Render scene to apply reset
    renderScene();

    // Show success message
    alert('✅ All effects and transforms have been reset to default values!');
}





     
  const scene = document.getElementById("scene");
  let initSceneWidth = null;
  let initSceneHeight = null;
  
  // Function to capture initial dimensions when image is loaded
  function captureInitialDimensions() {
    if (!initSceneWidth || !initSceneHeight) {
      const rect = scene.getBoundingClientRect();
      initSceneWidth = rect.width;
      initSceneHeight = rect.height;
      console.log("Captured initial dimensions:", initSceneWidth, initSceneHeight);
    }
  }
  
  const previewArea = document.getElementById("preview-area");
  const uploadPrompt = document.getElementById("upload-prompt");
  const removeBtn = document.getElementById("remove-btn");
  // Alignment guides config and elements
  const ALIGN_CONFIG = { threshold: 8, showGuides: true, snap: true };
  const centerGuideX = document.getElementById('center-guide-x');
  const centerGuideY = document.getElementById('center-guide-y');
  // Application State Management
  const appState = {
      scene: {
          width: 800,
          height: 600,
          background: {
              type: 'color',
              value: '#ffffff'
          },
          // ➕ ADD THIS: Proper 3D transform state
          transform: {
              rotate: 0,        // Legacy 2D rotation (Z-axis)
              rotateX: 0,       // 3D rotation around X-axis
              rotateY: 0,       // 3D rotation around Y-axis
              rotateZ: 0,       // 3D rotation around Z-axis (same as "rotate")
              translateZ: 0,    // Depth (negative = closer, positive = farther)
              perspective: 100, // Field of view
              scale: 100        // Uniform scale
          }
      },
// ... rest of appState (image, ui, effects) remains unchanged
      image: {
          element: null, // The actual HTMLImageElement holding the loaded image
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          naturalWidth: null,
          naturalHeight: null
      },
      ui: {
          // State for UI elements like which ratio button is active, selected background, etc.
          activeRatio: 'auto',
          selectedBackgroundType: 'color', // 'color', 'image', 'gradient'
          selectedEffect: null, // e.g., 'effect-skew-basic'
          // Glow presets UI state
          glowSelectedPreset: 'none',
          glowShowControls: false,
          // Skew presets UI state
          skewSelectedPreset: 'none',
          skewShowControls: false,
          // Float presets UI state
          floatSelectedPreset: 'none',
          floatShowControls: false,
          floatAutoElevation: true
          // ... other UI states
      },
      effects: {
          // Define effects as structured data, not just CSS class names
          skew: { active: false, xAngle: 0, yAngle: 0 },
          glow: { active: false, color: '#2196F3', blur: 8, offsetX: 0, offsetY: 0 },
          // NEW: Float effect
          float: {
              active: false,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowOffsetY: 10,
              elevation: 10 // Controls how "high" the image appears to float
          }
          // Add more effect structures as needed
      },
      // One-time auto-apply flags so presets apply only on the first enable
      effectsMeta: {
          glow: { autoApplied: false },
          float: { autoApplied: false },
          skew: { autoApplied: false },
          
      }
  };
  
  // Canvas elements
  const masterCanvas = document.getElementById('master-canvas');
  const ctx = masterCanvas.getContext('2d');
  // Helper to set image interactivity (drag/resize overlay)
  function setImageInteractivity(isInteractive) {
    if (!imageContainerUI) return;
    imageContainerUI.style.display = 'block';
    imageContainerUI.style.left = `${appState.image.x}px`;
    imageContainerUI.style.top = `${appState.image.y}px`;
    imageContainerUI.style.width = `${appState.image.width}px`;
    imageContainerUI.style.height = `${appState.image.height}px`;
    imageContainerUI.style.pointerEvents = isInteractive ? 'auto' : 'none';
  }
  
  // Core Canvas Rendering Engine
  
  // Core Canvas Rendering Engine
  function renderScene() {
      const { scene: sceneState, image, effects } = appState;
  
      // 1. Clear canvas
      ctx.clearRect(0, 0, sceneState.width, sceneState.height);
  
      // 2. Draw Background
      drawBackground(ctx, sceneState);
  
      // 3. Draw Main Image (if loaded)
      if (image.element) {
          const imgX = image.x;
          const imgY = image.y;
          const imgWidth = image.width;
          const imgHeight = image.height;
          const cornerRadius = 8;
  
          // Outer save for entire image+effects block
          ctx.save();
  
          // Compute center for transforms
          const cx = imgX + imgWidth / 2;
          const cy = imgY + imgHeight / 2;
  
          // Apply transforms with center pivot
// Apply transforms with center pivot
          ctx.translate(cx, cy);

          const transform = sceneState.transform;
          if (transform) {
              // 1. Apply Scale
              if (transform.scale !== 100) {
                  const scale = transform.scale / 100;
                  ctx.scale(scale, scale);
              }

              // 2. Apply Perspective & Depth (translateZ)
              if (transform.translateZ !== 0) {
                  const perspective = transform.perspective || 100;
                  // Prevent division by zero or negative scale
                  const scaleZ = Math.max(0.1, perspective / (perspective + transform.translateZ));
                  ctx.scale(scaleZ, scaleZ);
              }

              // 3. Apply 3D Rotations
              // Rotate X (tilt up/down) — affects Y-scale
              if (transform.rotateX !== 0) {
                  const radX = transform.rotateX * Math.PI / 180;
                  const scaleY = Math.cos(radX);
                  ctx.scale(1, Math.abs(scaleY));
              }

              // Rotate Y (pan left/right) — affects X-scale + skew
              if (transform.rotateY !== 0) {
                  const radY = transform.rotateY * Math.PI / 180;
                  const scaleX = Math.cos(radY);
                  const skewX = Math.sin(radY) * 0.5; // Subtle skew for natural look
                  ctx.scale(Math.abs(scaleX), 1);
                  ctx.transform(1, 0, skewX, 1, 0, 0);
              }

              // Rotate Z (spin) — same as legacy "rotate"
              if (transform.rotateZ !== 0) {
                  const radZ = transform.rotateZ * Math.PI / 180;
                  ctx.rotate(radZ);
              }
          }

          // 4. Apply Legacy 2D Rotation (for backward compatibility)
          if (transform && transform.rotate !== undefined && transform.rotate !== 0) {
              const rotateLegacy = transform.rotate * Math.PI / 180;
              ctx.rotate(rotateLegacy);
          }

          // 5. Apply Skew (2D shear)
          if (effects.skew.active) {
              const sx = Math.tan(effects.skew.xAngle * Math.PI / 180);
              const sy = Math.tan(effects.skew.yAngle * Math.PI / 180);
              ctx.transform(1, sy, sx, 1, 0, 0);
          }

          ctx.translate(-cx, -cy);
  
          // FLOAT SHADOW (under image): after transforms, before clipping
          if (effects.float.active) {
              ctx.save();
              ctx.shadowColor = effects.float.shadowColor;
              ctx.shadowBlur = effects.float.shadowBlur;
              ctx.shadowOffsetX = effects.float.shadowOffsetX;
              ctx.shadowOffsetY = effects.float.shadowOffsetY;
              ctx.fillStyle = '#000000';
              if (ctx.roundRect) {
                  ctx.beginPath();
                  ctx.roundRect(imgX, imgY, imgWidth, imgHeight, cornerRadius);
                  ctx.fill();
              } else {
                  ctx.beginPath();
                  ctx.moveTo(imgX + cornerRadius, imgY);
                  ctx.lineTo(imgX + imgWidth - cornerRadius, imgY);
                  ctx.quadraticCurveTo(imgX + imgWidth, imgY, imgX + imgWidth, imgY + cornerRadius);
                  ctx.lineTo(imgX + imgWidth, imgY + imgHeight - cornerRadius);
                  ctx.quadraticCurveTo(imgX + imgWidth, imgY + imgHeight, imgX + imgWidth - cornerRadius, imgY + imgHeight);
                  ctx.lineTo(imgX + cornerRadius, imgY + imgHeight);
                  ctx.quadraticCurveTo(imgX, imgY + imgHeight, imgX, imgY + imgHeight - cornerRadius);
                  ctx.lineTo(imgX, imgY + cornerRadius);
                  ctx.quadraticCurveTo(imgX, imgY, imgX + cornerRadius, imgY);
                  ctx.closePath();
                  ctx.fill();
              }
              // Clear shadow state to avoid bleed
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              ctx.restore();
          }
  
          // GLOW (under image): draw rounded shape with shadow before clipping
          if (effects.glow.active) {
              ctx.save();
              ctx.shadowColor = effects.glow.color;
              ctx.shadowBlur = effects.glow.blur;
              ctx.shadowOffsetX = effects.glow.offsetX;
              ctx.shadowOffsetY = effects.glow.offsetY;
              if (ctx.roundRect) {
                  ctx.beginPath();
                  ctx.roundRect(imgX, imgY, imgWidth, imgHeight, cornerRadius);
                  ctx.fillStyle = '#000000';
                  ctx.fill();
              } else {
                  ctx.beginPath();
                  ctx.moveTo(imgX + cornerRadius, imgY);
                  ctx.lineTo(imgX + imgWidth - cornerRadius, imgY);
                  ctx.quadraticCurveTo(imgX + imgWidth, imgY, imgX + imgWidth, imgY + cornerRadius);
                  ctx.lineTo(imgX + imgWidth, imgY + imgHeight - cornerRadius);
                  ctx.quadraticCurveTo(imgX + imgWidth, imgY + imgHeight, imgX + imgWidth - cornerRadius, imgY + imgHeight);
                  ctx.lineTo(imgX + cornerRadius, imgY + imgHeight);
                  ctx.quadraticCurveTo(imgX, imgY + imgHeight, imgX, imgY + imgHeight - cornerRadius);
                  ctx.lineTo(imgX, imgY + cornerRadius);
                  ctx.quadraticCurveTo(imgX, imgY, imgX + cornerRadius, imgY);
                  ctx.closePath();
                  ctx.fillStyle = '#000000';
                  ctx.fill();
              }
              // Clear shadow state
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              ctx.restore();
          }
  
          // Rounded clipping path for the main image only
          if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(imgX, imgY, imgWidth, imgHeight, cornerRadius);
          } else {
              ctx.beginPath();
              ctx.moveTo(imgX + cornerRadius, imgY);
              ctx.lineTo(imgX + imgWidth - cornerRadius, imgY);
              ctx.quadraticCurveTo(imgX + imgWidth, imgY, imgX + imgWidth, imgY + cornerRadius);
              ctx.lineTo(imgX + imgWidth, imgY + imgHeight - cornerRadius);
              ctx.quadraticCurveTo(imgX + imgWidth, imgY + imgHeight, imgX + imgWidth - cornerRadius, imgY + imgHeight);
              ctx.lineTo(imgX + cornerRadius, imgY + imgHeight);
              ctx.quadraticCurveTo(imgX, imgY + imgHeight, imgX, imgY + imgHeight - cornerRadius);
              ctx.lineTo(imgX, imgY + cornerRadius);
              ctx.quadraticCurveTo(imgX, imgY, imgX + cornerRadius, imgY);
              ctx.closePath();
          }
          ctx.clip();
  
          // Draw main image (no vintage filter)
          ctx.drawImage(image.element, imgX, imgY, imgWidth, imgHeight);
  
          // Outer restore
          ctx.restore();
      }
  }
  
  
  // Draw the background Proxied
  function drawBackground(context, sceneState) {
      const { width, height, background } = sceneState;
      context.save();
  
    let backgroundDrawn = false;
    if (background.type === 'image') {
      const proxyUrl = getProxiedImageUrl(background.value);
      if (background.element) {
        context.drawImage(background.element, 0, 0, width, height);
        backgroundDrawn = true;
      } else {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          background.element = img;
          renderScene(); // re-render after image loads
        };
        img.onerror = (error) => {
          console.error('Failed to load background image:', error);
          // Fallback to black
          background.type = 'color';
          background.value = '#000000';
          background.element = null;
          renderScene(); // re-render with fallback
        };
        img.src = proxyUrl;
      }
    }
    if (!backgroundDrawn) {
      if (background.type === 'gradient') {
        const gradient = createCanvasGradient(context, background.value, width, height);
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      } else if (background.type === 'color') {
        context.fillStyle = background.value;
        context.fillRect(0, 0, width, height);
      }
    }
    context.restore();
  }
  
  // Add this helper function to handle image URLs
  function getProxiedImageUrl(originalUrl) {
      // Option 1: Using imgproxy.net (recommended for production)
      // return `https://imgproxy.net/unsafe/${originalUrl}`;
      
      // Option 2: Using cors-anywhere (for development)
      return `https://cors-anywhere.herokuapp.com/${originalUrl}`;
      
      // Option 3: Using statically.io (good free option)
      // return `https://cdn.statically.io/img/${originalUrl.replace('https://', '')}`;
  }
  
  // Removed applyEffectsToContext and resetContextEffects functions
  // They are no longer needed with the new renderScene implementation
  
  function createCanvasGradient(context, gradientDef, width, height) {
      // For simplicity, we'll create predefined gradients based on the type
      // In a more advanced implementation, you could parse CSS gradient strings
      
      switch (gradientDef) {
          case 'purple-blue':
              const purpleBlue = context.createLinearGradient(0, 0, width, height);
              purpleBlue.addColorStop(0, '#9b59b6');
              purpleBlue.addColorStop(1, '#3498db');
              return purpleBlue;
              
          case 'pink-purple':
              const pinkPurple = context.createLinearGradient(0, 0, width, height);
              pinkPurple.addColorStop(0, '#e91e63');
              pinkPurple.addColorStop(1, '#9c27b0');
              return pinkPurple;
              
          case 'orange-yellow':
              const orangeYellow = context.createLinearGradient(0, 0, width, height);
              orangeYellow.addColorStop(0, '#ff9800');
              orangeYellow.addColorStop(1, '#ffeb3b');
              return orangeYellow;
              
          case 'blue-teal':
              const blueTeal = context.createLinearGradient(0, 0, width, height);
              blueTeal.addColorStop(0, '#2196F3');
              blueTeal.addColorStop(1, '#009688');
              return blueTeal;
              
          default:
              // Default gradient
              const defaultGradient = context.createLinearGradient(0, 0, width, height);
              defaultGradient.addColorStop(0, '#667eea');
              defaultGradient.addColorStop(1, '#764ba2');
              return defaultGradient;
      }
  }
  
  // Initial render
  renderScene();
  // Responsive Canvas Resizing
  function resizeCanvas() {
      const sceneElement = document.getElementById('scene');
      if (!sceneElement) return;
      
      const rect = sceneElement.getBoundingClientRect();
      
      // Update canvas dimensions
      masterCanvas.width = rect.width;
      masterCanvas.height = rect.height;
      
      // Update appState with new dimensions
      appState.scene.width = rect.width;
      appState.scene.height = rect.height;
      
      // Re-render the scene
      renderScene();
  }
  
  // Initial canvas resize
  window.addEventListener('load', resizeCanvas);
  
  // Handle window resize
  window.addEventListener('resize', resizeCanvas);
  
  // Image Dragging and Resizing Variables
  let isDragging = false;
  let isResizing = false;
  let startX, startY, startWidth, startHeight, startLeft, startTop;
  let currentHandle = null;
  let aspectRatio = null;
  
  // Get references to UI elements
  const imageContainerUI = document.getElementById('image-container-ui');
  const removeImageBtn = document.getElementById('remove-image-btn');
  const resizeHandles = imageContainerUI.querySelectorAll('.resize-handle');
  
  // Add event listener to the remove button
  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeImage();
    });
  }
  
  // New interaction logic
  imageContainerUI.addEventListener('mousedown', (e) => {
    // Ensure we're not clicking on a resize handle
    if (e.target.classList.contains('resize-handle')) {
      return;
    }
  
    isDragging = true;
    isResizing = false; // Ensure resizing is off
    
    // Record starting positions
    startX = e.clientX;
    startY = e.clientY;
    startLeft = appState.image.x;
    startTop = appState.image.y;
  
    e.preventDefault();
    e.stopPropagation();
  });
  
  // Touch support for dragging
  imageContainerUI.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('resize-handle')) {
      return;
    }
    const t = e.touches && e.touches[0];
    if (!t) return;
    isDragging = true;
    isResizing = false;
    startX = t.clientX;
    startY = t.clientY;
    startLeft = appState.image.x;
    startTop = appState.image.y;
    e.preventDefault(); // prevent page scroll while dragging
    e.stopPropagation();
  }, { passive: false });
  
  // Add resize handle events
  resizeHandles.forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      isDragging = false; // Ensure dragging is off
      currentHandle = handle.classList[1]; // e.g., 'top-left'
  
      // Record starting positions
      startX = e.clientX;
      startY = e.clientY;
      startWidth = appState.image.width;
      startHeight = appState.image.height;
      startLeft = appState.image.x;
      startTop = appState.image.y;
      aspectRatio = startWidth / startHeight;
  
      e.preventDefault();
      e.stopPropagation();
    });
  
    // Touch support for resizing
    handle.addEventListener('touchstart', (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      isResizing = true;
      isDragging = false;
      currentHandle = handle.classList[1];
      startX = t.clientX;
      startY = t.clientY;
      startWidth = appState.image.width;
      startHeight = appState.image.height;
      startLeft = appState.image.x;
      startTop = appState.image.y;
      aspectRatio = startWidth / startHeight;
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
  });
  
  // Update the document mousemove event listener
  document.addEventListener('mousemove', (e) => {
    if (!isDragging && !isResizing) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    if (isDragging) {
      // Update image position
      appState.image.x = startLeft + dx;
      appState.image.y = startTop + dy;
      // Center alignment guides + snapping (only when dragging the image)
      if (ALIGN_CONFIG.showGuides) {
        const cx = appState.scene.width / 2;
        const cy = appState.scene.height / 2;
        const imgCenterX = appState.image.x + appState.image.width / 2;
        const imgCenterY = appState.image.y + appState.image.height / 2;
  
        let snappedX = false;
        let snappedY = false;
  
        // Vertical center proximity
        if (Math.abs(imgCenterX - cx) <= ALIGN_CONFIG.threshold) {
          centerGuideX.style.opacity = '1';
          if (ALIGN_CONFIG.snap) {
            appState.image.x = cx - appState.image.width / 2;
            snappedX = true;
          }
        } else {
          centerGuideX.style.opacity = '0';
        }
  
        // Horizontal center proximity
        if (Math.abs(imgCenterY - cy) <= ALIGN_CONFIG.threshold) {
          centerGuideY.style.opacity = '1';
          if (ALIGN_CONFIG.snap) {
            appState.image.y = cy - appState.image.height / 2;
            snappedY = true;
          }
        } else {
          centerGuideY.style.opacity = '0';
        }
  
        // If snapped, ensure UI overlay reflects updated x/y before render
        if (snappedX || snappedY) {
          imageContainerUI.style.left = `${appState.image.x}px`;
          imageContainerUI.style.top = `${appState.image.y}px`;
        }
      }
  
      // Update UI overlay position
      imageContainerUI.style.left = `${appState.image.x}px`;
      imageContainerUI.style.top = `${appState.image.y}px`;
      
      // Re-render the scene
      renderScene();
    } else if (isResizing && currentHandle) {
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;
      
      // Resize logic based on handle
      switch (currentHandle) {
        case 'bottom-right':
          if (Math.abs(dx) > Math.abs(dy)) {
            newWidth = startWidth + dx;
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = startHeight + dy;
            newWidth = newHeight * aspectRatio;
          }
          break;
        case 'top-left':
          if (Math.abs(dx) > Math.abs(dy)) {
            newWidth = startWidth - dx;
            newHeight = newWidth / aspectRatio;
            newLeft = startLeft + dx;
            newTop = startTop + (startHeight - newHeight);
          } else {
            newHeight = startHeight - dy;
            newWidth = newHeight * aspectRatio;
            newLeft = startLeft + (startWidth - newWidth);
            newTop = startTop + dy;
          }
          break;
        case 'top-right':
          if (Math.abs(dx) > Math.abs(dy)) {
            newWidth = startWidth + dx;
            newHeight = newWidth / aspectRatio;
            newTop = startTop + (startHeight - newHeight);
          } else {
            newHeight = startHeight - dy;
            newWidth = newHeight * aspectRatio;
            newTop = startTop + dy;
          }
          break;
        case 'bottom-left':
          if (Math.abs(dx) > Math.abs(dy)) {
            newWidth = startWidth - dx;
            newHeight = newWidth / aspectRatio;
            newLeft = startLeft + dx;
          } else {
            newHeight = startHeight + dy;
            newWidth = newHeight * aspectRatio;
            newLeft = startLeft + (startWidth - newWidth);
          }
          break;
        case 'top':
          newHeight = startHeight - dy;
          newWidth = newHeight * aspectRatio;
          newTop = startTop + dy;
          break;
        case 'bottom':
          newHeight = startHeight + dy;
          newWidth = newHeight * aspectRatio;
          break;
        case 'left':
          newWidth = startWidth - dx;
          newHeight = newWidth / aspectRatio;
          newLeft = startLeft + dx;
          break;
        case 'right':
          newWidth = startWidth + dx;
          newHeight = newWidth / aspectRatio;
          break;
      }
      
      // Apply minimum size constraints
      const minSize = 50;
      if (newWidth < minSize) {
        newWidth = minSize;
        newHeight = newWidth / aspectRatio;
      }
      if (newHeight < minSize) {
        newHeight = minSize;
        newWidth = newHeight * aspectRatio;
      }
      
      // Update appState and UI
      appState.image.width = newWidth;
      appState.image.height = newHeight;
      appState.image.x = newLeft;
      appState.image.y = newTop;
      
      // Update UI overlay
      imageContainerUI.style.left = `${newLeft}px`;
      imageContainerUI.style.top = `${newTop}px`;
      imageContainerUI.style.width = `${newWidth}px`;
      imageContainerUI.style.height = `${newHeight}px`;
      
      renderScene();
    }
  });
  
  document.addEventListener('mouseup', () => {
    // Set isDragging = false, isResizing = false
    isDragging = false;
    isResizing = false;
    currentHandle = null;
    // Hide guides when interaction ends
    if (ALIGN_CONFIG.showGuides) {
      centerGuideX.style.opacity = '0';
      centerGuideY.style.opacity = '0';
    }
  });
  
  // Touch end mirrors mouseup
  document.addEventListener('touchend', () => {
    isDragging = false;
    isResizing = false;
    currentHandle = null;
    if (ALIGN_CONFIG.showGuides) {
      centerGuideX.style.opacity = '0';
      centerGuideY.style.opacity = '0';
    }
  });
  document.addEventListener('touchcancel', () => {
    isDragging = false;
    isResizing = false;
    currentHandle = null;
    if (ALIGN_CONFIG.showGuides) {
      centerGuideX.style.opacity = '0';
      centerGuideY.style.opacity = '0';
    }
  });
  
  
  
  // Create file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  
  fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      handleFiles(this.files);
    }
  });
  
  
  // Upload trigger function
  function triggerFileUpload() {
    fileInput.click();
  }
  
  // Handle drag & drop
  ['dragenter', 'dragover'].forEach(eventName => {
    previewArea.addEventListener(eventName, preventDefaults, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    previewArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  previewArea.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }
  
  function handleFiles(files) {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        // Create a new image element to load the image
        const img = new Image();
        img.onload = () => {
          // Update appState with the loaded image
          appState.image.element = img;
          appState.image.naturalWidth = img.naturalWidth;
          appState.image.naturalHeight = img.naturalHeight;
          
          // Calculate initial size and position
          const sceneWidth = appState.scene.width;
          const sceneHeight = appState.scene.height;
          const imgAspectRatio = img.naturalWidth / img.naturalHeight;
          
          let initialWidth, initialHeight;
          const maxWidth = sceneWidth * 0.8;
          const maxHeight = sceneHeight * 0.8;
          
          if (imgAspectRatio > 1) {
            // Landscape
            initialWidth = Math.min(img.naturalWidth, maxWidth);
            initialHeight = initialWidth / imgAspectRatio;
          } else {
            // Portrait
            initialHeight = Math.min(img.naturalHeight, maxHeight);
            initialWidth = initialHeight * imgAspectRatio;
          }
          
          // Position image in center
          appState.image.width = initialWidth;
          appState.image.height = initialHeight;
          appState.image.x = (sceneWidth - initialWidth) / 2;
          appState.image.y = (sceneHeight - initialHeight) / 2;
          
          // Hide upload prompt
          uploadPrompt.style.display = 'none';
          
          // Show remove button
          removeBtn.style.display = 'inline-block';
          
          // Render the scene with the new image
          renderScene();
          
          // Show the UI overlay
    setImageInteractivity(true);
          
          // Capture initial dimensions after first image load
          setTimeout(captureInitialDimensions, 100);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Remove image function
  // Remove image function
  function removeImage() {
    // Reset appState image properties
    appState.image.element = null;
    appState.image.naturalWidth = null;
    appState.image.naturalHeight = null;
    appState.image.width = 100;
    appState.image.height = 100;
    appState.image.x = 0;
    appState.image.y = 0;
    
    // Show upload prompt, hide remove button
    uploadPrompt.style.display = 'block';
    removeBtn.style.display = 'none'; // This is the global button
    fileInput.value = ''; // Reset file input
    
    // Render the scene without the image
    renderScene();
    
    // Hide the UI overlay
    if (imageContainerUI) {
      imageContainerUI.style.display = 'none';
    }
  }
  
  
  // ==================== ENHANCED SCREEN CAPTURE WITH BETTER FOCUS MANAGEMENT ====================
  
  class ScreenCaptureManager {
    constructor() {
      this.isCapturing = false;
      this.originalTitle = document.title;
    }
  
    async capture() {
      if (this.isCapturing) {
        throw new Error('Already capturing screen');
      }
  
      this.isCapturing = true;
  
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
  
        return new Promise((resolve, reject) => {
          const video = document.createElement('video');
          video.srcObject = stream;
          
          video.addEventListener('loadedmetadata', () => {
            video.play();
            
            // Start visual indicators immediately
            this.startCaptureIndicators();
            
            setTimeout(() => {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              const ctx = canvas.getContext('2d');
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              stream.getTracks().forEach(track => track.stop());
              video.remove();
              
              this.isCapturing = false;
              
              // Stop indicators and show completion
              this.showCaptureComplete();
              
              resolve(canvas.toDataURL('image/png'));
            }, 300);
          });
  
          video.addEventListener('error', (err) => {
            stream.getTracks().forEach(track => track.stop());
            video.remove();
            this.isCapturing = false;
            this.resetIndicators();
            reject(new Error('Failed to capture screen: ' + err.message));
          });
        });
  
      } catch (error) {
        this.isCapturing = false;
        this.resetIndicators();
        
        if (error.name === 'NotAllowedError') {
          throw new Error('Screen capture permission denied by user');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No screen capture sources available');
        } else {
          throw new Error('Screen capture failed: ' + error.message);
        }
      }
    }
  
    startCaptureIndicators() {
      // Change page title to grab attention
      document.title = "📸 Capturing... - " + this.originalTitle;
      
      // Change favicon to indicate capture
      this.changeFavicon('📸');
      
      // Flash the page background
      document.body.style.animation = 'captureFlash 0.5s ease-in-out infinite';
      
      // Add the keyframe animation if it doesn't exist
      if (!document.getElementById('capture-animation-style')) {
        const style = document.createElement('style');
        style.id = 'capture-animation-style';
        style.textContent = `
          @keyframes captureFlash {
            0%, 100% { background-color: rgba(74, 0, 224, 0.1); }
            50% { background-color: rgba(74, 0, 224, 0.3); }
          }
          @keyframes returnNotification {
            0% { transform: translateY(-100px); opacity: 0; }
            10%, 90% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-100px); opacity: 0; }
          }
          .return-notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #4a00e0, #9b59b6);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            z-index: 10001;
            box-shadow: 0 4px 20px rgba(74, 0, 224, 0.3);
            animation: returnNotification 4s ease-in-out;
          }
        `;
        document.head.appendChild(style);
      }
    }
  
    showCaptureComplete() {
      // Reset title and favicon
      document.title = "✅ Screenshot Ready! - " + this.originalTitle;
      this.changeFavicon('✅');
      
      // Stop the flash animation
      document.body.style.animation = '';
      
      // Show prominent notification
      const notification = document.createElement('div');
      notification.className = 'return-notification';
      notification.innerHTML = `
        <div>🎉 Screenshot captured successfully!</div>
        <div style="font-size: 14px; margin-top: 5px;">Ready to crop and edit</div>
      `;
      document.body.appendChild(notification);
      
      // Remove notification after animation
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
        // Reset title after notification
        document.title = this.originalTitle;
        this.changeFavicon('🖼️');
      }, 4000);
  
      // Try to trigger browser notification if permission granted
      this.showBrowserNotification();
      
      // Play notification sound
      this.playNotificationSound();
    }
  
    resetIndicators() {
      document.title = this.originalTitle;
      document.body.style.animation = '';
      this.changeFavicon('🖼️');
    }
  
    changeFavicon(emoji) {
      // Remove existing favicon
      const existingLink = document.querySelector('link[rel="icon"]');
      if (existingLink) {
        existingLink.remove();
      }
  
      // Create new favicon with emoji
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 16, 16);
  
      const link = document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = canvas.toDataURL('image/png');
      document.head.appendChild(link);
    }
  
    async showBrowserNotification() {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Screenshot Ready! 📸', {
            body: 'Click to return to the app and crop your screenshot',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234a00e0"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234a00e0"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2z"/></svg>',
            tag: 'screenshot-ready',
            requireInteraction: true
          });
        } else if (Notification.permission === 'default') {
          // Request permission for future use
          await Notification.requestPermission();
        }
      }
    }
  
    playNotificationSound() {
      // Create a subtle notification sound
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }
    }
  
    
    showCropInterface(imageDataUrl) {
      // Enhanced crop interface with PWA awareness
      const cropOverlay = document.createElement('div');
      cropOverlay.id = 'crop-overlay';
      cropOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        backdrop-filter: blur(5px);
      `;
  
      // Enhanced header with PWA context
      const header = document.createElement('div');
      header.style.cssText = `
        color: #4a00e0;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
        animation: pulse 2s ease-in-out infinite;
      `;
      header.innerHTML = this.isPWA ? '🎯 App Mode Active!' : '🎯 You\'re back!';
      
      if (!document.getElementById('pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.textContent = `
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
  
      cropOverlay.appendChild(header);
  
      // Create crop container
      const cropContainer = document.createElement('div');
      cropContainer.style.cssText = `
        position: relative;
        max-width: 90vw;
        max-height: 70vh;
        overflow: hidden;
        border: 3px solid #4a00e0;
        border-radius: 8px;
        box-shadow: 0 0 30px rgba(74, 0, 224, 0.5);
      `;
  
      // Display full image
      const img = document.createElement('img');
      img.src = imageDataUrl;
      img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        cursor: crosshair;
        display: block;
      `;
  
      // Add crop selection overlay
      const selection = document.createElement('div');
      selection.id = 'crop-selection';
      selection.style.cssText = `
        position: absolute;
        border: 2px dashed #4a00e0;
        background: rgba(74, 0, 224, 0.2);
        display: none;
        pointer-events: none;
        z-index: 10001;
      `;
  
      cropContainer.appendChild(img);
      cropContainer.appendChild(selection);
      cropOverlay.appendChild(cropContainer);
  
      // Enhanced instructions
      const instructions = document.createElement('div');
      instructions.style.cssText = `
        color: white;
        margin-top: 20px;
        font-size: 18px;
        text-align: center;
        background: rgba(74, 0, 224, 0.2);
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #4a00e0;
        max-width: 90vw;
      `;
      instructions.innerHTML = `
        <div style="color: #4a00e0; font-weight: bold; margin-bottom: 8px;">📸 Screenshot Ready!</div>
        <div>Drag to select area • Press Enter to confirm</div>
        <div style="font-size: 14px; margin-top: 5px; opacity: 0.8;">${this.isPWA ? '📱 PWA Mode' : '🖥️ Browser Mode'}</div>
      `;
      cropOverlay.appendChild(instructions);
  
      // Enhanced controls
      const controls = document.createElement('div');
      controls.style.cssText = `
        margin-top: 25px;
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: center;
      `;
  
      const cropBtn = document.createElement('button');
      cropBtn.innerHTML = '✅ Crop Selected Area';
      cropBtn.style.cssText = `
        padding: 15px 30px;
        background: linear-gradient(135deg, #4a00e0, #9b59b6);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(74, 0, 224, 0.3);
      `;
  
      const useFullBtn = document.createElement('button');
      useFullBtn.innerHTML = '📋 Use Full Image';
      useFullBtn.style.cssText = `
        padding: 15px 30px;
        background: linear-gradient(135deg, #2196F3, #00BCD4);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
      `;
  
      const cancelBtn = document.createElement('button');
      cancelBtn.innerHTML = '❌ Cancel';
      cancelBtn.style.cssText = `
        padding: 15px 30px;
        background: linear-gradient(135deg, #666, #999);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.3s ease;
      `;
  
      // Add hover effects
      [cropBtn, useFullBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'translateY(-2px)';
          btn.style.boxShadow = btn.style.boxShadow.replace('15px', '20px');
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = btn.style.boxShadow.replace('20px', '15px');
        });
      });
  
      controls.appendChild(cropBtn);
      controls.appendChild(useFullBtn);
      controls.appendChild(cancelBtn);
      cropOverlay.appendChild(controls);
  
      document.body.appendChild(cropOverlay);
  
      // Auto-focus for keyboard users
      setTimeout(() => {
        cropBtn.focus();
      }, 300);
  
      // Cropping logic
      let isSelecting = false;
      let startX, startY;
  
      img.addEventListener('mousedown', (e) => {
        isSelecting = true;
        const rect = img.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        
        selection.style.left = startX + 'px';
        selection.style.top = startY + 'px';
        selection.style.width = '0px';
        selection.style.height = '0px';
        selection.style.display = 'block';
        e.preventDefault();
      });
  
      img.addEventListener('mousemove', (e) => {
        if (!isSelecting) return;
        
        const rect = img.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const width = currentX - startX;
        const height = currentY - startY;
        
        selection.style.width = Math.abs(width) + 'px';
        selection.style.height = Math.abs(height) + 'px';
        
        if (width < 0) {
          selection.style.left = currentX + 'px';
        }
        if (height < 0) {
          selection.style.top = currentY + 'px';
        }
        e.preventDefault();
      });
  
      img.addEventListener('mouseup', (e) => {
        isSelecting = false;
        e.preventDefault();
      });
  
      img.addEventListener('mouseleave', () => {
        isSelecting = false;
      });
  
      // Button handlers
      cropBtn.addEventListener('click', () => {
        if (selection.style.display !== 'none') {
          const rect = img.getBoundingClientRect();
          
          const scaleX = img.naturalWidth / rect.width;
          const scaleY = img.naturalHeight / rect.height;
          
          const cropX = (parseInt(selection.style.left) || 0) * scaleX;
          const cropY = (parseInt(selection.style.top) || 0) * scaleY;
          const cropWidth = (parseInt(selection.style.width) || 0) * scaleX;
          const cropHeight = (parseInt(selection.style.height) || 0) * scaleY;
          
          if (cropWidth < 10 || cropHeight < 10) {
            alert('Please select a larger area to crop');
            return;
          }
          
          const croppedCanvas = document.createElement('canvas');
          croppedCanvas.width = cropWidth;
          croppedCanvas.height = cropHeight;
          
          const ctx = croppedCanvas.getContext('2d');
          ctx.drawImage(
            img,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
          );
          
          useScreenshot(croppedCanvas.toDataURL('image/png'));
          document.body.removeChild(cropOverlay);
        } else {
          alert('Please select an area to crop first, or click "Use Full Image"');
        }
      });
  
      useFullBtn.addEventListener('click', () => {
        useScreenshot(imageDataUrl);
        document.body.removeChild(cropOverlay);
      });
  
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(cropOverlay);
      });
  
      // Keyboard shortcuts
      const keyHandler = (e) => {
        if (e.key === 'Escape') {
          document.body.removeChild(cropOverlay);
          document.removeEventListener('keydown', keyHandler);
        } else if (e.key === 'Enter') {
          if (selection.style.display !== 'none') {
            cropBtn.click();
          } else {
            useFullBtn.click();
          }
        }
      };
      document.addEventListener('keydown', keyHandler);
    }
    
  
  }
  
  // Enhanced capture handler
  async function captureScreenHandler() {
    // Request notification permission upfront
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  
    try {
      const screenshotDataUrl = await screenCapture.capture();
      screenCapture.showCropInterface(screenshotDataUrl);
    } catch (error) {
      console.error('Screen capture failed:', error);
      alert(error.message || 'Failed to capture screen');
      screenCapture.resetIndicators();
    }
  }
  
  // Initialize screen capture manager
  const screenCapture = new ScreenCaptureManager();
  
  
  
  // Function to use captured screenshot
  function useScreenshot(screenshotUrl) {
    // Create a new image element to load the image
    const img = new Image();
    img.onload = () => {
      // Update appState with the loaded image
      appState.image.element = img;
      appState.image.naturalWidth = img.naturalWidth;
      appState.image.naturalHeight = img.naturalHeight;
      
      // Calculate initial size and position
      const sceneWidth = appState.scene.width;
      const sceneHeight = appState.scene.height;
      const imgAspectRatio = img.naturalWidth / img.naturalHeight;
      
      let initialWidth, initialHeight;
      const maxWidth = sceneWidth * 0.8;
      const maxHeight = sceneHeight * 0.8;
      
      if (imgAspectRatio > 1) {
        // Landscape
        initialWidth = Math.min(img.naturalWidth, maxWidth);
        initialHeight = initialWidth / imgAspectRatio;
      } else {
        // Portrait
        initialHeight = Math.min(img.naturalHeight, maxHeight);
        initialWidth = initialHeight * imgAspectRatio;
      }
      
      // Position image in center
      appState.image.width = initialWidth;
      appState.image.height = initialHeight;
      appState.image.x = (sceneWidth - initialWidth) / 2;
      appState.image.y = (sceneHeight - initialHeight) / 2;
      
      // Hide upload prompt
      uploadPrompt.style.display = 'none';
      
      // Show remove button
      removeBtn.style.display = 'inline-block';
      
      // Render the scene with the new image
      renderScene();
      
      // Show the UI overlay
    setImageInteractivity(true);
      
      // Capture initial dimensions
      setTimeout(captureInitialDimensions, 100);
    };
    img.src = screenshotUrl;
  }
  
  // Screen capture handler
  async function captureScreenHandler() {
    try {
      const screenshotDataUrl = await screenCapture.capture();
      screenCapture.showCropInterface(screenshotDataUrl);
    } catch (error) {
      console.error('Screen capture failed:', error);
      alert(error.message || 'Failed to capture screen');
    }
  } 
  
  // FIXED Ratio Controls - Now uses initial dimensions
  document.querySelectorAll('.btn[data-ratio]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn[data-ratio]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const ratio = btn.dataset.ratio;
      applyRatio(ratio);
    });
  });
  
  function applyRatio(ratio) {
    // Update appState with the selected ratio
    appState.ui.activeRatio = ratio;
    
    // Get the scene container element
    const sceneElement = document.getElementById('scene');
    if (!sceneElement) return;
    
    // Get the current dimensions of the scene container
    const containerRect = sceneElement.parentElement.getBoundingClientRect();
    let newWidth = containerRect.width * 0.9;
    let newHeight = containerRect.height * 0.9;
    
    // Apply the selected ratio
    switch (ratio) {
      case '4:3':
        newHeight = newWidth * (3/4);
        break;
      case '3:2':
        newHeight = newWidth * (2/3);
        break;
      case '16:9':
        newHeight = newWidth * (9/16);
        break;
      case '1:1':
        newHeight = newWidth;
        break;
      case '3:4':
        newWidth = newHeight * (3/4);
        break;
      default: // auto
        // Keep the current dimensions
        break;
    }
    
    // Boundary checking
    const maxWidth = containerRect.width * 0.9;
    const maxHeight = containerRect.height * 0.9;
    
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = (ratio === '1:1') ? maxWidth : newWidth * (newHeight/newWidth);
    }
    
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = (ratio === '1:1') ? maxHeight : newHeight * (newWidth/newHeight);
    }
    
    // Update appState with new dimensions
    appState.scene.width = newWidth;
    appState.scene.height = newHeight;
    
    // Update canvas dimensions
    masterCanvas.width = newWidth;
    masterCanvas.height = newHeight;
    
    // Update scene element dimensions
    sceneElement.style.width = `${newWidth}px`;
    sceneElement.style.height = `${newHeight}px`;
    
    // Re-render the scene
    renderScene();
  }
  
  // Rest of the code remains the same...
  // [COLOR CONTROLS, BACKGROUND CONTROLS, GRADIENT CONTROLS, EXPORT FUNCTIONS, PRESET FUNCTIONS]
  // ... (no changes needed for these sections)
  
  // Color Controls - FIXED VERSION
  // Dynamic Color Picker Controls - AUTO-APPLY ON CHANGE
  document.addEventListener('DOMContentLoaded', () => {
    const colorPicker = document.getElementById('color-picker');
    const colorValue = document.getElementById('color-value');
    
    if (colorPicker) {
      // Set initial color
      colorPicker.value = '#ffffff';
      if (colorValue) {
        colorValue.textContent = '#ffffff';
      }
      
      // Auto-apply color on change
      colorPicker.addEventListener('input', function() {
        const selectedColor = this.value;
        
        // Update color value display
        if (colorValue) {
          colorValue.textContent = selectedColor;
        }
        
        // Update appState with the selected color
        appState.scene.background.type = 'color';
        appState.scene.background.value = selectedColor;
        
        // Update UI to show this is selected
        document.querySelectorAll('.img-bg-option').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('.gradient-option').forEach(b => b.classList.remove('selected'));
        
        // Render the scene with the new background
        renderScene();
      });
      
      // Also apply on change event (for better browser support)
      colorPicker.addEventListener('change', function() {
        const selectedColor = this.value;
        
        // Update color value display
        if (colorValue) {
          colorValue.textContent = selectedColor;
        }
        
        // Update appState with the selected color
        appState.scene.background.type = 'color';
        appState.scene.background.value = selectedColor;
        
        // Update UI to show this is selected
        document.querySelectorAll('.img-bg-option').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('.gradient-option').forEach(b => b.classList.remove('selected'));
        
        // Render the scene with the new background
        renderScene();
      });
    }
  });
  
  // Image Background Controls - FIXED VERSION
  document.querySelectorAll('.img-bg-option').forEach(el => {
    el.addEventListener('click', async () => {
      document.querySelectorAll('.img-bg-option').forEach(b => b.classList.remove('selected'));
      document.querySelectorAll('.gradient-option').forEach(b => b.classList.remove('selected'));
      el.classList.add('selected');
  
      const bgUrl = el.dataset.bgUrl.trim();
      try {
        // Fetch image as Blob
        const response = await fetch(bgUrl, {mode: 'cors'});
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        // Convert Blob to Data URL
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        // Load image from Data URL
        const img = new window.Image();
        img.onload = function() {
          appState.scene.background.type = 'image';
          appState.scene.background.value = dataUrl;
          appState.scene.background.element = img;
          renderScene();
        };
        img.onerror = function() {
          throw new Error('Image failed to load');
        };
        img.src = dataUrl;
      } catch (error) {
        // Fallback to black background
        appState.scene.background.type = 'color';
        appState.scene.background.value = '#000000';
        appState.scene.background.element = null;
        renderScene();
        alert('Image background failed to load. Fallback to black.');
      }
    });
  });
  
  // Gradient Controls - FIXED VERSION
  document.querySelectorAll('.gradient-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.img-bg-option').forEach(b => b.classList.remove('selected'));
      document.querySelectorAll('.gradient-option').forEach(b => b.classList.remove('selected'));
      
      el.classList.add('selected');
      
      // Update appState with the selected gradient
      appState.scene.background.type = 'gradient';
      appState.scene.background.value = el.dataset.gradient;
      
      // Render the scene with the new background
      renderScene();
    });
  });
  
  function createGradient(type) {
    switch (type) {
      case "purple-blue":
        return "linear-gradient(135deg, #9b59b6, #3498db)";
      case "pink-purple":
        return "linear-gradient(135deg, #e91e63, #9c27b0)";
      case "orange-yellow":
        return "linear-gradient(135deg, #ff9800, #ffeb3b)";
      case "blue-teal":
        return "linear-gradient(135deg, #2196F3, #009688)";
      default:
        return "linear-gradient(135deg, #667eea, #764ba2)";
    }
  }

  const fileNamer = ()=>{
    function randomLetters(len) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let str = '';
        for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return str;
    }
    const filename = `exportImage-${randomLetters(10)}.png`;
    return filename
  }
  
  // // Export Functions
  // async function exportImage() {
  //   const loadingIndicator = document.createElement('div');
  //   loadingIndicator.className = 'loading-indicator';
  //   document.body.appendChild(loadingIndicator);
  
  //   try {
  //     // Always use masterCanvas.toDataURL for PNG export
  //     const dataUrl = masterCanvas.toDataURL('image/png');
  //     // Generate a random 10-letter string (letters only, mixed case)
  //     function randomLetters(len) {
  //       const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  //       let str = '';
  //       for (let i = 0; i < len; i++) {
  //         str += chars.charAt(Math.floor(Math.random() * chars.length));
  //       }
  //       return str;
  //     }
  //     const filename = `beausnap-${randomLetters(10)}.png`;
  //     const link = document.createElement('a');
  //     link.download = filename;
  //     link.href = dataUrl;
  //     link.click();
  //   } catch (error) {
  //     console.error('Export failed:', error);
  //     alert('Could not export image. Please try a different background.');
  //   } finally {
  //     document.body.removeChild(loadingIndicator);
  //   }
  // }
  
  
  // --- Modified exportImage to accept parameters ---
  async function exportImage(format = 'png', quality = 1.0, scale = 1) {
      const loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'loading-indicator';
      document.body.appendChild(loadingIndicator);
  
      try {
          // --- Handle Scaling ---
          let finalDataUrl;
          if (scale === 1) {
              // If scale is 1, use the existing master canvas directly
              finalDataUrl = masterCanvas.toDataURL(`image/${format}`, quality);
          } else {
              // If scale is not 1, create a temporary canvas to scale the image
              const scaledCanvas = document.createElement('canvas');
              const scaledCtx = scaledCanvas.getContext('2d');
              scaledCanvas.width = masterCanvas.width * scale;
              scaledCanvas.height = masterCanvas.height * scale;
  
              // Scale the context
              scaledCtx.scale(scale, scale);
  
              // Draw the master canvas onto the scaled canvas
              scaledCtx.drawImage(masterCanvas, 0, 0);
  
              // Get data URL from the scaled canvas
              finalDataUrl = scaledCanvas.toDataURL(`image/${format}`, quality);
          }
  
          // Create download link using the final Data URL
          const link = document.createElement('a');
          let filename = `${fileNamer()}.${format}`
          link.download = filename || `beausnap-${Date.now()}.${format}`; // Use format in filename
          link.href = finalDataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
  
          alert(`✅ Image exported as ${format.toUpperCase()} successfully!`);
  
      } catch (error) {
          console.error('Export failed:', error);
          alert('Could not export image. Please try a different background or settings.');
      } finally {
          document.body.removeChild(loadingIndicator);
      }
  }
  
  // --- Modified copyToClipboard to potentially accept parameters (though often copy is PNG) ---
  function copyToClipboard(format = 'png', quality = 1.0, scale = 1) {
      // Check if an image is loaded
      if (!appState.image.element) {
          alert('Please upload an image first!');
          return;
      }
  
      // --- Handle Scaling for Copy ---
      let canvasToCopy = masterCanvas; // Default to master canvas
      if (scale !== 1) {
          // If scale is needed, create a temporary canvas
          const scaledCanvas = document.createElement('canvas');
          const scaledCtx = scaledCanvas.getContext('2d');
          scaledCanvas.width = masterCanvas.width * scale;
          scaledCanvas.height = masterCanvas.height * scale;
          scaledCtx.scale(scale, scale);
          scaledCtx.drawImage(masterCanvas, 0, 0);
          canvasToCopy = scaledCanvas; // Use the scaled canvas for copying
      }
  
      // Convert the correct canvas (original or scaled) to blob
      canvasToCopy.toBlob(function(blob) {
          if (navigator.clipboard && window.ClipboardItem) {
              // Use Clipboard API if available
              const item = new ClipboardItem({ [`image/${format}`]: blob });
              navigator.clipboard.write([item]).then(function() {
                  alert('✅ Image copied to clipboard!');
              }).catch(function(err) {
                  console.error('Clipboard copy failed:', err);
                  fallbackCopy(format, quality, canvasToCopy); // Pass format/quality/canvas if fallback needs it differently
              });
          } else {
              // Fallback if Clipboard API is not supported
              fallbackCopy(format, quality, canvasToCopy);
          }
      }, `image/${format}`, quality); // Pass format and quality to toBlob
  }
  
  // --- Modified fallbackCopy to accept parameters ---
  function fallbackCopy(format = 'png', quality = 1.0, sourceCanvas = masterCanvas) {
      // Fallback: create a temporary link for download using the provided canvas
      const link = document.createElement('a');
      link.download = `screenshot-${Date.now()}.${format}`;
      // Use the provided canvas for the data URL
      link.href = sourceCanvas.toDataURL(`image/${format}`, quality);
      alert('📋 Clipboard not supported. Image will be downloaded instead.');
      link.click();
  }
  
  
  
  
  
  // Helper function to preload all images
  async function preloadAllImages() {
      const images = [...document.querySelectorAll('img')];
      const backgroundImages = [...document.querySelectorAll('[data-bg-url]')]
          .map(el => el.dataset.bgUrl);
      
      const allImages = [...images, ...backgroundImages];
      
      return Promise.all(allImages.map(async (img) => {
          const url = typeof img === 'string' ? img : img.src;
          return new Promise((resolve, reject) => {
              const image = new Image();
              image.crossOrigin = "anonymous";
              image.onload = () => resolve(image);
              image.onerror = () => reject(new Error(`Failed to load: ${url}`));
              image.src = getProxiedImageUrl(url);
          });
      }));
  }
  
  function copyToClipboard() {
    // Check if an image is loaded
    if (!appState.image.element) {
      alert('Please upload an image first!');
      return;
    }
  
    // Convert canvas to blob
    masterCanvas.toBlob(function(blob) {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(function() {
          alert('✅ Image copied to clipboard!');
        }).catch(function(err) {
          console.error('Clipboard copy failed:', err);
          fallbackCopy();
        });
      } else {
        fallbackCopy();
      }
    });
  }
  
  function fallbackCopy() {
    // Fallback: create a temporary link for download
    const link = document.createElement('a');
    link.download = `screenshot-${Date.now()}.png`;
    link.href = masterCanvas.toDataURL('image/png', 1.0);
    alert('Clipboard not supported. Image will be downloaded instead.');
    link.click();
  }
  
  // Preset Functions
  // Preset Functions - UPDATED FOR DYNAMIC COLOR PICKER
  function savePreset() {
    const name = document.querySelector('.preset-name').value.trim();
    if (!name) {
      alert('Please enter a preset name!');
      return;
    }
  
    // Create a copy of the current appState to save as a preset
    // We don't want to save the image element or natural dimensions
    const presetData = {
      scene: {
        width: appState.scene.width,
        height: appState.scene.height,
        background: {
          type: appState.scene.background.type,
          value: appState.scene.background.value
          // Note: We don't save the background element as it's loaded dynamically
        }
      },
      ui: {
        activeRatio: appState.ui.activeRatio,
        selectedBackgroundType: appState.ui.selectedBackgroundType,
        selectedEffect: appState.ui.selectedEffect
      },
      effects: JSON.parse(JSON.stringify(appState.effects)), // Deep copy of effects
      timestamp: Date.now()
    };
  
    try {
      const savedPresets = JSON.parse(localStorage.getItem('screenshot-presets') || '{}');
      savedPresets[name] = presetData;
      localStorage.setItem('screenshot-presets', JSON.stringify(savedPresets));
      alert(`✅ Preset "${name}" saved successfully!`);
    } catch (error) {
      console.error('Failed to save preset:', error);
      alert('Failed to save preset. Please try again.');
    }
  }
  
  function loadPreset() {
    const name = document.querySelector('.preset-name').value.trim();
    if (!name) {
      alert('Please enter a preset name to load!');
      return;
    }
  
    try {
      const savedPresets = JSON.parse(localStorage.getItem('screenshot-presets') || '{}');
      const preset = savedPresets[name];
      
      if (!preset) {
        alert(`Preset "${name}" not found!`);
        return;
      }
  
      // Apply preset data to appState
      if (preset.scene) {
        // Update scene dimensions
        appState.scene.width = preset.scene.width;
        appState.scene.height = preset.scene.height;
        
        // Update background
        appState.scene.background.type = preset.scene.background.type;
        appState.scene.background.value = preset.scene.background.value;
        // Reset the background element so it loads again if needed
        appState.scene.background.element = null;
      }
      
      if (preset.ui) {
        // Update UI state
        appState.ui.activeRatio = preset.ui.activeRatio;
        appState.ui.selectedBackgroundType = preset.ui.selectedBackgroundType;
        appState.ui.selectedEffect = preset.ui.selectedEffect;
      }
      
      if (preset.effects) {
        // Update effects
        Object.keys(preset.effects).forEach(effectKey => {
          if (appState.effects[effectKey]) {
            Object.assign(appState.effects[effectKey], preset.effects[effectKey]);
          }
        });
      }
  
      // Update UI elements to reflect loaded state
      // Update ratio buttons
      document.querySelectorAll('.btn[data-ratio]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.ratio === appState.ui.activeRatio) {
          btn.classList.add('active');
        }
      });
      
      // Update background selection
      document.querySelectorAll('.img-bg-option, .gradient-option').forEach(el => {
        el.classList.remove('selected');
      });
      
      // Update color picker
      const colorPicker = document.getElementById('color-picker');
      const colorValue = document.getElementById('color-value');
      if (colorPicker && appState.scene.background.type === 'color') {
        colorPicker.value = appState.scene.background.value;
        if (colorValue) {
          colorValue.textContent = appState.scene.background.value;
        }
      }
      
      // Update canvas dimensions
      masterCanvas.width = appState.scene.width;
      masterCanvas.height = appState.scene.height;
      
      // Update scene element dimensions
      const sceneElement = document.getElementById('scene');
      if (sceneElement) {
        sceneElement.style.width = `${appState.scene.width}px`;
        sceneElement.style.height = `${appState.scene.height}px`;
      }
      
      // Re-render the scene
      renderScene();
  
      alert(`✅ Preset "${name}" loaded successfully!`);
    } catch (error) {
      console.error('Failed to load preset:', error);
      alert('Failed to load preset. Please try again.');
    }
  }
  
  // Helper function to convert rgb to hex
  function rgbToHex(rgb) {
    if (!rgb.startsWith('rgb')) return rgb;
  
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues || rgbValues.length < 3) return rgb;
  
    const r = parseInt(rgbValues[0]).toString(16).padStart(2, '0');
    const g = parseInt(rgbValues[1]).toString(16).padStart(2, '0');
    const b = parseInt(rgbValues[2]).toString(16).padStart(2, '0');
  
    return `#${r}${g}${b}`;
  }
  
  // Helper function to convert hex to rgba
  function hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // Helper function to convert rgba/rgb to { hex, alpha }
  function rgbaToHexAlpha(color) {
    if (!color || typeof color !== 'string') {
      return { hex: '#000000', alpha: 1 };
    }
    const rgbaMatch = color.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/i);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(rgbaMatch[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(rgbaMatch[3], 10).toString(16).padStart(2, '0');
      const a = parseFloat(rgbaMatch[4]);
      return { hex: `#${r}${g}${b}`, alpha: isNaN(a) ? 1 : a };
    }
    const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
      return { hex: `#${r}${g}${b}`, alpha: 1 };
    }
    if (color.startsWith('#')) {
      // Already hex; no alpha info available
      // Normalize short hex (#abc) to full form if needed
      if (color.length === 4) {
        const r = color[1];
        const g = color[2];
        const b = color[3];
        return { hex: `#${r}${r}${g}${g}${b}${b}`, alpha: 1 };
      }
      return { hex: color, alpha: 1 };
    }
    // Fallback
    return { hex: '#000000', alpha: 1 };
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'c':
          e.preventDefault();
          copyToClipboard();
          break;
        case 's':
          e.preventDefault();
          exportImage();
          break;
        case 'o':
          e.preventDefault();
          triggerFileUpload();
          break;
      }
    }
    
    // Delete key to remove image
    if (e.key === 'Delete' && appState.image.element) {
      removeImage();
    }
  });
    
  // Error handling for missing html2canvas
  if (typeof html2canvas === 'undefined') {
    console.error('html2canvas library not loaded!');
    document.querySelectorAll('.export-btn, .copy-btn').forEach(btn => {
      btn.disabled = true;
      btn.textContent = 'Library Error';
    });
  }
  