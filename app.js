const impositionLayout = [
    { pageNum: 7, isRotated: true }, { pageNum: 6, isRotated: true },
    { pageNum: 5, isRotated: true }, { pageNum: 4, isRotated: true },
    { pageNum: 8, isRotated: false, label: "8 (Back Cover)" }, { pageNum: 1, isRotated: false, label: "1 (Front Cover)" },
    { pageNum: 2, isRotated: false }, { pageNum: 3, isRotated: false }
];

const zineState = {
    1: { isCover: true, text: "MÓJ ZIN\nwersja 01", theme: "black", fontSize: 32, fontFamily: "sans-serif" }
};

for(let i=2; i<=8; i++) {
    zineState[i] = { isCover: false, imgObject: null, imgSrc: null, cropPercent: 50, cropMode: 'X' };
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

    for (let i = 1; i <= 8; i++) {
        const pageBox = document.createElement('div');
        pageBox.id = `editor-page-${i}`;
        const hasImg = zineState[i].imgSrc ? 'has-image' : '';

        if (i === 1) {
            pageBox.className = `page-editor cover-editor ${hasImg}`;
            pageBox.innerHTML = `
                <h3>Strona 1 (Okładka)</h3>
                <div class="control-group">
                    <div class="control-row">
                        <label>Tekst tytułowy</label>
                        <textarea id="cover-text" rows="3" oninput="handleCoverText(this.value)">${zineState[1].text}</textarea>
                    </div>
                    <div class="control-row">
                        <label>Stylistyka okładki</label>
                        <select onchange="handleCoverTheme(this.value)">
                            <option value="black" ${zineState[1].theme === 'black' ? 'selected' : ''}>Czarne tło / Biały tekst</option>
                            <option value="white" ${zineState[1].theme === 'white' ? 'selected' : ''}>Białe tło / Czarny tekst</option>
                        </select>
                    </div>
                    <div class="control-row">
                        <label>Krój Pisma</label>
                        <select onchange="handleCoverFont(this.value)">
                            <option value="sans-serif" ${zineState[1].fontFamily === 'sans-serif' ? 'selected' : ''}>Nowoczesny (Sans-Serif)</option>
                            <option value="serif" ${zineState[1].fontFamily === 'serif' ? 'selected' : ''}>Klasyczny (Serif)</option>
                            <option value="monospace" ${zineState[1].fontFamily === 'monospace' ? 'selected' : ''}>Techniczny (Monospace)</option>
                        </select>
                    </div>
                    <div class="slider-container visible">
                        <div class="slider-header">
                            <label>Rozmiar czcionki</label>
                            <span class="val-indicator" id="cover-size-val">${Math.round(zineState[1].fontSize * 0.65)} pt</span>
                        </div>
                        <input type="range" min="12" max="98" value="${zineState[1].fontSize}" oninput="handleCoverSize(this.value)">
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
                            <label id="slider-label-${i}">${zineState[i].cropMode === 'X' ? 'Kadr (Poziom)' : 'Kadr (Pion)'}</label>
                            <span class="val-indicator" id="val-${i}">${getCropLabel(zineState[i].cropPercent, zineState[i].cropMode)}</span>
                        </div>
                        <input type="range" id="crop-${i}" min="0" max="100" value="${zineState[i].cropPercent}" oninput="handleCropChange(${i}, this.value)">
                    </div>
                </div>`;
        }
        editorsContainer.appendChild(pageBox);
    }
}

function getCropLabel(value, mode) {
    if(value == 50) return 'Środek';
    else if(value < 50) return mode === 'X' ? 'W lewo' : 'W górę';
    else return mode === 'X' ? 'W prawo' : 'W dół';
}

