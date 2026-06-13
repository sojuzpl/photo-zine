const impositionLayout = [
    { pageNum: 7, isRotated: true }, { pageNum: 6, isRotated: true },
    { pageNum: 5, isRotated: true }, { pageNum: 4, isRotated: true },
    { pageNum: 8, isRotated: false, label: "8 (Back Cover)" }, { pageNum: 1, isRotated: false, label: "1 (Front Cover)" },
    { pageNum: 2, isRotated: false }, { pageNum: 3, isRotated: false }
];

const zineState = {
    config: {
        paperFormat: "A4" // "A4" | "LETTER"
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
        photoSize: 100
    }
};

for(let i=2; i<=8; i++) {
    zineState[i] = { 
        isCover: false, 
        imgObject: null, 
        imgSrc: null, 
        cropPercent: 50, 
        cropMode: 'X',
        photoSize: 100
    };
}

let draggedPageNum = null;

// INICJALIZACJA DOPIERO PO ZAŁADOWANIU DRZEWA DOM
document.addEventListener("DOMContentLoaded", () => {
    renderEditors();

    // OBSŁUGA PRZYCISKU POBIERANIA PDF
    document.getElementById('download-btn').addEventListener('click', generatePDF);

    // PIERWSZE WYGENEROWANIE PODGLĄDU SIATKI
    updatePreview();
});

function renderEditors() {
    const editorsContainer = document.getElementById('editors-container');
    if (!editorsContainer) return;
    editorsContainer.innerHTML = '';

    // SEKJA GLOBALNA (CONFIG)
    const configBox = document.createElement('div');
    configBox.className = 'page-editor global-config';
    configBox.innerHTML = `
        <h3 style="color: var(--primary-hover)">Ustawienia arkusza</h3>
        <div class="control-group">
            <div class="control-row">
                <label>Format Papieru</label>
                <select onchange="handleFormatChange(this.value)">
                    <option value="A4" ${zineState.config.paperFormat === 'A4' ? 'selected' : ''}>A4 (297 x 210 mm)</option>
                    <option value="LETTER" ${zineState.config.paperFormat === 'LETTER' ? 'selected' : ''}>US Letter (8.5 x 11 in)</option>
                </select>
            </div>
        </div>`;
    editorsContainer.appendChild(configBox);

    for (let i = 1; i <= 8; i++) {
        const pageBox = document.createElement('div');
        pageBox.id = `editor-page-${i}`;
        const pageData = zineState[i];
        const hasImg = pageData.imgSrc ? 'has-image' : '';

        if (i === 1) {
            pageBox.className = `page-editor cover-editor ${hasImg}`;
            pageBox.innerHTML = `
                <h3>Strona 1 (Okładka)</h3>
                <div class="control-group">
                    <div class="file-upload-zone">
                        <div class="file-upload-text">
                            <b>Wgraj zdjęcie na okładkę</b>
                            <span>Kliknij, aby wybrać plik JPG / PNG</span>
                        </div>
                        <input type="file" accept="image/*" onchange="handleFile(1, this)">
                    </div>
                    <div class="slider-container ${hasImg ? 'visible' : ''}" id="slider-box-1">
                        <div class="slider-header">
                            <label id="slider-label-1">${pageData.cropMode === 'X' ? 'Kadr (Poziom)' : 'Kadr (Pion)'}</label>
                            <span class="val-indicator" id="val-1">${getCropLabel(pageData.cropPercent, pageData.cropMode)}</span>
                        </div>
                        <input type="range" id="crop-1" min="0" max="100" value="${pageData.cropPercent}" oninput="handleCropChange(1, this.value)">
                        
                        <div class="slider-header" style="margin-top:10px">
                            <label>Skala zdjęcia</label>
                            <span class="val-indicator" id="size-val-1">${pageData.photoSize}%</span>
                        </div>
                        <input type="range" min="40" max="100" value="${pageData.photoSize}" oninput="handleSizeChange(1, this.value)">
                    </div>
                    <div class="control-row">
                        <label>Tytuł zina</label>
                        <textarea id="cover-text" rows="2" oninput="handleCoverText(this.value)">${pageData.text || ""}</textarea>
                    </div>
                    <div class="control-row">
                        <label>Podtytuł</label>
                        <textarea id="cover-subtitle" rows="2" oninput="handleCoverSubtitle(this.value)">${pageData.subtitle || ""}</textarea>
                    </div>
                    <div class="control-row">
                        <label>Krój Pisma</label>
                        <select onchange="handleCoverFont(this.value)">
                            <option value="sans-serif" ${pageData.fontFamily === 'sans-serif' ? 'selected' : ''}>Nowoczesny (Sans-Serif)</option>
                            <option value="serif" ${pageData.fontFamily === 'serif' ? 'selected' : ''}>Klasyczny (Serif)</option>
                            <option value="monospace" ${pageData.fontFamily === 'monospace' ? 'selected' : ''}>Techniczny (Monospace)</option>
                        </select>
                    </div>
                    <div class="slider-container visible">
                        <div class="slider-header">
                            <label>Rozmiar czcionki</label>
                            <span class="val-indicator" id="cover-size-val">${Math.round((pageData.fontSize || 32) * 0.65)} pt</span>
                        </div>
                        <input type="range" min="12" max="98" value="${pageData.fontSize || 32}" oninput="handleCoverSize(this.value)">
                    </div>
                </div>`;
        } else {
            const labelText = i === 8 ? "Strona 8 (Tył książki)" : `Strona ${i}`;
            pageBox.className = `page-editor ${hasImg}`;
            const isVisible = hasImg ? 'visible' : '';
            pageBox.innerHTML = `
                <h3>${labelText}</h3>
                <div class="control-group">
                    <div class="file-upload-zone">
                        <div class="file-upload-text">
                            <b>Wgraj ilustrację</b>
                            <span>Kliknij, aby wybrać plik JPG / PNG</span>
                        </div>
                        <input type="file" accept="image/*" onchange="handleFile(${i}, this)">
                    </div>
                    <div class="slider-container ${isVisible}" id="slider-box-${i}">
                        <div class="slider-header">
                            <label id="slider-label-${i}">${pageData.cropMode === 'X' ? 'Kadr (Poziom)' : 'Kadr (Pion)'}</label>
                            <span class="val-indicator" id="val-${i}">${getCropLabel(pageData.cropPercent, pageData.cropMode)}</span>
                        </div>
                        <input type="range" id="crop-${i}" min="0" max="100" value="${pageData.cropPercent}" oninput="handleCropChange(${i}, this.value)">
                        
                        <div class="slider-header" style="margin-top:10px">
                            <label>Skala zdjęcia</label>
                            <span class="val-indicator" id="size-val-${i}">${pageData.photoSize}%</span>
                        </div>
                        <input type="range" min="40" max="100" value="${pageData.photoSize}" oninput="handleSizeChange(${i}, this.value)">
                    </div>
                </div>`;
        }
        editorsContainer.appendChild(pageBox);
    }
}

