# Dokumentacja i Kompendium Projektu: PhotoZineForge 🧠🤖

Niniejszy plik `GEMINI.md` stanowi oficjalną dokumentację techniczną, rejestr zmian (Changelog) oraz bazę wiedzy projektu **PhotoZineForge**. Jest to kompletny zapis ewolucji oprogramowania, decyzji architektonicznych oraz planów rozwojowych, wypracowany wspólnie przez **Zbigniewa Pietrasa** (Autora projektu) oraz **Gemini** (Asystenta AI ds. Architektury i DTP).

# Dokumentacja i Kompendium Projektu: PhotoZineForge 🧠🤖

Niniejszy plik `GEMINI.md` stanowi oficjalną dokumentację techniczną, rejestr zmian (Changelog) oraz bazę wiedzy projektu **PhotoZineForge**. Jest to kompletny zapis ewolucji oprogramowania, decyzji architektonicznych oraz planów rozwojowych, wypracowany wspólnie przez **Zbigniewa Pietrasa** (Autora projektu) oraz **Gemini** (Asystenta AI ds. Architektury i DTP).

---

## 1. O Aplikacji (Idea i Założenia)

**PhotoZineForge** to wyspecjalizowane, lekkie narzędzie webowe służące do automatycznego składu i impozycji (elektronicznego rozłożenia stron na arkuszu drukarskim) mikro-zinów fotograficznych (*photo-zines*). 

Aplikacja opiera się na genialnym w swojej prostocie, klasycznym formacie **8-page zine**. Pozwala ona użytkownikowi na stworzenie kompletnej, 8-stronicowej publikacji (wliczając okładkę oraz stronę tylną) z **jednego arkusza papieru zadrukowanego jednostronnie**.

### 🧩 Istota Problemu DTP (Dlaczego ta aplikacja jest potrzebna?)
Ręczne przygotowanie pliku do druku w takim formacie jest niezwykle trudne dla osób niemających doświadczenia w poligrafii. Aby po wydrukowaniu, nacięciu na środku i odpowiednim złożeniu strony układały się w prawidłowej kolejności, na arkuszu drukarskim muszą zostać rozmieszczone w specyficznej, nieliniowej konfiguracji (tzw. składka drukarska). Co więcej, **cztery strony z górnego rzędu muszą zostać obrócone o 180° (do góry nogami)**, aby po finalnym złamaniu papieru tekst i obrazy nie były odwrócone.

**PhotoZineForge rozwiązuje ten problem całkowicie automatycznie:** użytkownik wprowadza treści i zdjęcia w liniowym, intuicyjnym edytorze (Strona 1, Strona 2, ..., Strona 8), a silnik aplikacji w czasie rzeczywistym buduje prawidłowy matematycznie arkusz impozycji i generuje wektorowy plik do druku.

### 🔒 Prywatność i Technologia
Aplikacja działa w 100% po stronie klienta (**client-side** / Vanilla JavaScript). Zdjęcia wgrywane przez użytkownika są przetwarzane wyłącznie w pamięci podręcznej przeglądarki przy użyciu standardu HTML5 Canvas i struktury Blob. Żaden plik nie jest wysyłany na serwery zewnętrzne, co zapewnia pełne bezpieczeństwo danych i prywatność twórcy.

---

## 2. Funkcjonalności Zrealizowane (Wersja v1.0.0)

Wersja bazowa (MVP) uregulowała kluczowe mechanizmy renderowania i interfejsu:

* **Matryca impozycji drukarskiej:** Wdrożenie asynchronicznego silnika mapowania układu stron na bazie tablicy dystrybucyjnej:
    * *Rząd górny (odwrócony o 180°):* Strona 7 (inside back cover), Strona 6, Strona 5, Strona 4.
    * *Rząd dolny (orientacja standardowa):* Strona 8 (back cover), Strona 1 (front cover), Strona 2 (inside front cover), Strona 3.
* **Wizualny kreator i podgląd live:** Dwu-kolumnowy interfejs (SaaS UI) łączący panel boczny z formularzami oraz okno robocze (*workspace*) z dynamicznie odświeżanym podglądem siatki arkusza.
* **Inteligentna Ddetekcja kadrów:** System automatycznie bada proporcje (proporcje boku X do Y) wgrywanych fotografii i porównuje je z docelowym oknem strony. Na tej podstawie decyduje, czy uaktywnić suwak kadrowania w poziomie (oś X dla zdjęć panoramicznych), czy w pionie (oś Y dla zdjęć portretowych).
* **Sygnalizacja stanu stron:** Wdrożenie algorytmu sprawdzającego stan zapełnienia stron. Każda strona bez wgranego zdjęcia świeci się w panelu bocznym na ostrzegawczy, ciemnoczerwony kolor, a po poprawnym załadowaniu grafiki zmienia barwę na głęboką zieleń HSL (`hsl(150, 68%, 9%)`), co daje użytkownikowi jasną informację zwrotną.
* **Eksport do wektorowego PDF:** Integracja z biblioteką `jsPDF`. Generowanie czystego dokumentu w formacie Landscape, automatyczne rysowanie technicznych linii cięcia o szerokości `0.1 mm` i kompresja bitmap do formatu JPEG (jakość 95%).
* **Wbudowana instrukcja składania:** Dodanie sekcji pomocy z opisem krok po kroku oraz dedykowaną grafiką `instrukcja.jpg` pokazującą technikę nacinania i gięcia arkusza.

