document.addEventListener('DOMContentLoaded', function () {
    // --- Modal Elements ---
    const presetsModalBtn = document.getElementById('presets-modal-btn');
    const exportModalBtn = document.getElementById('export-modal-btn');
    const presetsModal = document.getElementById('presets-modal');
    const exportModal = document.getElementById('export-modal');

    // --- Open Modals ---
    presetsModalBtn.addEventListener('click', function() {
        openModal(presetsModal);
        populateSavedPresetsModal(); // Refresh list when opening
        // Sync preset name input with footer/current state if needed
        const footerNameInput = document.querySelector('.preset-name'); // Adjust selector if needed
        const modalNameInput = document.getElementById('modal-preset-name');
        if (footerNameInput && modalNameInput) {
            modalNameInput.value = footerNameInput.value;
        }
    });

    exportModalBtn.addEventListener('click', function() {
        openModal(exportModal);
        // Optionally, sync export settings from appState if they can change elsewhere
    });


    // --- Close Modals ---
    // Close by clicking the 'X' button or the overlay
    document.querySelectorAll('[data-modal-close]').forEach(button => {
        button.addEventListener('click', function() {
            // Find the parent modal and close it
            const modal = this.closest('.app-modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Close by pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close the topmost open modal
            const openModals = document.querySelectorAll('.app-modal.show');
            if (openModals.length > 0) {
                // Close the last one opened (assuming it's on top)
                closeModal(openModals[openModals.length - 1]);
            }
        }
    });

    // --- Modal Open/Close Functions ---
    function openModal(modalElement) {
        if (!modalElement) return;
        modalElement.classList.add('show');
        modalElement.setAttribute('aria-hidden', 'false');
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
        // Focus first focusable element inside the modal (optional but good for accessibility)
        const firstFocusable = modalElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    function closeModal(modalElement) {
        if (!modalElement) return;
        modalElement.classList.remove('show');
        modalElement.setAttribute('aria-hidden', 'true');
        // Re-enable background scrolling
        document.body.style.overflow = '';
        // Return focus to the button that opened the modal (optional)
        const openerBtn = document.querySelector(`[aria-controls="${modalElement.id}"]`);
        if (openerBtn) {
           openerBtn.focus();
        }
    }


    // --- Preset Management (Modal Specific) ---
    const savePresetBtn = document.getElementById('save-preset-modal-btn');
    const modalPresetNameInput = document.getElementById('modal-preset-name');

    savePresetBtn.addEventListener('click', function() {
        const originalNameInput = document.querySelector('.preset-name'); // Footer input
        if (originalNameInput && modalPresetNameInput) {
            const originalValue = originalNameInput.value;
            originalNameInput.value = modalPresetNameInput.value.trim();
            savePreset(); // Call your existing save function
            originalNameInput.value = originalValue;
            populateSavedPresetsModal(); // Refresh the list
        }
    });

    // Event delegation for Load/Delete buttons inside the modal
    document.getElementById('modal-saved-presets-list').addEventListener('click', function(e) {
        const presetItem = e.target.closest('.preset-item');
        if (!presetItem) return; // Clicked outside an item

        const presetName = presetItem.querySelector('.preset-name')?.textContent;
        if (!presetName) return;

        if (e.target.closest('.preset-load-btn')) {
             loadPresetFromModal(presetName);
        } else if (e.target.closest('.preset-delete-btn')) {
             deletePresetFromModal(presetName);
        }
    });

    function loadPresetFromModal(presetName) {
        const originalNameInput = document.querySelector('.preset-name');
        if (originalNameInput) {
            const originalValue = originalNameInput.value;
            originalNameInput.value = presetName;
            loadPreset(); // Call your existing load function
            originalNameInput.value = originalValue;
            closeModal(presetsModal); // Close modal after loading
        }
    }

    function deletePresetFromModal(presetName) {
        const originalNameInput = document.querySelector('.preset-name');
        if (originalNameInput) {
            const originalValue = originalNameInput.value;
            originalNameInput.value = presetName;
            deletePreset(); // Call your existing delete function
            originalNameInput.value = originalValue;
            populateSavedPresetsModal(); // Refresh the list
        }
    }

    // --- Populate Saved Presets List in Modal ---
    function populateSavedPresetsModal() {
        const listContainer = document.getElementById('modal-saved-presets-list');
        const noPresetsMsg = document.getElementById('modal-no-presets-message');
        listContainer.innerHTML = ''; // Clear existing list

        try {
            const savedPresets = JSON.parse(localStorage.getItem('screenshot-presets') || '{}');
            const presetNames = Object.keys(savedPresets);

            if (presetNames.length === 0) {
                noPresetsMsg.style.display = 'block';
                return;
            }

            noPresetsMsg.style.display = 'none';

            presetNames.forEach(name => {
                const presetItem = document.createElement('div');
                presetItem.className = 'preset-item';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'preset-name';
                nameSpan.textContent = name;

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'preset-item-actions';

                const loadBtn = document.createElement('button');
                loadBtn.className = 'preset-load-btn preset-modal-btn'; // Added class for potential styling
                loadBtn.textContent = 'Load';
                loadBtn.setAttribute('data-preset-name', name); // Store name in data attribute

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'preset-delete-btn preset-modal-btn';
                deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                deleteBtn.setAttribute('data-preset-name', name);

                actionsDiv.appendChild(loadBtn);
                actionsDiv.appendChild(deleteBtn);

                presetItem.appendChild(nameSpan);
                presetItem.appendChild(actionsDiv);
                listContainer.appendChild(presetItem);
            });
        } catch (error) {
            console.error("Error loading presets for modal:", error);
            listContainer.innerHTML = '<p style="color: red;">Error loading presets.</p>';
            noPresetsMsg.style.display = 'none';
        }
    }
});
