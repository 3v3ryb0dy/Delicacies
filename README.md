# Kochbuch der Delikatessen

> Gestaltete Fassung mit Suche, Filtern und Druckansicht: **[https://cook.drng.me/](https://cook.drng.me/)**

Dieses Kochbuch enthält eine bunte Sammlung einzigartig leckerer Delikatessen und Speisen.

Bei den aufgeführten Anleitungen handelt es sich um über Jahre gesammelte Rezepte, die sich bewährt haben und
somit ihren Platz in dieser Sammlung verdienen.

Haben Sie Rezeptvorschläge, die unbedingt hier aufgenommen werden sollten, senden Sie diese gerne ein.

## Rezepte

46 Rezepte, jedes als eigene Markdown-Datei in [`recipes/`](recipes).
Diese Übersicht wird beim Build aus den Rezeptdateien erzeugt. Bitte nicht von Hand bearbeiten.

### Vorspeisen (4)

- [Mauritius-Krabbencocktail](recipes/mauritius-krabbencocktail.md) _(in Arbeit)_
- [Räucherforellencreme mit Apfel und Meerrettich](recipes/raeucherforellencreme.md) _(in Arbeit)_
- [Rote-Bete-Carpaccio mit Apfel und Walnüssen](recipes/rote-bete-carpaccio.md) _(in Arbeit)_
- [Thymianpilze auf Zitronenricotta mit brauner Butter](recipes/thymianpilze-auf-zitronenricotta.md) _(in Arbeit)_

### Hauptgerichte (10)

- [Bouletten](recipes/bouletten.md)
- [Bouletten (vegetarisch)](recipes/vegetarische-bouletten.md)
- [Dicker Eierkuchen](recipes/dicker-eierkuchen.md)
- [Flammkuchen](recipes/flammkuchen.md)
- [Hähnchen in Metaxasauce](recipes/haehnchen-in-metaxasauce.md)
- [Halloumi auf Ofengemüse](recipes/halloumi-auf-ofengemuese.md)
- [Ochsenbäckchen (geschmort)](recipes/ochsenbaeckchen.md)
- [Pad Thai](recipes/pad-thai.md)
- [Pizza (Basis)](recipes/pizza.md) _(in Arbeit)_
- [Wurzeltaler mit Dip](recipes/wurzeltaler.md) _(in Arbeit)_

### Desserts (1)

- [Cheesecake im Glas](recipes/cheesecake-im-glas.md) _(in Arbeit)_

### Beilagen (8)

#### Gemüse

- [Brokkoli (gebraten)](recipes/brokkoli.md)
- [Karotten](recipes/karotten.md)
- [Rosenkohl (gebacken)](recipes/rosenkohl.md)
- [Rotkohl](recipes/rotkohl.md)
- [Spitzkohl mit Senfrahm und Butterbröseln](recipes/spitzkohl-mit-senfrahm.md) _(in Arbeit)_

#### Sättigungsbeilagen

- [Kartoffelgratin](recipes/kartoffelgratin.md) _(in Arbeit)_
- [Kretanische Kartoffeln](recipes/kretanische-kartoffeln.md) _(in Arbeit)_
- [Warmer Kartoffelsalat](recipes/warmer-kartoffelsalat.md)

### Kuchen (3)

- [Apfel-Streuselkuchen](recipes/apfel-streuselkuchen.md) _(in Arbeit)_
- [Hefekuchen (Bienenstich)](recipes/hefekuchen.md)
- [Selterswasserkuchen](recipes/selterswasserkuchen.md)

### Torten (0)

_Noch keine Rezepte. Hier ist Platz für Neues._

### Gebäck (0)

_Noch keine Rezepte. Hier ist Platz für Neues._

### Brot / Brötchen (4)

- [Bhatura (Indisches Ballonbrot)](recipes/bhatura.md)
- [Burger Buns](recipes/burger-buns.md)
- [Cloud Burger Buns](recipes/cloud-burger-buns.md) _(in Arbeit)_
- [Simit](recipes/simit.md)

### Saucen / Dips / Dressings (9)

- [American Burger Sauce](recipes/american-burger-sauce.md)
- [Balsamico Honig Dressing](recipes/balsamico-honig-dressing.md)
- [Big Mac Sauce](recipes/big-mac-sauce.md)
- [Bohnen Hummus](recipes/bohnen-hummus.md)
- [Maracuja-Limetten-Dressing](recipes/maracuja-limetten-dressing.md)
- [Marinade (Grillfleisch)](recipes/marinade.md)
- [Mayonnaise](recipes/mayonnaise.md)
- [Remoulade](recipes/remoulade.md)
- [Senfbutter](recipes/senfbutter.md) _(in Arbeit)_

### Salate (1)

- [Farfallesalat (italienisch)](recipes/farfallesalat.md) _(in Arbeit)_

### Suppen (4)

- [Karottensüppchen](recipes/karottensueppchen.md) _(in Arbeit)_
- [Käse-Lauch-Suppe](recipes/kaese-lauch-suppe.md)
- [Pastinakensuppe](recipes/pastinakensuppe.md)
- [Rosmarin-Kartoffel-Senf-Süppchen](recipes/rosmarin-kartoffel-senf-sueppchen.md) _(in Arbeit)_

### Getränke (1)

- [Mango Lassi](recipes/mango-lassi.md)

### Sonstiges (1)

- [Tempura Teig (knusprig)](recipes/tempura-teig.md)

## Rezept hinzufügen

1. Neue Datei `recipes/mein-rezept.md` anlegen, Dateiname bestimmt die Adresse.
2. Kopf ausfüllen: `title`, `category` (siehe oben), `tags` und optional `image`.
3. `## Zutaten` und `## Zubereitung` schreiben, Bilder nach `recipes/images/` (Prompt-Vorlage: [Image Generation](docs/image-generation.md)).
   PNG, JPG und JPEG sind möglich. `image: images/mein-rezept` funktioniert ohne Dateiendung; beim Formatwechsel wird eine passende Datei automatisch gesucht.
   Ungetestete Rezepte mit `wip: true` markieren: Sie sind standardmäßig ausgeblendet und lassen sich über „Ungetestete Rezepte anzeigen“ einblenden. Die Auswahl wird im Browser gespeichert. Nach dem Testen `wip` entfernen oder auf `false` setzen.
4. `npm run build` ausführen. Übersicht und README entstehen automatisch.

## Ideen

Rezepte, die noch ausprobiert werden wollen: [Ideen](https://cook.drng.me/ideen/)
