const impositionLayout = [
    { pageNum: 7, isRotated: true }, { pageNum: 6, isRotated: true },
    { pageNum: 5, isRotated: true }, { pageNum: 4, isRotated: true },
    { pageNum: 8, isRotated: false, label: "8 (Back Cover)" }, { pageNum: 1, isRotated: false, label: "1 (Front Cover)" },
    { pageNum: 2, isRotated: false }, { pageNum: 3, isRotated: false }
];

const COVER_BG_COLORS = {
    'none': { rgba: 'transparent', rgb: null },
    'black': { rgba: 'rgba(0,0,0,0.8)', rgb: [0, 0, 0] },
    'white': { rgba: 'rgba(255,255,255,0.8)', rgb: [255, 255, 255] },
    'red': { rgba: 'rgba(255,0,0,0.8)', rgb: [255, 0, 0] },
    'blue': { rgba: 'rgba(0,0,255,0.8)', rgb: [0, 0, 255] },
    'green': { rgba: 'rgba(0,128,0,0.8)', rgb: [0, 128, 0] },
    'orange': { rgba: 'rgba(255,165,0,0.8)', rgb: [255, 165, 0] },
    'purple': { rgba: 'rgba(128,0,128,0.8)', rgb: [128, 0, 128] },
    'violet': { rgba: 'rgba(238,130,238,0.8)', rgb: [238, 130, 238] }
};

const zineState = {
    config: {
        paperFormat: "A4", // "A4" | "LETTER"
        globalMonochrome: false,
        qrCode: {
            url: "",
            enabled: false,
            alignH: "center",
            alignV: "bottom",
            size: 20
        }
    },
    1: { 
        isCover: true, 
        text: "MÓJ ZIN", 
        subtitle: "Podtytuł albumu", 
        theme: "dark-gray", 
        fontSize: 32, 
        fontFamily: "sans-serif",
        imgObject: null,
        imgSrc: null,
        cropPercent: 50,
        cropMode: 'X',
        photoSize: 100,
        alignH: "center",
        alignV: "bottom",
        textColor: "white",
        textBgColor: "black"
    }
};

for(let i=2; i<=8; i++) {
    zineState[i] = { 
        isCover: false, 
        imgObject: null, 
        imgSrc: null, 
        cropPercent: 50, 
        cropMode: 'X',
        photoSize: 100,
        caption: "",
        captionAlignH: "center"
    };
}

let draggedPageNum = null;

// INICJALIZACJA DOPIERO PO ZAŁADOWANIU DRZEWA DOM
document.addEventListener("DOMContentLoaded", () => {
    // Hidden single file input for cell clicks
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'file';
    hiddenInput.id = 'single-upload';
    hiddenInput.style.display = 'none';
    hiddenInput.accept = 'image/*';
    hiddenInput.onchange = (e) => {
        if (window.targetPageForUpload) {
            handleSingleFile(window.targetPageForUpload, e.target);
            e.target.value = ''; // Reset input
        }
    };
    document.body.appendChild(hiddenInput);

    renderEditors();

    // OBSŁUGA PRZYCISKU POBIERANIA PDF
    document.getElementById('download-btn').addEventListener('click', generatePDF);

    // PIERWSZE WYGENEROWANIE PODGLĄDU SIATKI
    updatePreview();
});

function toggleInstructionPopup() {
    const popup = document.getElementById('instruction-popup');
    popup.style.display = popup.style.display === 'flex' ? 'none' : 'flex';
}


