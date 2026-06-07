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

        // NAPRAWIONO: Zmiana setStrokeColor na setDrawColor zgodną z najnowszym jsPDF
        doc.setDrawColor(210, 210, 210); 
        doc.setLineWidth(0.1);
        
        // Rysowanie linii pomocniczych siatki zina
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

        // Wymuszenie pobrania pliku przez przeglądarkę
        doc.save('inteligentny-zine.pdf');
    } catch (error) {
        alert("Wystąpił nieoczekiwany błąd podczas generowania PDF: " + error.message);
        console.error(error);
    }
});

// Inicjalizacja podglądu na starcie
updatePreview();