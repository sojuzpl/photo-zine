const impositionLayout = [
    { pageNum: 3, isRotated: true }, { pageNum: 4, isRotated: true },
    { pageNum: 5, isRotated: true }, { pageNum: 6, isRotated: true },
    { pageNum: 2, isRotated: false }, { pageNum: 1, isRotated: false, label: "1 (Okładka)" },
    { pageNum: 8, isRotated: false, label: "8 (Tył)" }, { pageNum: 7, isRotated: false }
];

const zineState = {
    1: { isCover: true, text: "MÓJ ZIN", theme: "white", fontSize: 24, fontFamily: "sans-serif" }
};

for(let i=2; i<=8; i++) {
    zineState[i] = { isCover: false, imgObject: null, imgSrc: null, cropPercent: 50, cropMode: 'X' };
}

const editorsContainer = document.getElementById('editors-container');

for (let i = 1; i <= 8; i++) {
    const pageBox = document.createElement('div');
    if (i === 1) {
        pageBox.className = 'page-editor cover-editor';
        pageBox.innerHTML = `
            <h3>Strona 1 (Okładka - Tekstowa)</h3>
            <div class="control-group">
                <div class="control-row"><label>Tytuł:</label><input type="text" id="cover-text" value="${zineState[1].text}" oninput="handleCoverText(this.value)"></div>
                <div class="control-row"><label>Kolor:</label><select onchange="handleCoverTheme(this.value)"><option value="white">Białe tło</option><option value="black">Czarne tło</option></select></div>
                <div class="control-row"><label>Czcionka:</label><select onchange="handleCoverFont(this.value)"><option value="sans-serif">Sans-Serif</option><option value="serif">Serif</option><option value="monospace">Monospace</option></select></div>
                <div class="slider-container visible"><label><span>Rozmiar</span><span id="cover-size-val">24px</span></label><input type="range" min="12" max="60" value="${zineState[1].fontSize}" oninput="handleCoverSize(this.value)"></div>
            </div>`;
    } else {
        const labelText = i === 8 ? "Strona 8 (Tył)" : `Strona ${i}`;
        pageBox.className = 'page-editor';
        pageBox.innerHTML = `
            <h3>${labelText}</h3>
            <div class="control-group">
                <input type="file" accept="image/*" onchange="handleFile(${i}, this)">
                <div class="slider-container" id="slider-box-${i}">
                    <label><span id="slider-label-${i}">Kadrowanie</span><span id="val-${i}">Środek</span></label>
                    <input type="range" id="crop-${i}" min="0" max="100" value="50" oninput="handleCropChange(${i}, this.value)">
                </div>
            </div>`;
    }
    editorsContainer.appendChild(pageBox);
}

function handleCoverText(val) { zineState[1].text = val; updatePreview(); }
function handleCoverTheme(val) { zineState[1].theme = val; updatePreview(); }
function handleCoverFont(val) { zineState[1].fontFamily = val; updatePreview(); }
function handleCoverSize(val) { zineState[1].fontSize = parseInt(val); document.getElementById('cover-size-val').innerText = val + 'px'; updatePreview(); }