---

## 3. Nowe Funkcjonalności i Architektura (Rozwój w Wersji v2.0.0)

Wersja v2.0.0 rozbudowuje aplikację o zaawansowane funkcje interaktywne, wieloformatowość oraz nowe standardy kompozycji i nawigacji makietowej.

### 3.1. Interaktywny System Reorganizacji Układu (Drag & Drop)
Użytkownik zyskuje możliwość dynamicznego zarządzania sekwencją narracji wizualnej z poziomu makiety podglądu arkusza.
* **Zasada działania:** Komórki makiety zawierające wczytane zdjęcia stają się elementami przeciągalnymi (`draggable="true"`). Użytkownik może chwycić myszką dowolne zdjęcie i przeciągnąć je na obszar innej strony w layoucie.
* **Logika zamiany (Swap):** Silnik aplikacji przechwytuje zdarzenia `dragstart`, `dragover` i `drop`, po czym dokonuje asynchronicznej zamiany właściwości (obiektów plików, ścieżek źródłowych, ustawień kadrowania i podpisów) między dwoma indeksami w obiekcie stanu `zineState`. Po upuszczeniu elementu interfejs i panel boczny automatycznie odświeżają się, zachowując spójność danych.

### 3.2. Podgląd Nawigacyjny i Identyfikacja Stron (Overlay)
Aby zapobiec dezorientacji użytkownika podczas pracy z odwróconą i nieliniową składką drukarską, na makiecie wdrożono system transparentnych warstw informacyjnych.
* **Wizualizacja na podglądzie:** Każda komórka w siatce makiety otrzymuje czytelną, półprzezroczystą nakładkę tekstową określającą jej docelową funkcję w gotowej książeczce:
    * Wyraźny numer strony (np. **Strona 2**, **Strona 3** itd.).
    * Dedykowane etykiety wydawnicze dla punktów skrajnych: **Front Cover** (Strona 1 - Okładka przednia) oraz **Back Cover** (Strona 8 - Okładka tylna).
* **Warunek DTP:** Wszystkie te oznaczenia oraz napisy pomocnicze są renderowane **wyłącznie w warstwie prezentacyjnej interfejsu (HTML/CSS)**. Silnik generujący plik PDF całkowicie je ignoruje, dzięki czemu końcowy arkusz wydruku pozostaje idealnie czysty i wolny od technicznych artefaktów.

### 3.3. Nowy Standard Kompozycji Tytułowego Bloku Okładki
Zgodnie z nowoczesnymi trendami estetycznymi albumów fotograficznych, struktura strony tytułowej została ujednolicona w celu zapewnienia maksymalnego kontrastu i czytelności:
* **Układ geometryczny:** Dolna część okładki (Strona 1) zostaje wydzielona na stałe pod blok tekstowy osadzony na **ciemnoszarym, jednolitym tle**.
* **Typografia:** Tytuł zina oraz umieszczony bezpośrednio pod nim podtytuł są renderowane **zawsze w kolorze białym**, gwarantując doskonałą czytelność niezależnie od kolorystyki czy jasności zdjęcia załadowanego na okładce.

### 3.4. Wieloformatowość DTP (Formaty Papieru)
Aplikacja przestaje być ograniczona wyłącznie do standardu europejskiego. W boczny panel zostaje wdrożony selektor formatu bazowego:
* **Obsługiwane formaty:**
    1. `A4` (297 x 210 mm) — standard międzynarodowy ISO.
    2. `US Letter` (11 x 8.5 cala / 279.4 x 215.9 mm) — standard rynku amerykańskiego.
* **Logika skalowania:** Wybór formatu modyfikuje zmienne proporcji w arkuszu stylów CSS (w celu dopasowania makiety na ekranie) oraz dynamicznie zmienia parametry inicjalizacyjne dokumentu w jsPDF (`format: 'a4'` vs `format: 'letter'`), automatycznie przeliczając punkty podziału i linie cięcia dla wybranego arkusza.

### 3.5. System Albumowego Passe-partout, Wysokości i Pozycji Y
* **Passe-partout:** Każda strona (2–8) posiada przełącznik `[Brak] [Białe passe-partout] [Czarne passe-partout]`, generujący ramkę wokół zdjęcia.
* **Wysokość i przesunięcie (Oś Y):** Suwaki pozwalające regulować wielkość okna zdjęcia (40-90%) oraz przesuwać je asymetrycznie w pionie w celu uzyskania eleganckich, klasycznych układów wydawniczych (np. szerszy margines dolny strony).
* **Captions (Podpisy):** Opcjonalne pola tekstowe lokowane na marginesie passe-partout, pisane stałym, dyskretnym stopniem pisma (9-10pt).

