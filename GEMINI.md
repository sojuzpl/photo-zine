# Dokumentacja i Kompendium Projektu: PhotoZineForge 🧠🤖

Niniejszy plik `GEMINI.md` stanowi oficjalną dokumentację techniczną, rejestr zmian (Changelog) oraz bazę wiedzy projektu **PhotoZineForge**. Jest to kompletny zapis ewolucji oprogramowania, decyzji architektonicznych oraz planów rozwojowych, wypracowany wspólnie przez **Zbigniewa Pietrasa** (Autora projektu) oraz **Gemini** (Asystenta AI ds. Architektury i DTP).

---

## 1. O Aplikacji (Idea i Założenia)

**PhotoZineForge** to wyspecjalizowane, lekkie narzędzie webowe służące do automatycznego składu i impozycji (elektronicznego rozłożenia stron na arkuszu drukarskim) mikro-zinów fotograficznych (*photo-zines*). 

Aplikacja pozwala na stworzenie kompletnej, 8-stronicowej publikacji (wliczając okładkę oraz stronę tylną) z **jednego arkusza papieru zadrukowanego jednostronnie**.

### 🧩 Istota Problemu DTP
Aby po wydrukowaniu, nacięciu i złożeniu strony układały się w prawidłowej kolejności, na arkuszu muszą zostać rozmieszczone w specyficznej, nieliniowej konfiguracji, gdzie górny rząd stron jest obrócony o 180°. **PhotoZineForge automatyzuje ten proces całkowicie.**

### 🔒 Prywatność i Technologia
Aplikacja działa w 100% po stronie klienta (Vanilla JavaScript). Zdjęcia są przetwarzane wyłącznie w pamięci przeglądarki (Canvas/Blob). Żadne dane nie opuszczają urządzenia użytkownika.

---

## 2. Funkcjonalności Zrealizowane (Wersja v2.0.0)

Wersja v2.0.0 rozbudowała aplikację o zaawansowane funkcje interaktywne, wieloformatowość oraz profesjonalne standardy kompozycji.

* **Interaktywny System Reorganizacji (Drag & Drop):**
    * Możliwość przeciągania zdjęć między stronami bezpośrednio na makiecie arkusza.
    * **Logika Smart Swap:** Zamianie podlegają wyłącznie warstwy wizualne (zdjęcie, kadrowanie, skala). Treści redakcyjne (Tytuł i Podtytuł okładki) pozostają na stałe zakotwiczone do Strony 1.
* **Wieloformatowość DTP (ISO A4 vs US Letter):**
    * Pełna obsługa formatów `A4` oraz `US Letter`.
    * **Skalowanie Fizyczne:** Interfejs dynamicznie dopasowuje szerokość makiety (94.07% dla Letter względem A4), aby zachować realne proporcje papieru. Silnik PDF generuje dokumenty o wymiarach zgodnych ze standardem regionalnym.
* **Unified Cover Block (Profesjonalna Strona Tytułowa):**
    * Podział okładki na sekcję obrazu (góra) oraz stały blok tekstowy na ciemnoszarym tle (dół).
    * Obsługa Tytułu (Bold) oraz Podtytułu z automatycznym centrowaniem i białą typografią.
* **System Globalnego Passe-partout i Skalowania:**
    * **Photo Size:** Suwak pozwalający na skalowanie zdjęć (40-100%) wewnątrz pola strony.
    * **Wymuszony Margines Safe Area:** Implementacja 5mm białej ramki na każdej stronie, chroniącej przed marginesami technicznymi drukarek. Wszystkie zdjęcia są automatycznie przycinane (clipping) do tego obszaru zarówno w UI, jak i w pliku PDF.
* **Podgląd Nawigacyjny (Upright Badges):**
    * Każda strona posiada czytelny numer umieszczony w lewym górnym rogu (z perspektywy widza).
    * Numery w górnym rzędzie są automatycznie "odwracane", aby pozostać czytelnymi dla użytkownika mimo rotacji samej strony.
    * Okładka posiada wyróżniony badge o wysokim kontraście.