function handleSingleFile(pageNum, input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            zineState[pageNum].imgObject = img;
            zineState[pageNum].imgSrc = e.target.result;
            zineState[pageNum].cropPercent = 50;
            zineState[pageNum].photoSize = 100;

            const imgRatio = img.width / img.height;
            const isA4 = zineState.config.paperFormat === 'A4';
            
            // For Page 1 (Cover), the preview cell has the same physical ratio as others
            // but the crop logic needs to be consistent.
            let targetRatio = isA4 ? (74.25 / 105) : (2.75 / 4.25);

            zineState[pageNum].cropMode = imgRatio > targetRatio ? 'X' : 'Y';
            
            renderEditors();
            updatePreview();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function renderEditors() {
    const editorsContainer = document.getElementById('editors-container');
    if (!editorsContainer) return;
    editorsContainer.innerHTML = '';

    // 1. FORMAT PAPIERU
    const formatSection = createSection('Format Papieru');
    formatSection.innerHTML += `
        <div class="flat-btn-group">
            <button class="flat-btn ${zineState.config.paperFormat === 'A4' ? 'active' : ''}" onclick="handleFormatChange('A4')">A4</button>
            <button class="flat-btn ${zineState.config.paperFormat === 'LETTER' ? 'active' : ''}" onclick="handleFormatChange('LETTER')">US Letter</button>
        </div>`;
    editorsContainer.appendChild(formatSection);

    // 2. ZDJĘCIA (BULK UPLOAD)
    const photosSection = createSection('Zdjęcia');
    photosSection.innerHTML += `
        <button class="upload-btn-main" onclick="document.getElementById('bulk-upload').click()">Wgraj wszystkie zdjęcia (1-8)</button>
        <input type="file" id="bulk-upload" multiple accept="image/*" style="display:none" onchange="handleBulkFile(this)">
        <div class="control-row" style="margin-top:12px">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:#000">
                <input type="checkbox" ${zineState.config.globalMonochrome ? 'checked' : ''} onchange="handleMonochrome(this.checked)">
                Wersja monochromatyczna (Filtr)
            </label>
        </div>`;
    editorsContainer.appendChild(photosSection);

    // 3. TEKST OKŁADKI
    const coverSection = createSection('Tekst Okładki (Str. 1)');
    coverSection.innerHTML += `
        <div class="control-row">
            <label>Tytuł</label>
            <textarea rows="2" oninput="handleCoverText(this.value)">${zineState[1].text || ""}</textarea>
        </div>
        <div class="control-row">
            <label>Podtytuł</label>
            <textarea rows="2" oninput="handleCoverSubtitle(this.value)">${zineState[1].subtitle || ""}</textarea>
        </div>
        <div class="control-row">
            <label>Krój Pisma</label>
            <select class="custom-select" onchange="handleCoverFont(this.value)">
                <option value="sans-serif" ${zineState[1].fontFamily === 'sans-serif' ? 'selected' : ''}>Sans-Serif</option>
                <option value="serif" ${zineState[1].fontFamily === 'serif' ? 'selected' : ''}>Serif</option>
                <option value="monospace" ${zineState[1].fontFamily === 'monospace' ? 'selected' : ''}>Monospace</option>
            </select>
        </div>
        <div class="control-row">
            <label>Rozmiar: <span id="cover-size-val">${zineState[1].fontSize || 32} pt</span></label>
            <input type="range" min="18" max="62" value="${zineState[1].fontSize || 32}" oninput="handleCoverSize(this.value)">
        </div>
        <div class="control-row">
            <label>Wyrównanie Bloku</label>
            <div style="display:flex; gap:16px">
                <div class="align-grid">
                    ${['left', 'center', 'right'].map(h => `
                        <button class="align-btn ${zineState[1].alignH === h ? 'active' : ''}" onclick="handleCoverAlign('H', '${h}')">
                            <img src="icons/align_${h}.svg" alt="${h}">
                        </button>
                    `).join('')}
                </div>
                <div class="align-grid">
                    ${['top', 'center', 'bottom'].map(v => `
                        <button class="align-btn ${zineState[1].alignV === v ? 'active' : ''}" onclick="handleCoverAlign('V', '${v}')">
                            <img src="icons/valign_${v}.svg" alt="${v}">
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="control-row">
            <label>Kolory (Tekst / Tło)</label>
            <div style="display:flex; gap:20px">
                <div class="color-swatch-group">
                    <div class="color-swatch black ${zineState[1].textColor === 'black' ? 'active' : ''}" onclick="handleCoverColor('text', 'black')"></div>
                    <div class="color-swatch white ${zineState[1].textColor === 'white' ? 'active' : ''}" onclick="handleCoverColor('text', 'white')"></div>
                </div>
                <div class="color-swatch-group">
                    ${['none', 'black', 'white', 'red', 'blue', 'green', 'orange', 'purple', 'violet'].map(bg => `
                        <div class="color-swatch ${bg} ${zineState[1].textBgColor === bg ? 'active' : ''}" onclick="handleCoverColor('bg', '${bg}')"></div>
                    `).join('')}
                </div>
            </div>
        </div>`;
    editorsContainer.appendChild(coverSection);

    // 4. KOD QR (STRONA 8)
    const qrSection = createSection('Kod QR (Str. 8)');
    qrSection.innerHTML += `
        <div class="control-row">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer">
                <input type="checkbox" ${zineState.config.qrCode.enabled ? 'checked' : ''} onchange="handleQR('enabled', this.checked)">
                Pokaż kod QR
            </label>
        </div>
        <div class="control-row">
            <label>Adres WWW</label>
            <input type="text" value="${zineState.config.qrCode.url}" placeholder="https://..." oninput="handleQR('url', this.value)">
        </div>
        <div class="control-row">
            <label>Wielkość QR</label>
            <select class="custom-select" onchange="handleQR('size', parseInt(this.value))">
                <option value="20" ${zineState.config.qrCode.size === 20 ? 'selected' : ''}>20 mm</option>
                <option value="27" ${zineState.config.qrCode.size === 27 ? 'selected' : ''}>27 mm</option>
                <option value="35" ${zineState.config.qrCode.size === 35 ? 'selected' : ''}>35 mm</option>
                <option value="40" ${zineState.config.qrCode.size === 40 ? 'selected' : ''}>40 mm</option>
            </select>
        </div>
        <div class="control-row">
            <label>Pozycja QR</label>
            <div style="display:flex; gap:16px">
                <div class="align-grid">
                    ${['left', 'center', 'right'].map(h => `
                        <button class="align-btn ${zineState.config.qrCode.alignH === h ? 'active' : ''}" onclick="handleQR('alignH', '${h}')">
                            <img src="icons/align_${h}.svg" alt="${h}">
                        </button>
                    `).join('')}
                </div>
                <div class="align-grid">
                    ${['top', 'center', 'bottom'].map(v => `
                        <button class="align-btn ${zineState.config.qrCode.alignV === v ? 'active' : ''}" onclick="handleQR('alignV', '${v}')">
                            <img src="icons/valign_${v}.svg" alt="${v}">
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>`;
    editorsContainer.appendChild(qrSection);

    // 5. EDYCJA ZDJĘĆ (INDYWIDUALNA)
    const photoEditorSection = createSection('Edycja Zdjęć (1-8)');
    const currentPageForPhoto = window.currentPageForPhoto || 1;
    const pageData = zineState[currentPageForPhoto];
    
    photoEditorSection.innerHTML += `
        <div class="control-row">
            <label>Wybierz stronę</label>
            <select class="custom-select" onchange="window.currentPageForPhoto = parseInt(this.value); renderEditors()">
                ${[1,2,3,4,5,6,7,8].map(p => `<option value="${p}" ${currentPageForPhoto === p ? 'selected' : ''}>Strona ${p}${p === 1 ? ' (Okładka)' : ''}</option>`).join('')}
            </select>
        </div>
        <div class="control-row">
            <label>Wielkość zdjęcia: <span id="size-val-${currentPageForPhoto}">${pageData.photoSize || 100}%</span></label>
            <input type="range" min="40" max="100" value="${pageData.photoSize || 100}" oninput="handleSizeChange(${currentPageForPhoto}, this.value)">
        </div>
        <div class="control-row">
            <label>Kadrowanie / Pozycja: <span id="val-${currentPageForPhoto}">${getCropLabel(pageData.cropPercent || 50, pageData.cropMode)}</span></label>
            <input type="range" min="0" max="100" value="${pageData.cropPercent || 50}" oninput="handleCropChange(${currentPageForPhoto}, this.value)">
        </div>`;
    editorsContainer.appendChild(photoEditorSection);

    // 6. PODPISY (CAPTIONS)
    const captionSection = createSection('Podpisy (Captions)');
    const currentCaptionPage = window.currentCaptionPage || 2;
    captionSection.innerHTML += `
        <div class="control-row">
            <label>Wybierz stronę</label>
            <select class="custom-select" onchange="window.currentCaptionPage = parseInt(this.value); renderEditors()">
                ${[2,3,4,5,6,7,8].map(p => `<option value="${p}" ${currentCaptionPage === p ? 'selected' : ''}>Strona ${p}</option>`).join('')}
            </select>
        </div>
        <div class="control-row">
            <label>Tekst podpisu (8-10 pt)</label>
            <textarea rows="2" oninput="handleCaption(${currentCaptionPage}, this.value)">${zineState[currentCaptionPage].caption || ""}</textarea>
        </div>
        <div class="control-row">
            <label>Wyrównanie</label>
            <div class="align-grid">
                ${['left', 'center', 'right'].map(h => `
                    <button class="align-btn ${zineState[currentCaptionPage].captionAlignH === h ? 'active' : ''}" onclick="handleCaptionAlign(${currentCaptionPage}, '${h}')">
                        <img src="icons/align_${h}.svg" alt="${h}">
                    </button>
                `).join('')}
            </div>
        </div>`;
    editorsContainer.appendChild(captionSection);
}

function createSection(title) {
    const sec = document.createElement('div');
    sec.className = 'sidebar-section';
    sec.innerHTML = `<h3>${title}</h3>`;
    return sec;
}

function handleMonochrome(val) {
    zineState.config.globalMonochrome = val;
    updatePreview();
}

function handleCoverAlign(dir, val) {
    if (dir === 'H') zineState[1].alignH = val;
    else zineState[1].alignV = val;
    renderEditors();
    updatePreview();
}

function handleCoverColor(type, val) {
    if (type === 'text') zineState[1].textColor = val;
    else zineState[1].textBgColor = val;
    renderEditors();
    updatePreview();
}

function handleQR(prop, val) {
    zineState.config.qrCode[prop] = val;
    if (prop !== 'url') renderEditors();
    updatePreview();
}

function handleCaption(pageNum, val) {
    zineState[pageNum].caption = val;
    updatePreview();
}

function handleCaptionAlign(pageNum, val) {
    zineState[pageNum].captionAlignH = val;
    renderEditors();
    updatePreview();
}

function handleBulkFile(input) {
    const files = Array.from(input.files).slice(0, 8);
    if (files.length === 0) return;

    let loadedCount = 0;
    files.forEach((file, index) => {
        const pageNum = index + 1;
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                zineState[pageNum].imgObject = img;
                zineState[pageNum].imgSrc = e.target.result;
                zineState[pageNum].cropPercent = 50;
                zineState[pageNum].photoSize = 100;

                const imgRatio = img.width / img.height;
                const isA4 = zineState.config.paperFormat === 'A4';
                
                // For Page 1 (Cover), the layout is now full-page overlay
                let targetRatio = isA4 ? (74.25 / 105) : (2.75 / 4.25);

                zineState[pageNum].cropMode = imgRatio > targetRatio ? 'X' : 'Y';
                
                loadedCount++;
                if (loadedCount === files.length) {
                    renderEditors();
                    updatePreview();
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(pageNum) {
    zineState[pageNum].imgObject = null;
    zineState[pageNum].imgSrc = null;
    renderEditors();
    updatePreview();
}

function handleFormatChange(val) {
    zineState.config.paperFormat = val;
    const grid = document.getElementById('preview-grid');
    if (grid) {
        grid.style.aspectRatio = val === 'A4' ? '1.4142' : '1.2941';
        // Removed grid.style.width adjustment to keep layout uniform
    }
    
    // Update format info in header
    const headerTitle = document.querySelector('.sidebar-header h1 span');
    if (headerTitle) headerTitle.innerText = `// ${val}`;
    const workspaceHeaderTitle = document.querySelector('.workspace-header h2');
    if (workspaceHeaderTitle) workspaceHeaderTitle.innerText = `Makieta impozycji (${val})`;
    
    renderEditors();
    updatePreview();
}

function getCropLabel(value, mode) {
    if(value == 50) return 'Środek';
    else if(value < 50) return mode === 'X' ? 'W lewo' : 'W górę';
    else return mode === 'X' ? 'W prawo' : 'W dół';
}

function handleCoverText(val) { zineState[1].text = val; updatePreview(); }
function handleCoverSubtitle(val) { zineState[1].subtitle = val; updatePreview(); }
function handleCoverTheme(val) { zineState[1].theme = val; updatePreview(); }
function handleCoverFont(val) { zineState[1].fontFamily = val; updatePreview(); }
function handleCoverSize(val) {
    zineState[1].fontSize = parseInt(val);
    const ptSize = parseInt(val);
    const indicator = document.getElementById('cover-size-val');
    if (indicator) indicator.innerText = ptSize + ' pt';
    updatePreview();
}

function handleSingleFile(pageNum, input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            zineState[pageNum].imgObject = img;
            zineState[pageNum].imgSrc = e.target.result;
            zineState[pageNum].cropPercent = 50;
            zineState[pageNum].photoSize = 100;

            const imgRatio = img.width / img.height;
            const isA4 = zineState.config.paperFormat === 'A4';
            
            // Standard ratio for all pages (full cell)
            let targetRatio = isA4 ? (74.25 / 105) : (2.75 / 4.25);

            zineState[pageNum].cropMode = imgRatio > targetRatio ? 'X' : 'Y';
            
            renderEditors();
            updatePreview();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleCropChange(pageNum, value) {
    zineState[pageNum].cropPercent = parseInt(value);
    const label = document.getElementById(`val-${pageNum}`);
    if (label) label.innerText = getCropLabel(value, zineState[pageNum].cropMode);
    updatePreview();
}

function handleSizeChange(pageNum, value) {
    zineState[pageNum].photoSize = parseInt(value);
    const label = document.getElementById(`size-val-${pageNum}`);
    if (label) label.innerText = value + '%';
    updatePreview();
}

function updatePreview() {
    const previewGrid = document.getElementById('preview-grid');
    if (!previewGrid) return; 
    previewGrid.innerHTML = '';

    impositionLayout.forEach(cell => {
        const cellDiv = document.createElement('div');
        const pageNum = cell.pageNum;
        const pageData = zineState[pageNum];
        
        cellDiv.draggable = true;
        cellDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) return;
            window.targetPageForUpload = pageNum;
            document.getElementById('single-upload').click();
        });

        cellDiv.addEventListener('dragstart', (e) => {
            draggedPageNum = pageNum;
            cellDiv.classList.add('dragging');
            e.dataTransfer.effectAllowed = "move";
        });

        cellDiv.addEventListener('dragend', () => {
            cellDiv.classList.remove('dragging');
            document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('drag-over'));
        });

        cellDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        });

        cellDiv.addEventListener('dragenter', (e) => {
            e.preventDefault();
            cellDiv.classList.add('drag-over');
        });

        cellDiv.addEventListener('dragleave', () => {
            cellDiv.classList.remove('drag-over');
        });

        cellDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            cellDiv.classList.remove('drag-over');
            if (draggedPageNum && draggedPageNum !== pageNum) {
                swapPages(draggedPageNum, pageNum);
            }
        });

        const label = cell.label ? cell.label : `Str. ${pageNum}`;
        const isCoverIdx = pageData.isCover;
        cellDiv.innerHTML = `<span class="badge" style="${isCoverIdx ? 'background:rgba(0,0,0,0.7);color:#fff;border:1px solid rgba(255,255,255,0.2);' : ''}">${label}</span>`;

        if (pageData.imgSrc) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerText = '×';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeImage(pageNum);
            };
            cellDiv.appendChild(removeBtn);
        }

        if (pageData.isCover) {
            cellDiv.className = `grid-cell cover-cell ${cell.isRotated ? 'upside-down' : ''}`;
            cellDiv.style.backgroundColor = '#fff';
            cellDiv.style.display = 'flex';
            cellDiv.style.alignItems = 'center';
            cellDiv.style.justifyContent = 'center';
            
            // Image covers full cell
            if (pageData.imgSrc) {
                const imgEl = document.createElement('img');
                imgEl.src = pageData.imgSrc;
                if (zineState.config.globalMonochrome) imgEl.classList.add('monochrome');
                
                const scale = (pageData.photoSize || 100) / 100;
                imgEl.style.width = `${scale * 100}%`;
                imgEl.style.height = `${scale * 100}%`;
                imgEl.style.objectFit = 'cover';

                const finalPct = cell.isRotated ? (100 - pageData.cropPercent) : pageData.cropPercent;
                imgEl.style.objectPosition = pageData.cropMode === 'X' ? `${finalPct}% 50%` : `50% ${finalPct}%`;
                cellDiv.appendChild(imgEl);
            } else {
                cellDiv.innerHTML += `<div class="placeholder">[ Okładka ]</div>`;
            }
            
            // Text block as OVERLAY
            const textWrapper = document.createElement('div');
            textWrapper.style.position = 'absolute';
            textWrapper.style.top = '6mm';
            textWrapper.style.left = '6mm';
            textWrapper.style.right = '6mm';
            textWrapper.style.bottom = '6mm';
            textWrapper.style.display = 'flex';
            textWrapper.style.flexDirection = 'column';
            textWrapper.style.pointerEvents = 'none';
            textWrapper.style.zIndex = '20';

            // H-align for the wrapper (flex alignment)
            textWrapper.style.alignItems = pageData.alignH === 'left' ? 'flex-start' : pageData.alignH === 'center' ? 'center' : 'flex-end';
            // V-align for the wrapper
            textWrapper.style.justifyContent = pageData.alignV === 'top' ? 'flex-start' : pageData.alignV === 'center' ? 'center' : 'flex-end';

            const textBlock = document.createElement('div');
            let bgCol = 'transparent';
            if (pageData.textBgColor === 'black') bgCol = 'rgba(0,0,0,0.8)';
            else if (pageData.textBgColor === 'white') bgCol = 'rgba(255,255,255,0.8)';
            else if (pageData.textBgColor === 'red') bgCol = 'rgba(255,0,0,0.8)';
            else if (pageData.textBgColor === 'blue') bgCol = 'rgba(0,0,255,0.8)';
            else if (pageData.textBgColor === 'green') bgCol = 'rgba(0,128,0,0.8)';
            else if (pageData.textBgColor === 'orange') bgCol = 'rgba(255,165,0,0.8)';
            else if (pageData.textBgColor === 'purple') bgCol = 'rgba(128,0,128,0.8)';
            else if (pageData.textBgColor === 'violet') bgCol = 'rgba(238,130,238,0.8)';
            
            textBlock.style.backgroundColor = bgCol;
            textBlock.style.color = pageData.textColor;
            
            // Proportional padding (matching caption feel)
            const baseFontSize = (pageData.fontSize || 32) / 2;
            textBlock.style.padding = `${baseFontSize * 0.25}px ${baseFontSize * 0.6}px`;
            
            textBlock.style.display = 'flex';
            textBlock.style.flexDirection = 'column';
            textBlock.style.textAlign = pageData.alignH;
            
            const titleNode = document.createElement('div');
            titleNode.style.fontWeight = 'bold';
            titleNode.style.fontSize = `${baseFontSize}px`;
            titleNode.style.fontFamily = pageData.fontFamily || 'sans-serif';
            titleNode.style.lineHeight = '1.1';
            titleNode.style.whiteSpace = "pre-line"; 
            titleNode.innerText = pageData.text || "";
            
            const subtitleNode = document.createElement('div');
            subtitleNode.style.fontSize = `${baseFontSize * 0.6}px`;
            subtitleNode.style.fontFamily = pageData.fontFamily || 'sans-serif';
            subtitleNode.style.marginTop = '4px';
            subtitleNode.style.opacity = '0.9';
            subtitleNode.innerText = pageData.subtitle || "";
            
            textBlock.appendChild(titleNode);
            if (pageData.subtitle) textBlock.appendChild(subtitleNode);
            
            textWrapper.appendChild(textBlock);
            cellDiv.appendChild(textWrapper);
        } else {
            cellDiv.className = `grid-cell ${cell.isRotated ? 'upside-down' : ''}`;
            if (pageData.imgSrc) {
                const imgEl = document.createElement('img');
                imgEl.src = pageData.imgSrc;
                if (zineState.config.globalMonochrome) imgEl.classList.add('monochrome');
                
                const scale = (pageData.photoSize || 100) / 100;
                imgEl.style.width = `${scale * 100}%`;
                imgEl.style.height = `${scale * 100}%`;
                imgEl.style.objectFit = 'cover';

                const finalPct = cell.isRotated ? (100 - pageData.cropPercent) : pageData.cropPercent;
                imgEl.style.objectPosition = pageData.cropMode === 'X' ? `${finalPct}% 50%` : `50% ${finalPct}%`;
                
                cellDiv.appendChild(imgEl);
            } else {
                cellDiv.innerHTML += `<div class="placeholder">[ Brak obrazu ]</div>`;
            }
        }

        // Add QR Code (only on Page 8)
        if (pageNum === 8 && zineState.config.qrCode.enabled && zineState.config.qrCode.url) {
            const qrWrapper = document.createElement('div');
            qrWrapper.style.position = 'absolute';
            qrWrapper.style.top = '5mm';
            qrWrapper.style.left = '5mm';
            qrWrapper.style.right = '5mm';
            qrWrapper.style.bottom = '5mm';
            qrWrapper.style.pointerEvents = 'none';
            qrWrapper.style.display = 'flex';
            qrWrapper.style.zIndex = '20';
            
            qrWrapper.style.justifyContent = zineState.config.qrCode.alignH === 'left' ? 'flex-start' : zineState.config.qrCode.alignH === 'center' ? 'center' : 'flex-end';
            qrWrapper.style.alignItems = zineState.config.qrCode.alignV === 'top' ? 'flex-start' : zineState.config.qrCode.alignV === 'center' ? 'center' : 'flex-end';
            
            const qrContainer = document.createElement('div');
            qrContainer.id = 'qr-preview-img';
            qrContainer.style.background = '#fff';
            qrContainer.style.padding = '2px';
            qrWrapper.appendChild(qrContainer);
            cellDiv.appendChild(qrWrapper);
            
            // Use setTimeout to ensure container is in DOM
            setTimeout(() => {
                qrContainer.innerHTML = '';
                
                // Convert mm to px (assuming ~3.78 px per mm)
                const sizePx = Math.round((zineState.config.qrCode.size || 15) * 3.78);
                
                // Use EasyQRCodeJS to generate SVG
                new QRCode(qrContainer, {
                    text: zineState.config.qrCode.url,
                    width: 1024,
                    height: 1024,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H,
                    drawer: 'canvas' // Use canvas for preview for consistency
                });
                
                // Force display size
                const qrImg = qrContainer.querySelector('canvas');
                if (qrImg) {
                    qrImg.style.width = `${sizePx}px`;
                    qrImg.style.height = `${sizePx}px`;
                }
            }, 0);
        }

        // Add Caption
        if (!pageData.isCover && pageData.caption) {
            const capWrapper = document.createElement('div');
            capWrapper.style.position = 'absolute';
            capWrapper.style.bottom = '6mm';
            capWrapper.style.left = '6mm';
            capWrapper.style.right = '6mm';
            capWrapper.style.zIndex = '25';
            capWrapper.style.pointerEvents = 'none';
            capWrapper.style.textAlign = pageData.captionAlignH;
            
            const capSpan = document.createElement('span');
            capSpan.innerText = pageData.caption;
            capSpan.style.background = 'rgba(0,0,0,0.6)';
            capSpan.style.color = '#fff';
            capSpan.style.padding = '2px 6px';
            capSpan.style.fontSize = '9px';
            capWrapper.appendChild(capSpan);
            cellDiv.appendChild(capWrapper);
        }

        previewGrid.appendChild(cellDiv);
    });
}