### 3.6. Mozliwość podglądu - wizualizacji - zina jako podgląd pojedyńczych stron w poprawnej kolejności
* **przykład** https://zinemaker.jill.photos

### 3.7 Rozwiązanie Problemu Marginesów Drukarki (DTP Safe Area)
Większość domowych i biurowych drukarek nie posiada funkcji fizycznego zadruku krawędziowego (tzw. druku borderless), automatycznie narzucając nienaruszalny margines techniczny sprzętu (zwykle od 3 mm do 6 mm), przez co pełnowymiarowe zdjęcia wejściowe mogłyby zostać drastycznie ucięte na krawędziach arkusza. W celu eliminacji tego błędu w aplikacji wdrożono dwupoziomowy system zabezpieczeń:
* **Rozwiązanie 1:**: Wizualny Obszar Bezpieczny (Safe Area) w Interfejsie - W trybie edycji makiety, na każdą komórkę (stronę zina) nałożona zostaje półprzezroczysta warstwa maskująca wraz z przerywaną linią pomocniczą. Pokazuje ona użytkownikowi krytyczną strefę ryzyka. Dzięki temu użytkownik – posługując się suwakami kadrowania – podświadomie i bezpiecznie przesuwa kluczowe elementy kompozycji (np. twarze, napisy, detale) w głąb bezpiecznego, ostrego konturu.
Implementacja CSS:
```.page-cell {
    position: relative;
    overflow: hidden;
}
/* Dynamiczna nakładka strefy bezpiecznej wyświetlana tylko w UI */
.page-cell::after {
    content: '';
    position: absolute;
    top: 5mm;    /* Ekwiwalent średniego marginesu błędu drukarek */
    left: 5mm;
    right: 5mm;
    bottom: 5mm;
    border: 1px dashed rgba(255, 0, 0, 0.4);
    pointer-events: none; /* Umożliwia klikanie i przeciąganie elementów pod spodem */
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.15); /* Subtelne zaciemnienie obszaru zagrożonego obcięciem */
    z-index: 10;
}
```

---

## 4. Baza Wiedzy i Rozwiązywanie Problemów (Troubleshooting)

### 4.1. Poprawka Skalowania Czcionki w jsPDF
* **Rozwiązanie:** Wdrożenie stałego przelicznika `0.65` dla rozmiaru oraz kalkulatora wysokości interlinii opartego na milimetrach (`1 pt = 0.3527 mm`), co pozwoliło wyznaczyć idealny środek geometryczny dla tekstu wielowierszowego na okładce.

### 4.2. Błąd Braku Menu i Siatki po Rozbiciu Plików
* **Rozwiązanie:** Zamknięcie całej logiki renderowania i budowania interfejsu w asynchronicznym nasłuchiwaniu na pełne załadowanie drzewa dokumentu za pomocą zdarzenia `DOMContentLoaded`.

### 4.3. Błąd Git RPC failed; HTTP 400 curl 22 podczas synchronizacji
* **Rozwiązanie:** Zwiększenie globalnego limitu bufora post-procesów HTTP w konfiguracji lokalnej Gita do 500 MB za pomocą komendy terminala:
    ```bash
    git config --global http.postBuffer 524288000
    ```

---

## 5. Zaktualizowana Struktura Stanu Aplikacji (`zineState`)

```javascript
const zineState = {
    // Globalne konfiguracje edycji v2.0.0
    config: {
        paperFormat: "A4"       // "A4" | "LETTER"
    },
    // Strona 1: Okładka Przednia (Front Cover)
    1: { 
        isCover: true, 
        text: "MÓJ ZIN", 
        subtitle: "Podtytuł albumu",
        theme: "dark-gray",      // Blok dolny na stałe ciemnoszary, teksty białe
        imgObject: null, 
        imgSrc: null,
        fontSize: 32, 
        fontFamily: "sans-serif"
    },
    // Strony wewnętrzne (2-7) oraz Okładka Tylna (8 - Back Cover)
    2: {
        isCover: false,
        imgObject: null,
        imgSrc: null,
        cropPercent: 50,
        cropMode: 'X',           // Detekcja orientacji zdjęcia
        passePartout: "none",    // "none" | "white" | "black"
        photoSize: 80,           // Wysokość zdjęcia (%)
        offsetY: 50,             // Pozycja pionowa okna (%)
        caption: ""              // Opcjonalny podpis (9-10pt)
    }
    // ... analogiczne obiekty dla stron od 3 do 8
};
```

---

## 5. Metadane Projektu

* **Nazwa Aplikacji:** PhotoZineForge
* **Wersja:** Wersja: v2.0.0 (Wersja Rozwojowa - Drag & Drop & Multi-format)
* **Autor:** Zbigniew Pietras
* **Licencja:** MIT (Open-Source, pełna swoboda modyfikacji)
* **Technologie:** Technologie: HTML5 (Drag and Drop API), CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+), jsPDF (v2.5.1).