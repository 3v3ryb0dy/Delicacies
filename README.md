# Kochbuch der Delikatessen

> Gestaltete Fassung mit Suche, Filtern und Druckansicht: **[https://cook.drng.me/](https://cook.drng.me/)**

Dieses Kochbuch enthält eine bunte Sammlung einzigartig leckerer Delikatessen und Speisen.

Bei den aufgeführten Anleitungen handelt es sich um über Jahre gesammelte Rezepte, die sich bewährt haben und
somit ihren Platz in dieser Sammlung verdienen.

Haben Sie Rezeptvorschläge, die unbedingt hier aufgenommen werden sollten, senden Sie diese gerne ein.

## Rezepte

21 Rezepte, jedes als eigene Markdown-Datei in [`recipes/`](recipes).
Diese Übersicht wird beim Build aus den Rezeptdateien erzeugt. Bitte nicht von Hand bearbeiten.

### Vorspeisen (0)

_Noch keine Rezepte. Hier ist Platz für Neues._

### Hauptgerichte (4)

- [Flammkuchen](recipes/flammkuchen.md)
- [Ochsenbäckchen (geschmort)](recipes/ochsenbaeckchen.md)
- [Pad Thai](recipes/pad-thai.md)
- [Pizza (Basis)](recipes/pizza.md)

### Desserts (0)

_Noch keine Rezepte. Hier ist Platz für Neues._

### Beilagen (2)

#### Gemüse

- [Rosenkohl (gebacken)](recipes/rosenkohl.md)
- [Rotkohl](recipes/rotkohl.md)

#### Sättigungsbeilagen

_Noch keine Rezepte._

### Kuchen (1)

- [Hefekuchen (Bienenstich)](recipes/hefekuchen.md)

### Torten (0)

_Noch keine Rezepte. Hier ist Platz für Neues._

### Gebäck (0)

_Noch keine Rezepte. Hier ist Platz für Neues._

### Brot / Brötchen (2)

- [Bhatura (Indisches Ballonbrot)](recipes/bhatura.md)
- [Burger Buns](recipes/burger-buns.md)

### Saucen / Dips / Dressings (7)

- [American Burger Sauce](recipes/american-burger-sauce.md)
- [Balsamico Honig Dressing](recipes/balsamico-honig-dressing.md)
- [Big Mac Sauce](recipes/big-mac-sauce.md)
- [Bohnen Hummus](recipes/bohnen-hummus.md)
- [Marinade (Grillfleisch)](recipes/marinade.md)
- [Mayonnaise](recipes/mayonnaise.md)
- [Remoulade](recipes/remoulade.md)

### Salate (1)

- [Farfallesalat (italienisch)](recipes/farfallesalat.md) _(in Arbeit)_

### Suppen (2)

- [Käse-Lauch-Suppe](recipes/kaese-lauch-suppe.md)
- [Pastinakensuppe](recipes/pastinakensuppe.md)

### Sonstiges (2)

- [Tempura Teig (knusprig)](recipes/tempura-teig.md)
- [Vegetarische Bouletten](recipes/vegetarische-bouletten.md)

## Rezept hinzufügen

1. Neue Datei `recipes/mein-rezept.md` anlegen, Dateiname bestimmt die Adresse.
2. Kopf ausfüllen: `title`, `category` (siehe oben), `tags` und optional `image`.
3. `## Zutaten` und `## Zubereitung` schreiben, Bilder nach `recipes/images/` (Prompt-Vorlage: [Image Generation](docs/image-generation.md)).
   PNG, JPG und JPEG sind möglich. `image: images/mein-rezept` funktioniert ohne Dateiendung; beim Formatwechsel wird eine passende Datei automatisch gesucht.
4. `npm run build` ausführen. Übersicht und README entstehen automatisch.

## Ideen

Rezepte, die noch ausprobiert werden wollen: [Ideen](https://cook.drng.me/ideen/)