* **Matryca Impozycji v2:** Skonfigurowana według standardu: 
    * Góra (180°): Str. 7, 6, 5, 4. 
    * Dół (0°): Str. 8, 1 (Cover), 2, 3.
* **Modernizacja UI (v2.2.1):**
    * Ujednolicenie stylistyki list rozwijanych (`select`): Wszystkie listy rozwijane otrzymały nowy, spójny styl (klasa `.custom-select`), dopasowany do reszty interfejsu (czarne obramowanie, brak zaokrągleń, niestandardowa strzałka).
    * **Zmiana etykiety przycisku PDF:** Zmieniono treść przycisku eksportu na "EKSPORTUJ ARKUSZ JAKO PDF" w celu poprawy czytelności akcji.
    * **Ujednolicenie wysokości przycisków:** Wysokość głównego przycisku wgrywania zdjęć (`.upload-btn-main`) została wyrównana do wysokości przycisków wyboru formatu (`.flat-btn`) poprzez ujednolicenie wartości `padding`.
    * **Oczyszczenie interfejsu:** Usunięto opisowy tekst znajdujący się pod głównym tytułem makiety w obszarze roboczym.
    * **Standaryzacja układu makiety:** Usunięto dynamiczne skalowanie szerokości siatki makiety, aby zachować identyczne marginesy i padding niezależnie od wybranego formatu papieru (A4/US Letter).
    * **Rozszerzona paleta kolorów tła:** Dodano nowe opcje kolorystyczne dla tła tekstu na okładce (czerwony, niebieski, zielony, pomarańczowy, purpurowy, fioletowy) dla lepszej personalizacji zina.
    * **Wyrównanie obszaru roboczego (Workspace):** Zmieniono wyrównanie pionowe głównego obszaru roboczego (tytuł + makieta) na wyrównanie do górnej krawędzi (`flex-start`) dla zapewnienia lepszego układu niezależnie od ilości treści.
    * **Przebudowa nagłówka paska bocznego (Sidebar):** Zaktualizowano układ nagłówka paska bocznego, umieszczając informacje o wersji i licencji bezpośrednio pod rokiem i nazwiskiem autora, tworząc spójną sekcję informacyjną nad przyciskiem instrukcji.
    * **Optymalizacja popupu instrukcji:** Zwiększono szerokość popupu z instrukcją składania do 80% szerokości okna przeglądarki oraz dodano możliwość przewijania (scroll) dla zawartości przekraczającej 80% wysokości okna.
* **Modernizacja UI (v2.1.2):**
    * **System Ikon SVG:** Zastąpienie tekstowych ikon (emoji) profesjonalnymi plikami SVG dla wszystkich kontrolek wyrównania (align, valign).
    * **Inteligentny Kontrast:** Implementacja filtra `invert(1)` w CSS dla aktywnych przycisków, zapewniająca doskonałą czytelność ikon na ciemnym tle.
    * **Optymalizacja Layoutu:** Ujednolicenie układu przycisków pozycjonowania (H/V) do spójnej siatki poziomej, poprawiające ergonomię panelu bocznego.
* **Modernizacja UI (v2.1.1):**
    * **Cover Overlay System:** Przejście z dzielonego układu okładki (obraz/tekst) na system nakładki (overlay). Tytuł i podtytuł są teraz umieszczone bezpośrednio na zdjęciu, które zajmuje pełną powierzchnię strony.
    * **Proporcjonalne Passe-partout Tekstu:** Wprowadzenie dynamicznego marginesu wewnętrznego (padding) dla bloku tekstu na okładce, który skaluje się wraz z rozmiarem czcionki, zapewniając spójność wizualną z podpisami na pozostałych stronach.
    * **Zoptymalizowana Impozycja Okładki:** Pełna synchronizacja krowania (crop) i skalowania zdjęć na okładce zarówno w UI, jak i w silniku PDF.
