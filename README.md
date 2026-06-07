# PhotoZineForge // A4 ✂️📸

**PhotoZineForge** to lekkie, minimalistyczne narzędzie webowe służące do automatycznego składu i impozycji (rozłożenia składek na arkuszu) mikro-photo-zinów. Aplikacja pozwala na szybkie przygotowanie 8-stronicowej autorskiej publikacji fotograficznej z jednego arkusza papieru formatu A4, zadrukowanego jednostronnie.

Aplikacja działa w 100% w przeglądarce użytkownika (client-side) – zdjęcia nie są wysyłane na żaden serwer zewnętrzny, co gwarantuje pełną prywatność i błyskawiczne działanie.

---

## 🚀 Główne Funkcje

* **Automatyczna Impozycja Drukarska:** Narzędzie automatycznie obraca i układa strony (w tym strony odwrócone "do góry nogami" na arkuszu) zgodnie z technicznym schematem składania zinu z jednej kartki.
* **Podgląd w Czasie Rzeczywistym:** Dynamiczny podgląd całego arkusza makiety podczas wgrywania zdjęć oraz edycji okładki.
* **Zaawansowane Kadrowanie (Zintegrowany Slider):** Automatyczna detekcja proporcji wgranych plików i inteligentne dopasowanie osi przewijania kadru (pionowe lub poziome) w zależności od orientacji zdjęcia.
* **Personalizacja Okładki:** Możliwość wpisania wielolinijkowego tekstu, wyboru krojów pisma (Sans-Serif, Serif, Monospace) oraz szybkiej zmiany motywu kolorystycznego (jasny/ciemny).
* **Eksport do Standardu DTP (PDF):** Generowanie gotowego do druku pliku PDF w przestrzeni wektorowej o wysokiej jakości za pomocą biblioteki `jsPDF`.

---

## 📁 Struktura Projektu

Projekt został zorganizowany zgodnie z dobrymi praktykami separacji kodu (Separation of Concerns):

```text
photo-zine-forge/
├── index.html          # Struktura interfejsu użytkownika (DOM)
├── style.css           # Warstwa wizualna i responsywność (CSS Variables)
├── app.js              # Logika biznesowa, obsługa stanów, Canvas i eksport PDF
└── instrukcja.jpg      # Graficzny schemat techniczny składania zina