function handleCoverText(val) { zineState[1].text = val; updatePreview(); }
function handleCoverTheme(val) { zineState[1].theme = val; updatePreview(); }
function handleCoverFont(val) { zineState[1].fontFamily = val; updatePreview(); }
function handleCoverSize(val) { 
    zineState[1].fontSize = parseInt(val); 
    const ptSize = Math.round(val * 0.65);
    document.getElementById('cover-size-val').innerText = ptSize + ' pt'; 
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

            const imgRatio = img.width / img.height;
            const targetRatio = 74.25 / 105;

            if (imgRatio > targetRatio) {
                zineState[pageNum].cropMode = 'X';
            } else {
                zineState[pageNum].cropMode = 'Y';
            }
            
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
        cellDiv.innerHTML = `<span class="badge" style="${pageData.isCover && pageData.theme === 'black' ? 'background:rgba(255,255,255,0.4);color:#000;' : ''}">${label}</span>`;

        if (pageData.isCover) {
            cellDiv.className = `grid-cell cover-cell ${cell.isRotated ? 'upside-down' : ''}`;
            cellDiv.style.backgroundColor = pageData.theme === 'black' ? '#111' : '#fff';
            cellDiv.style.color = pageData.theme === 'black' ? '#fff' : '#111';
            cellDiv.style.fontSize = `${pageData.fontSize / 1.8}px`;
            cellDiv.style.fontFamily = pageData.fontFamily;
            
            const textNode = document.createElement('div');
            textNode.style.whiteSpace = "pre-line"; 
            textNode.innerText = pageData.text;
            cellDiv.appendChild(textNode);
        } else {
            cellDiv.className = `grid-cell ${cell.isRotated ? 'upside-down' : ''}`;
            if (pageData.imgSrc) {
                const imgEl = document.createElement('img');
                imgEl.src = pageData.imgSrc;
                
                // object-position: X% Y%
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
    const temp = { ...zineState[idxA] };
    const isCoverA = zineState[idxA].isCover;
    const isCoverB = zineState[idxB].isCover;

    zineState[idxA] = { ...zineState[idxB], isCover: isCoverA };
    zineState[idxB] = { ...temp, isCover: isCoverB };

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
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const pageWidth = 297; const pageHeight = 210;
        const cellWidth = pageWidth / 4; const cellHeight = pageHeight / 2;

        doc.setDrawColor(210, 210, 210); 
        doc.setLineWidth(0.1);
        
        doc.line(cellWidth, 0, cellWidth, pageHeight); 
        doc.line(cellWidth * 2, 0, cellWidth * 2, pageHeight); 
        doc.line(cellWidth * 3, 0, cellWidth * 3, pageHeight); 
        doc.line(0, cellHeight, pageWidth, cellHeight);

        impositionLayout.forEach((cell, index) => {
            const col = index % 4; const row = Math.floor(index / 4);
            const x = col * cellWidth; const y = row * cellHeight;
            const pageData = zineState[cell.pageNum];

            if (pageData.isCover) {
                if (pageData.theme === 'black') {
                    doc.setFillColor(15, 15, 15); doc.rect(x, y, cellWidth, cellHeight, 'F'); doc.setTextColor(255, 255, 255);
                } else {
                    doc.setFillColor(255, 255, 255); doc.rect(x, y, cellWidth, cellHeight, 'F'); doc.setTextColor(15, 15, 15);
                }
                
                let pdfFont = 'helvetica';
                if (pageData.fontFamily === 'serif') pdfFont = 'times';
                if (pageData.fontFamily === 'monospace') pdfFont = 'courier';

                const actualPtSize = Math.round(pageData.fontSize * 0.65); 
                doc.setFont(pdfFont, 'bold'); 
                doc.setFontSize(actualPtSize);

                const maxTextWidth = cellWidth - 10;
                const lines = doc.splitTextToSize(pageData.text, maxTextWidth);
                
                const lineHeightInMm = (actualPtSize * 0.3527) * 1.15; 
                const totalTextHeight = lines.length * lineHeightInMm;
                const startY = y + (cellHeight / 2) - (totalTextHeight / 2) + (lineHeightInMm / 1.3);

                lines.forEach((line, lineIdx) => {
                    const currentLineY = startY + (lineIdx * lineHeightInMm);
                    if (currentLineY < y + cellHeight - 2) {
                        doc.text(line, x + (cellWidth / 2), currentLineY, { align: 'center' });
                    }
                });
            } else if (pageData.imgObject) {
                const img = pageData.imgObject;
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = cellWidth * 4;  
                canvas.height = cellHeight * 4;

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
                doc.addImage(finalImgData, 'JPEG', x, y, cellWidth, cellHeight);
            }
        });

        doc.save('perfekt-zine-arkusz.pdf');
    } catch (error) {
        alert("Wystąpił nieoczekiwany błąd podczas generowania PDF: " + error.message);
    }
}