function swapPages(idxA, idxB) {
    const dataA = zineState[idxA];
    const dataB = zineState[idxB];

    // Whitelist properties to swap (Visuals only)
    const propsToSwap = ['imgObject', 'imgSrc', 'cropPercent', 'cropMode', 'photoSize'];
    
    const temp = {};
    propsToSwap.forEach(p => temp[p] = dataA[p]);
    propsToSwap.forEach(p => dataA[p] = dataB[p]);
    propsToSwap.forEach(p => dataB[p] = temp[p]);

    renderEditors();
    updatePreview();
}

function generatePDF() {
    try {
        if (!window.jspdf) {
            alert("Błąd: Biblioteka jsPDF nie została załadowana.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const isA4 = zineState.config.paperFormat === 'A4';
        
        const doc = new jsPDF({ 
            orientation: 'landscape', 
            unit: 'mm', 
            format: isA4 ? 'a4' : 'letter' 
        });

        const pageWidth = isA4 ? 297 : 279.4; 
        const pageHeight = isA4 ? 210 : 215.9;
        
        const cellWidth = pageWidth / 4; const cellHeight = pageHeight / 2;
        const margin = 5; // 5mm global white margin (passe-partout)

        doc.setDrawColor(210, 210, 210); 
        doc.setLineWidth(0.1);
        
        doc.line(cellWidth, 0, cellWidth, pageHeight); 
        doc.line(cellWidth * 2, 0, cellWidth * 2, pageHeight); 
        doc.line(cellWidth * 3, 0, cellWidth * 3, pageHeight); 
        doc.line(0, cellHeight, pageWidth, cellHeight);

        impositionLayout.forEach((cell, index) => {
            const col = index % 4; const row = Math.floor(index / 4);
            const x = col * cellWidth; const y = row * cellHeight;
            
            // Safe zone coordinates
            const safeX = x + margin;
            const safeY = y + margin;
            const safeWidth = cellWidth - (margin * 2);
            const safeHeight = cellHeight - (margin * 2);

            const pageData = zineState[cell.pageNum];

            if (pageData.isCover) {
                // 1. Image covers full safe area
                if (pageData.imgObject) {
                    const img = pageData.imgObject;
                    const scale = (pageData.photoSize || 100) / 100;
                    
                    const scaledW = safeWidth * scale;
                    const scaledH = safeHeight * scale;
                    const offX = (safeWidth - scaledW) / 2;
                    const offY = (safeHeight - scaledH) / 2;

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = Math.round(scaledW * 10);  
                    canvas.height = Math.round(scaledH * 10);

                    if (zineState.config.globalMonochrome) ctx.filter = 'grayscale(100%)';

                    let sx = 0, sy = 0, sw, sh;
                    if (pageData.cropMode === 'X') {
                        const scaleFactor = canvas.height / img.height;
                        const totalMissingWidthOriginal = img.width - (canvas.width / scaleFactor);
                        const appliedPct = cell.isRotated ? (100 - pageData.cropPercent) : pageData.cropPercent;
                        sx = totalMissingWidthOriginal * (appliedPct / 100);
                        sw = canvas.width / scaleFactor;
                        sh = img.height;
                    } else {
                        const scaleFactor = canvas.width / img.width;
                        const totalMissingHeightOriginal = img.height - (canvas.height / scaleFactor);
                        const appliedPct = cell.isRotated ? (100 - pageData.cropPercent) : pageData.cropPercent;
                        sy = totalMissingHeightOriginal * (appliedPct / 100);
                        sw = img.width;
                        sh = canvas.height / scaleFactor;
                    }

                    if (cell.isRotated) {
                        ctx.translate(canvas.width / 2, canvas.height / 2);
                        ctx.rotate(Math.PI);
                        ctx.translate(-canvas.width / 2, -canvas.height / 2);
                    }

                    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
                    const finalImgData = canvas.toDataURL('image/jpeg', 1.0);
                    doc.addImage(finalImgData, 'JPEG', safeX + offX, safeY + offY, scaledW, scaledH);
                }

                // 2. Cover Text as OVERLAY
                let pdfFont = 'helvetica';
                if (pageData.fontFamily === 'serif') pdfFont = 'times';
                if (pageData.fontFamily === 'monospace') pdfFont = 'courier';

                const titleSize = Math.round((pageData.fontSize || 32) * 0.6); 
                const subtitleSize = Math.round(titleSize * 0.6);
                const titleSizeMM = titleSize * 0.3527;
                const subtitleSizeMM = subtitleSize * 0.3527;
                
                doc.setFont(pdfFont, 'bold'); 
                doc.setFontSize(titleSize);
                const titleWidth = doc.getTextWidth(pageData.text || "");
                
                doc.setFont(pdfFont, 'normal');
                doc.setFontSize(subtitleSize);
                const subtitleWidth = pageData.subtitle ? doc.getTextWidth(pageData.subtitle) : 0;
                
                const maxTextWidth = Math.max(titleWidth, subtitleWidth);
                const paddingV = titleSizeMM * 0.25;
                const paddingH = titleSizeMM * 0.6;

                const blockWidth = maxTextWidth + (paddingH * 2);
                const blockHeight = titleSizeMM + (pageData.subtitle ? (subtitleSizeMM * 1.5) : 0) + (paddingV * 2);

                const alignH = pageData.alignH;
                const alignV = pageData.alignV;

                let blockX, blockY;
                if (alignH === 'left') blockX = safeX + 1;
                else if (alignH === 'center') blockX = safeX + (safeWidth - blockWidth) / 2;
                else blockX = safeX + safeWidth - blockWidth - 1;

                if (alignV === 'top') blockY = safeY + 1;
                else if (alignV === 'center') blockY = safeY + (safeHeight - blockHeight) / 2;
                else blockY = safeY + safeHeight - blockHeight - 1;

                // Render text properties
                doc.setTextColor(pageData.textColor === 'black' ? 0 : 255);
                
                let textX = alignH === 'left' ? blockX + paddingH : alignH === 'center' ? blockX + (blockWidth / 2) : blockX + blockWidth - paddingH;
                let titleBaselineY = blockY + paddingV + (titleSizeMM * 0.85);
                let subtitleBaselineY = titleBaselineY + (subtitleSizeMM * 1.3);

                if (cell.isRotated) {
                    const cellCenterX = x + (cellWidth / 2);
                    const cellCenterY = y + (cellHeight / 2);
                    const rotPos = (px, py) => ({
                        x: cellCenterX + (cellCenterX - px),
                        y: cellCenterY + (cellCenterY - py)
                    });

                    // Draw background (Rotated)
                    if (pageData.textBgColor !== 'none') {
                        const rBlock = rotPos(blockX + blockWidth / 2, blockY + blockHeight / 2);
                        const bgColors = {
                            'black': [0, 0, 0],
                            'white': [255, 255, 255],
                            'red': [255, 0, 0],
                            'blue': [0, 0, 255],
                            'green': [0, 128, 0],
                            'orange': [255, 165, 0],
                            'purple': [128, 0, 128],
                            'violet': [238, 130, 238]
                        };
                        const rgb = bgColors[pageData.textBgColor] || [255, 255, 255];
                        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
                        doc.setGState(new doc.GState({opacity: 0.75}));
                        doc.rect(rBlock.x - blockWidth / 2, rBlock.y - blockHeight / 2, blockWidth, blockHeight, 'F');
                        doc.setGState(new doc.GState({opacity: 1.0}));
                    }

                    // Flip alignment for rotated text to stay inside bounds
                    let pdfAlign = alignH;
                    if (alignH === 'left') pdfAlign = 'right';
                    else if (alignH === 'right') pdfAlign = 'left';

                    const rTitle = rotPos(textX, titleBaselineY);
                    doc.setFont(pdfFont, 'bold'); 
                    doc.setFontSize(titleSize);
                    doc.text(pageData.text || "", rTitle.x, rTitle.y, { align: pdfAlign, angle: 180 });
                    
                    if (pageData.subtitle) {
                        doc.setFont(pdfFont, 'normal');
                        doc.setFontSize(subtitleSize);
                        const rSub = rotPos(textX, subtitleBaselineY);
                        doc.text(pageData.subtitle, rSub.x, rSub.y, { align: pdfAlign, angle: 180 });
                    }
                } else {
                    // Draw background (Normal)
                    if (pageData.textBgColor !== 'none') {
                        const bgColors = {
                            'black': [0, 0, 0],
                            'white': [255, 255, 255],
                            'red': [255, 0, 0],
                            'blue': [0, 0, 255],
                            'green': [0, 128, 0],
                            'orange': [255, 165, 0],
                            'purple': [128, 0, 128],
                            'violet': [238, 130, 238]
                        };
                        const rgb = bgColors[pageData.textBgColor] || [255, 255, 255];
                        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
                        doc.setGState(new doc.GState({opacity: 0.75}));
                        doc.rect(blockX, blockY, blockWidth, blockHeight, 'F');
                        doc.setGState(new doc.GState({opacity: 1.0}));
                    }
                    
                    doc.setFont(pdfFont, 'bold'); 
                    doc.setFontSize(titleSize);
                    doc.text(pageData.text || "", textX, titleBaselineY, { align: alignH });
                    
                    if (pageData.subtitle) {
                        doc.setFont(pdfFont, 'normal');
                        doc.setFontSize(subtitleSize);
                        doc.text(pageData.subtitle, textX, subtitleBaselineY, { align: alignH });
                    }
                }

            } else {
                if (pageData.imgObject) {
                    const img = pageData.imgObject;
                    const scale = (pageData.photoSize || 100) / 100;
                    
                    const scaledW = safeWidth * scale;
                    const scaledH = safeHeight * scale;
                    const offX = (safeWidth - scaledW) / 2;
                    const offY = (safeHeight - scaledH) / 2;

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = Math.round(scaledW * 10);  
                    canvas.height = Math.round(scaledH * 10);

                    if (zineState.config.globalMonochrome) ctx.filter = 'grayscale(100%)';

                    let sx = 0, sy = 0, sw, sh;
                    if (pageData.cropMode === 'X') {
                        const scaleFactor = canvas.height / img.height;
                        const totalMissingWidthOriginal = img.width - (canvas.width / scaleFactor);
                        const appliedPct = cell.isRotated ? (100 - pageData.cropPercent) : pageData.cropPercent;
                        sx = totalMissingWidthOriginal * (appliedPct / 100);
                        sw = canvas.width / scaleFactor;
                        sh = img.height;
                    } else {
                        const scaleFactor = canvas.width / img.width;
                        const totalMissingHeightOriginal = img.height - (canvas.height / scaleFactor);
                        const appliedPct = cell.isRotated ? (100 - pageData.cropPercent) : pageData.cropPercent;
                        sy = totalMissingHeightOriginal * (appliedPct / 100);
                        sw = img.width;
                        sh = canvas.height / scaleFactor;
                    }

                    if (cell.isRotated) {
                        ctx.translate(canvas.width / 2, canvas.height / 2);
                        ctx.rotate(Math.PI);
                        ctx.translate(-canvas.width / 2, -canvas.height / 2);
                    }

                    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
                    const finalImgData = canvas.toDataURL('image/jpeg', 1.0);
                    doc.addImage(finalImgData, 'JPEG', safeX + offX, safeY + offY, scaledW, scaledH);
                }

                // Render Captions
                if (pageData.caption) {
                    doc.setFontSize(9);
                    doc.setTextColor(255, 255, 255);
                    
                    const capText = pageData.caption;
                    const textWidth = doc.getTextWidth(capText);
                    const rectHeight = 4;
                    const textBaselineOffset = 3.1; // Baseline is ~3.1mm from top of 9pt text for centering in 4mm box

                    let capY, rectY;
                    if (cell.isRotated) {
                        // Rotated pages (4-7): Edge is at physical top, Fold is at bottom.
                        // We want captions at the Edge (bottom of viewer page).
                        rectY = safeY + 4; 
                        capY = rectY + (rectHeight - textBaselineOffset);
                    } else {
                        rectY = safeY + safeHeight - 4 - rectHeight; // 4mm from bottom
                        capY = rectY + textBaselineOffset;
                    }

                    // With angle:180, jsPDF draws text going LEFT from the capX anchor.
                    // So for rotated cells we set capX = textVisualLeft + textWidth,
                    // which makes text land exactly over the rect (going leftward from capX).
                    // We do NOT use the 'align' option — position is computed manually.
                    // For rotated cells, left/right alignment is also physically mirrored
                    // (reader's left = physical right, because the page is flipped when read).

                    let textVisualLeft;
                    if (cell.isRotated) {
                        if (pageData.captionAlignH === 'center') {
                            textVisualLeft = safeX + (safeWidth - textWidth) / 2;
                        } else if (pageData.captionAlignH === 'left') {
                            // Reader's left → physical right edge of cell
                            textVisualLeft = safeX + safeWidth - 2 - textWidth;
                        } else { // right → physical left edge
                            textVisualLeft = safeX + 2;
                        }
                    } else {
                        if (pageData.captionAlignH === 'center') {
                            textVisualLeft = safeX + (safeWidth - textWidth) / 2;
                        } else if (pageData.captionAlignH === 'right') {
                            textVisualLeft = safeX + safeWidth - 2 - textWidth;
                        } else { // left
                            textVisualLeft = safeX + 2;
                        }
                    }

                    const rectX = textVisualLeft - 1;
                    // For angle:180 text goes LEFT from capX → place capX at the right edge of visual area
                    // For angle:0 text goes RIGHT from capX → place capX at the left edge
                    const capX = cell.isRotated ? textVisualLeft + textWidth : textVisualLeft;

                    // Draw background rectangle
                    doc.setFillColor(0, 0, 0);
                    doc.setGState(new doc.GState({opacity: 0.6}));
                    doc.rect(rectX, rectY, textWidth + 2, rectHeight, 'F');
                    doc.setGState(new doc.GState({opacity: 1.0}));

                    // Draw text — no 'align' option, position already manually computed above
                    doc.text(capText, capX, capY, { angle: cell.isRotated ? 180 : 0 });
                }
            }

            // QR Code on Page 8
            if (cell.pageNum === 8 && zineState.config.qrCode.enabled && zineState.config.qrCode.url) {
                const qrSize = zineState.config.qrCode.size || 15; // User-defined size in mm
                const qrH = zineState.config.qrCode.alignH;
                const qrV = zineState.config.qrCode.alignV;
                
                // --- FIX: Centering logic ---
                // Calculate position of the center of the QR
                let centerX, centerY;
                
                if (qrH === 'left') centerX = safeX + qrSize / 2 + 2;
                else if (qrH === 'center') centerX = safeX + safeWidth / 2;
                else centerX = safeX + safeWidth - qrSize / 2 - 2;
                
                if (qrV === 'top') centerY = safeY + qrSize / 2 + 2;
                else if (qrV === 'center') centerY = safeY + safeHeight / 2;
                else centerY = safeY + safeHeight - qrSize / 2 - 2;
                
                // Calculate top-left corner from center
                const qrX = centerX - qrSize / 2;
                const qrY = centerY - qrSize / 2;
                
                // Use EasyQRCodeJS to generate QR as a high-res Canvas
                const qrContainer = document.createElement('div');
                new QRCode(qrContainer, {
                    text: zineState.config.qrCode.url,
                    width: 1024,
                    height: 1024,
                    correctLevel : QRCode.CorrectLevel.H,
                    drawer: 'canvas' // Explicitly use Canvas for PDF export reliability
                });
                
                // Get the canvas element
                const canvas = qrContainer.querySelector('canvas');
                if (canvas) {
                    // Add background for contrast
                    doc.setFillColor(255, 255, 255);
                    doc.rect(qrX, qrY, qrSize, qrSize, 'F');
                    
                    // Add QR to PDF
                    doc.addImage(canvas.toDataURL('image/png'), 'PNG', qrX, qrY, qrSize, qrSize);
                }
            }
        });

        // Delay save to allow QR codes to generate
        setTimeout(() => {
            doc.save(`zine-forge-${zineState.config.paperFormat.toLowerCase()}.pdf`);
        }, 500);
    } catch (error) {
        alert("Wystąpił nieoczekiwany błąd podczas generowania PDF: " + error.message);
        console.error(error);
    }
}