function handleFormatChange(val) {
    zineState.config.paperFormat = val;
    const grid = document.getElementById('preview-grid');
    if (grid) {
        grid.style.aspectRatio = val === 'A4' ? '1.4142' : '1.2941';
        grid.style.width = val === 'A4' ? '100%' : '94.07%'; // Fix for physical width difference (279.4 / 297)
    }
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
    const ptSize = Math.round(val * 0.65);
    const indicator = document.getElementById('cover-size-val');
    if (indicator) indicator.innerText = ptSize + ' pt'; 
    updatePreview(); 
}

function handleFile(pageNum, input) {
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
            
            // Correction for split cover layout aspect ratio
            let targetRatio;
            if (pageNum === 1) {
                targetRatio = isA4 ? (74.25 / (105 * 0.65)) : (2.75 / (4.25 * 0.65));
            } else {
                targetRatio = isA4 ? (74.25 / 105) : (2.75 / 4.25);
            }

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


        if (pageData.isCover) {
            cellDiv.className = `grid-cell cover-cell ${cell.isRotated ? 'upside-down' : ''}`;
            cellDiv.style.backgroundColor = '#fff';
            cellDiv.style.display = 'flex';
            cellDiv.style.flexDirection = 'column';
            cellDiv.style.justifyContent = 'flex-start';
            cellDiv.style.alignItems = 'stretch';
            
            // Image part (Top)
            const imgContainer = document.createElement('div');
            imgContainer.style.flex = '1';
            imgContainer.style.position = 'relative';
            imgContainer.style.overflow = 'hidden';
            imgContainer.style.display = 'flex';
            imgContainer.style.alignItems = 'center';
            imgContainer.style.justifyContent = 'center';
            
            if (pageData.imgSrc) {
                const imgEl = document.createElement('img');
                imgEl.src = pageData.imgSrc;
                
                const scale = (pageData.photoSize || 100) / 100;
                imgEl.style.width = `${scale * 100}%`;
                imgEl.style.height = `${scale * 100}%`;
                imgEl.style.objectFit = 'cover';

                const finalPct = cell.isRotated ? (100 - pageData.cropPercent) : pageData.cropPercent;
                imgEl.style.objectPosition = pageData.cropMode === 'X' ? `${finalPct}% 50%` : `50% ${finalPct}%`;
                imgContainer.appendChild(imgEl);
            } else {
                imgContainer.innerHTML = `<div class="placeholder" style="height:100%; display:flex; align-items:center; justify-content:center;">[ Okładka ]</div>`;
            }
            
            // Text block (Bottom)
            const textBlock = document.createElement('div');
            textBlock.style.backgroundColor = '#333';
            textBlock.style.color = '#fff';
            textBlock.style.padding = '8px';
            textBlock.style.textAlign = 'center';
            textBlock.style.minHeight = '30%';
            textBlock.style.display = 'flex';
            textBlock.style.flexDirection = 'column';
            textBlock.style.justifyContent = 'center';
            
            const titleNode = document.createElement('div');
            titleNode.style.fontWeight = 'bold';
            titleNode.style.fontSize = `${(pageData.fontSize || 32) / 2}px`;
            titleNode.style.fontFamily = pageData.fontFamily || 'sans-serif';
            titleNode.style.whiteSpace = "pre-line"; 
            titleNode.innerText = pageData.text || "";
            
            const subtitleNode = document.createElement('div');
            subtitleNode.style.fontSize = `${(pageData.fontSize || 32) / 3.5}px`;
            subtitleNode.style.fontFamily = pageData.fontFamily || 'sans-serif';
            subtitleNode.style.marginTop = '4px';
            subtitleNode.style.opacity = '0.9';
            subtitleNode.innerText = pageData.subtitle || "";
            
            textBlock.appendChild(titleNode);
            textBlock.appendChild(subtitleNode);
            
            cellDiv.appendChild(imgContainer);
            cellDiv.appendChild(textBlock);
        } else {
            cellDiv.className = `grid-cell ${cell.isRotated ? 'upside-down' : ''}`;
            if (pageData.imgSrc) {
                const imgEl = document.createElement('img');
                imgEl.src = pageData.imgSrc;
                
                const scale = (pageData.photoSize || 100) / 100;
                imgEl.style.width = `${scale * 100}%`;
                imgEl.style.height = `${scale * 100}%`;
                imgEl.style.objectFit = 'cover';

                const finalPct = cell.isRotated ? (100 - pageData.cropPercent) : pageData.cropPercent;
                if (pageData.cropMode === 'X') {
                    imgEl.style.objectPosition = `${finalPct}% 50%`;
                } else {
                    imgEl.style.objectPosition = `50% ${finalPct}%`;
                }
                
                cellDiv.appendChild(imgEl);
            } else {
                cellDiv.innerHTML += `<div class="placeholder">[ Brak obrazu ]</div>`;
            }
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
                const textBlockHeight = safeHeight * 0.35;
                const textBlockY = safeY + safeHeight - textBlockHeight;
                
                doc.setFillColor(51, 51, 51); // dark-gray
                doc.rect(safeX, textBlockY, safeWidth, textBlockHeight, 'F');
                
                if (pageData.imgObject) {
                    const img = pageData.imgObject;
                    const scale = (pageData.photoSize || 100) / 100;
                    
                    const imgAreaHeight = safeHeight - textBlockHeight;
                    const scaledW = safeWidth * scale;
                    const scaledH = imgAreaHeight * scale;
                    const offX = (safeWidth - scaledW) / 2;
                    const offY = (imgAreaHeight - scaledH) / 2;

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = Math.round(scaledW * 4);  
                    canvas.height = Math.round(scaledH * 4);

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
                    const finalImgData = canvas.toDataURL('image/jpeg', 0.95);
                    doc.addImage(finalImgData, 'JPEG', safeX + offX, safeY + offY, scaledW, scaledH);
                }

                let pdfFont = 'helvetica';
                if (pageData.fontFamily === 'serif') pdfFont = 'times';
                if (pageData.fontFamily === 'monospace') pdfFont = 'courier';

                const titleSize = Math.round((pageData.fontSize || 32) * 0.6); 
                const subtitleSize = Math.round(titleSize * 0.6);
                
                doc.setTextColor(255, 255, 255);
                doc.setFont(pdfFont, 'bold'); 
                doc.setFontSize(titleSize);
                
                const centerX = safeX + (safeWidth / 2);
                const titleY = textBlockY + (textBlockHeight / 2) - 1;
                doc.text(pageData.text || "", centerX, titleY, { align: 'center' });
                
                doc.setFont(pdfFont, 'normal');
                doc.setFontSize(subtitleSize);
                doc.text(pageData.subtitle || "", centerX, titleY + (subtitleSize * 0.5) + 2, { align: 'center' });

            } else if (pageData.imgObject) {
                const img = pageData.imgObject;
                const scale = (pageData.photoSize || 100) / 100;
                
                const scaledW = safeWidth * scale;
                const scaledH = safeHeight * scale;
                const offX = (safeWidth - scaledW) / 2;
                const offY = (safeHeight - scaledH) / 2;

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = Math.round(scaledW * 4);  
                canvas.height = Math.round(scaledH * 4);

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
                const finalImgData = canvas.toDataURL('image/jpeg', 0.95);
                doc.addImage(finalImgData, 'JPEG', safeX + offX, safeY + offY, scaledW, scaledH);
            }
        });

        doc.save(`zine-forge-${zineState.config.paperFormat.toLowerCase()}.pdf`);
    } catch (error) {
        alert("Wystąpił nieoczekiwany błąd podczas generowania PDF: " + error.message);
    }
}