* **Modernizacja UI (v2.1.0):**
    * **Black & White Aesthetic:** Przejście na minimalistyczny, kontrastowy interfejs (czarno-biały) zgodny ze standardami wydawniczymi.
    * **Zoptymalizowany Panel Boczny:** Zastąpienie długiej listy kart sekcjami funkcyjnymi (Format, Zdjęcia, Okładka, QR, Podpisy, Filtry).
    * **System Masowego Uploadu:** Możliwość wczytania do 8 zdjęć naraz z automatycznym przypisaniem do kolejnych stron.
    * **Interaktywna Makieta v2:** Bezpośrednie wgrywanie zdjęć poprzez kliknięcie w komórkę siatki oraz szybkie usuwanie (przycisk 'x').
    * **Zaawansowane Pozycjonowanie Okładki:** Pełna kontrola nad wyrównaniem bloku tekstowego (H: Lewo/Środek/Prawo, V: Góra/Środek/Dół) oraz kolorystyką (Brak/Czarny/Biały dla tła).
    * **Lokalne Kody QR:** Generowanie kodów QR bezpośrednio w przeglądarce (strona 8) z możliwością pozycjonowania.
    * **Globalny Filtr Monochromatyczny:** Jeden przełącznik zmieniający wszystkie zdjęcia w projekcie na wersję czarno-białą (UI i PDF).
    * **System Podpisów (Captions):** Dodawanie dyskretnych opisów pod zdjęciami na stronach 2-8 z kontrolą wyrównania.

---

## 3. Plany Rozwojowe i Nadchodzące Funkcje

### 3.1. Zaawansowane Systemy Passe-partout (Rozwinięcie 3.5)
* Implementacja wyboru koloru passe-partout (Białe / Czarne).
* **Asymetryczne Przesunięcie Y:** Możliwość przesuwania zdjęcia w pionie wewnątrz pola strony (np. większy margines dolny dla eleganckiego looku albumowego).

### 3.2. Podpisy (Rozwinięte w v2.1.0)
* Zrealizowane w systemie Captions.

### 3.3. Interaktywna Wizualizacja Finalna (Zine Preview) 
* Moduł pozwalający na podejrzenie zina w formie cyfrowej "książeczki" (strona po stronie w kolejności 1-8) przed eksportem do PDF.
* moduł powinnien pojawić się w popup'ie z opcją przewijania stron

### 3.4. Zmiana informacji o formacie w <div class="workspace-header">
* Zrealizowane w v2.1.0.

### 3.10. English version of application (v2.2.0)

### 3.11. Dodanie ikonki aplikacji dla przeglądarek mobilnych i stacjonarnych (ikonka pojawia się w zakładce strony)

---
---

## 4. Baza Wiedzy i Rozwiązywanie Problemów

### 4.1. Poprawka Skalowania Czcionki w jsPDF
* **Rozwiązanie:** Wdrożenie przelicznika `0.65` dla rozmiaru oraz kalkulatora interlinii opartego na milimetrach (`1 pt = 0.3527 mm`).

### 4.2. Synchronizacja Layoutu (Race Condition)
* **Rozwiązanie:** Zastosowanie `requestAnimationFrame` oraz nasłuchiwania `onload` dla obrazów, aby zapewnić, że obliczenia wymiarów kontenera (clipping) następują po pełnym wyrenderowaniu DOM.

### 4.3. Problem "Białego Ekranu" (Shadow Overflow)
* **Rozwiązanie:** Zamiana masywnych cieni typu spread na bezpieczne `inset box-shadow: 5mm`, co zapobiega zakrywaniu elementów interfejsu poza siatką makiety.

### 4.4. Obsługa QR i Captions w PDF (v2.1.0)
* **Rozwiązanie:** Zastosowanie `setTimeout` przy eksporcie PDF, aby zapewnić synchronizację z generatorem QRCode.js oraz implementacja renderowania podpisów wewnątrz Safe Area.