function handleFile(pageNum, input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            zineState[pageNum].imgObject = img;
            zineState[pageNum].imgSrc = e.target.result; // Zapisujemy bezpieczne źródło Base64
            zineState[pageNum].cropPercent = 50;

            const imgRatio = img.width / img.height;
            const targetRatio = 74.25 / 105;

            if (imgRatio > targetRatio) {
                zineState[pageNum].cropMode = 'X';
                document.getElementById(`slider-label-${pageNum}`).innerText = "Kadr (Lewo / Prawo)";
            } else {
                zineState[pageNum].cropMode = 'Y';
                document.getElementById(`slider-label-${pageNum}`).innerText = "Kadr (Góra / Dół)";
            }
            
            document.getElementById(`slider-box-${pageNum}`).classList.add('visible');
            document.getElementById(`crop-${pageNum}`).value = 50;
            document.getElementById(`val-${pageNum}`).innerText = 'Środek';
            updatePreview();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleCropChange(pageNum, value) {
    zineState[pageNum].cropPercent = parseInt(value);
    const label = document.getElementById(`val-${pageNum}`);
    const mode = zineState[pageNum].cropMode;
    
    if(value == 50) label.innerText = 'Środek';
    else if(value < 50) label.innerText = mode === 'X' ? 'W lewo' : 'W górę';
    else label.innerText = mode === 'X' ? 'W prawo' : 'W dół';

    updatePreview();
}

function updatePreview() {
    const previewGrid = document.getElementById('preview-grid');
    previewGrid.innerHTML = '';

    impositionLayout.forEach(cell => {
        const cellDiv = document.createElement('div');
        const pageData = zineState[cell.pageNum];
        
        const label = cell.label ? cell.label : `Str. ${cell.pageNum}`;
        cellDiv.innerHTML = `<span class="badge" style="${pageData.isCover && pageData.theme === 'black' ? 'background:rgba(255,255,255,0.4);color:#000;' : ''}">${label}</span>`;

        if (pageData.isCover) {
            cellDiv.className = `grid-cell cover-cell ${cell.isRotated ? 'upside-down' : ''}`;
            cellDiv.style.backgroundColor = pageData.theme === 'black' ? '#111' : '#fff';
            cellDiv.style.color = pageData.theme === 'black' ? '#fff' : '#111';
            cellDiv.style.fontSize = `${pageData.fontSize / 1.8}px`;
            cellDiv.style.fontFamily = pageData.fontFamily;
            
            const textNode = document.createElement('div');
            textNode.innerText = pageData.text;
            cellDiv.appendChild(textNode);
        } else {
            cellDiv.className = `grid-cell ${cell.isRotated ? 'upside-down' : ''}`;
            if (pageData.imgSrc) {
                const imgEl = document.createElement('img');
                imgEl.src = pageData.imgSrc;
                
                if (pageData.cropMode === 'X') imgEl.className = 'fit-height';
                else imgEl.className = 'fit-width';
                
                cellDiv.appendChild(imgEl);
                
                setTimeout(() => {
                    const containerWidth = cellDiv.clientWidth;
                    const containerHeight = cellDiv.clientHeight;
                    const imgWidth = imgEl.clientWidth;
                    const imgHeight = imgEl.clientHeight;
                    
                    if (pageData.cropMode === 'X') {
                        const maxScroll = imgWidth - containerWidth;
                        if (maxScroll > 0) {
                            const finalPct = cell.isRotated ? pageData.cropPercent : (100 - pageData.cropPercent);
                            const offset = (finalPct / 100) * maxScroll;
                            imgEl.style.left = `-${offset}px`;
                            imgEl.style.top = '0px';
                        }
                    } else {
                        const maxScroll = imgHeight - containerHeight;
                        if (maxScroll > 0) {
                            const finalPct = cell.isRotated ? pageData.cropPercent : (100 - pageData.cropPercent);
                            const offset = (finalPct / 100) * maxScroll;
                            imgEl.style.top = `-${offset}px`;
                            imgEl.style.left = '0px';
                        }
                    }
                }, 0);
            } else {
                cellDiv.innerHTML += `<div class="placeholder">[ Puste pole ]</div>`;
            }
        }
        previewGrid.appendChild(cellDiv);
    });
}

document.getElementById('download-btn').addEventListener('click', () => {
    try {
        if (!window.jspdf) {
            alert("Błąd: Biblioteka jsPDF nie została załadowana. Sprawdź swoje połączenie z internetem lub odśwież stronę.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const pageWidth = 297; const pageHeight = 210;
        const cellWidth = pageWidth / 4; const cellHeight = pageHeight / 2;

        // Linie pomocnicze gięcia
        doc.setStrokeColor(210, 210, 210); doc.setLineWidth(0.1);
        doc.line(cellWidth, 0, cellWidth, pageHeight); doc.line(cellWidth * 2, 0, cellWidth * 2, pageHeight);
        doc.line(cellWidth * 3, 0, cellWidth * 3, pageHeight); doc.line(0, cellHeight, pageWidth, cellHeight);

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

                doc.setFont(pdfFont, 'bold'); doc.setFontSize(pageData.fontSize);
                const maxTextWidth = cellWidth - 10;
                const lines = doc.splitTextToSize(pageData.text, maxTextWidth);
                const lineHeightInMm = (pageData.fontSize * 0.3527) * 1.25;
                const totalTextHeight = lines.length * lineHeightInMm;
                const startY = y + (cellHeight / 2) - (totalTextHeight / 2) + (lineHeightInMm / 1.4);

                lines.forEach((line, lineIdx) => {
                    doc.text(line, x + (cellWidth / 2), startY + (lineIdx * lineHeightInMm), { align: 'center' });
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
                    sx = totalMissingWidthOriginal * ((100 - pageData.cropPercent) / 100);
                    sw = canvas.width / scaleFactor;
                    sh = img.height;
                } else {
                    const scaleFactor = canvas.width / img.width;
                    const totalMissingHeightOriginal = img.height - (canvas.height / scaleFactor);
                    sy = totalMissingHeightOriginal * ((100 - pageData.cropPercent) / 100);
                    sw = img.width;
                    sh = canvas.height / scaleFactor;
                }

                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
                const finalImgData = canvas.toDataURL('image/jpeg', 0.9);

                if (cell.isRotated) {
                    const centerX = x + cellWidth / 2; const centerY = y + cellHeight / 2;
                    doc.saveGraphicsState();
                    doc.getCoordinateMatrix().translate(centerX, centerY).rotate(Math.PI).translate(-centerX, -centerY);
                    doc.addImage(finalImgData, 'JPEG', x, y, cellWidth, cellHeight);
                    doc.restoreGraphicsState();
                } else {
                    doc.addImage(finalImgData, 'JPEG', x, y, cellWidth, cellHeight);
                }
            }
        });

        doc.save('inteligentny-zine.pdf');
    } catch (error) {
        alert("Wystąpił nieoczekiwany błąd podczas generowania PDF: " + error.message);
        console.error(error);
    }
});

updatePreview();