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

---

## 3. Plany Rozwojowe i Nadchodzące Funkcje

### 3.1. Zaawansowane Systemy Passe-partout (Rozwinięcie 3.5)
* Implementacja wyboru koloru passe-partout (Białe / Czarne).
* **Asymetryczne Przesunięcie Y:** Możliwość przesuwania zdjęcia w pionie wewnątrz pola strony (np. większy margines dolny dla eleganckiego looku albumowego).

### 3.2. Podpisy (Captions)
* Opcjonalne pola tekstowe pod zdjęciami (na marginesie białym) pisane stałym, dyskretnym stopniem pisma (9-10pt).

### 3.3. Interaktywna Wizualizacja Finalna (Zine Preview)
* Moduł pozwalający na podejrzenie zina w formie cyfrowej "książeczki" (strona po stronie w kolejności 1-8) przed eksportem do PDF.

---

## 4. Baza Wiedzy i Rozwiązywanie Problemów

### 4.1. Poprawka Skalowania Czcionki w jsPDF
* **Rozwiązanie:** Wdrożenie przelicznika `0.65` dla rozmiaru oraz kalkulatora interlinii opartego na milimetrach (`1 pt = 0.3527 mm`).

### 4.2. Synchronizacja Layoutu (Race Condition)
* **Rozwiązanie:** Zastosowanie `requestAnimationFrame` oraz nasłuchiwania `onload` dla obrazów, aby zapewnić, że obliczenia wymiarów kontenera (clipping) następują po pełnym wyrenderowaniu DOM.

### 4.3. Problem "Białego Ekranu" (Shadow Overflow)
* **Rozwiązanie:** Zamiana masywnych cieni typu spread na bezpieczne `inset box-shadow: 5mm`, co zapobiega zakrywaniu elementów interfejsu poza siatką makiety.

---

## 5. Aktualna Struktura Stanu Aplikacji (`zineState`)

```javascript
const zineState = {
    config: {
        paperFormat: "A4"       // "A4" | "LETTER"
    },
    // Strona 1: Okładka Przednia
    1: { 
        isCover: true, 
        text: "MÓJ ZIN", 
        subtitle: "Podtytuł",
        imgObject: null, 
        cropPercent: 50,
        photoSize: 100,
        // ... parametry fontu
    },
    // Strony 2-8
    2: {
        isCover: false,
        imgObject: null,
        cropPercent: 50,
        photoSize: 100,
        cropMode: 'X' // 'X' | 'Y' (Auto-detected)
    }
};
```

---

## 6. Metadane Projektu

* **Nazwa:** PhotoZineForge
* **Wersja:** v2.1.0 (Current Stable)
* **Autor:** Zbigniew Pietras
* **Technologie:** HTML5, CSS3 (Grid/Isolation), JS (ES6+), jsPDF.