### 4.6. Poprawka utraty fokusu pola QR Code URL oraz ulepszenie renderowania QR
* **Fokus:** Modyfikacja funkcji `handleQR` w celu pominięcia funkcji `renderEditors()` podczas aktualizacji pola tekstowego adresu URL, co zapobiega przeładowywaniu DOM i utracie fokusu podczas wpisywania adresu.
* **Jakość, rozmiar i wyrównanie (v2.2.0):**
    * Przejście na bibliotekę **EasyQRCodeJS** (renderowanie wysokiej rozdzielczości 1024x1024px do **Canvas**), co zapewnia najwyższą jakość w pliku PDF oraz na ekranie podglądu.
    * Wprowadzono kontrolę rozmiaru kodu QR z predefiniowanymi wartościami (20, 27, 35, 40 mm). Podgląd interaktywny w aplikacji został zaktualizowany, aby poprawnie odzwierciedlać wybrany rozmiar.
    * Poprawiono logikę wyrównania: kod QR jest teraz centrowany względem swojego środka geometrycznego, a nie lewego górnego rogu.

### 4.5. Poprawka Kadrowania Okładki (v2.1.1)
* **Rozwiązanie:** Zsynchronizowanie logiki obliczania `cropMode` (X/Y) dla okładki we wszystkich metodach uploadu (`handleSingleFile`, `handleBulkFile`). Poprzednia wersja używała nieaktualnych proporcji (0.65 wysokości), co blokowało poprawne przesuwanie obrazu po przejściu na system pełnostronicowego Overlay'u.

---

## 5. Aktualna Struktura Stanu Aplikacji (`zineState`)

```javascript
const zineState = {
    config: {
        paperFormat: "A4",       // "A4" | "LETTER"
        globalMonochrome: false,
        qrCode: { url: "", enabled: false, alignH: "center", alignV: "bottom" }
    },
    // Strona 1: Okładka Przednia
    1: { 
        isCover: true, 
        text: "MÓJ ZIN", 
        subtitle: "Podtytuł",
        imgObject: null, 
        cropPercent: 50,
        photoSize: 100,
        alignH: "center",
        alignV: "bottom",
        textColor: "white",
        textBgColor: "black"
    },
    // Strony 2-8
    2: {
        isCover: false,
        imgObject: null,
        cropPercent: 50,
        photoSize: 100,
        cropMode: 'X',
        caption: "",
        captionAlignH: "center"
    }
};
```

---

## 7. Aktywne Błędy i Problemy Techniczne (Technical Debt)

### 7.1. Niezgodność Wyrównania Tekstu w PDF (Captions & Cover)
* **Status:** Poprawiono (Captions).
* **Opis:** Tekst podpisów (Captions) na stronach odwróconych o 180° był błędnie umieszczany przy zgięciu (fold). Został przesunięty do krawędzi zewnętrznej (edge) dla spójności z pozostałymi stronami.

### 7.2. Ograniczenia techniczne: Brak wsparcia dla PDF/X
* **Status:** Ograniczenie biblioteczne.
* **Opis:** Biblioteka `jsPDF` nie obsługuje natywnie standardów zgodności z drukiem (PDF/X, PDF/A), co jest wymogiem wielu profesjonalnych drukarni.
* **Obejście:** Wymagane jest post-processing wygenerowanego pliku PDF za pomocą zewnętrznych narzędzi (np. Ghostscript, Adobe Acrobat) w celu przekonwertowania go do standardu PDF/X-1a:2001.

### 7.4. Poprawka renderowania kolorowego tła tekstu w PDF
* **Status:** Zrealizowane.
* **Opis:** Naprawiono błąd, przez który nowe kolory tła tekstu na okładce (czerwony, niebieski, zielony, pomarańczowy, purpurowy, fioletowy) renderowały się jako białe w eksporcie PDF. Centralizacja definicji kolorów w `app.js` zapewniła spójność między podglądem a wygenerowanym plikiem PDF.


---

## 8. Metadane Projektu

* **Nazwa:** PhotoZineForge
* **Wersja:** v2.2.3 (Current Stable)
* **Autor:** Zbigniew Pietras
* **Technologie:** HTML5, CSS3, JS (ES6+), jsPDF, EasyQRCodeJS.

