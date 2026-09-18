export type IngredientTip = {
  id: string
  title: string
  aliases: readonly string[]
  intro: string
  points: readonly { label?: string; text: string }[]
  note?: string
  /** Editorial references, retained here rather than adding links to the cooking UI. */
  sources: readonly { title: string; url: string }[]
}

/** Curated knowledge: aliases only attach tips explicitly selected by a recipe. */
export const ingredientTips = [
  {
    id: 'reis-waschen',
    title: 'Reis waschen: ja oder nein?',
    aliases: [
      'Reis',
      'Basmatireis',
      'Basmati',
      'Jasminreis',
      'Jasmin',
      'Sushireis',
      'Sushi-Reis',
      'Milchreis',
      'Risottoreis',
      'Arborio',
      'Carnaroli'
    ],
    intro: 'Ob Reis gewaschen wird, hängt von Sorte und Gericht ab. Dabei wird lose Oberflächenstärke entfernt.',
    points: [
      { label: 'Basmati und Jasmin', text: 'In der Regel waschen, damit die Körner beim Garen lockerer bleiben.' },
      {
        label: 'Sushireis',
        text: 'Ebenfalls waschen. Überschüssige Oberflächenstärke wird abgespült, die gewünschte Bindung bleibt erhalten.'
      },
      { label: 'Milchreis', text: 'Üblicherweise nicht waschen: Die Stärke bindet die Milch cremig.' },
      {
        label: 'Risottoreis',
        text: 'Arborio und Carnaroli normalerweise ungewaschen verwenden, damit die Stärke im Gericht bleibt.'
      }
    ],
    note: 'Mit kaltem Wasser sanft bewegen und das Wasser wechseln, bis es deutlich klarer bleibt. Gut abtropfen lassen. Waschen ist kein Einweichen. Rezept- und Packungsangaben gehen vor, besonders bei vorbehandeltem Reis.',
    sources: [
      {
        title: 'Reishunger: Reis richtig waschen',
        url: 'https://www.reishunger.de/wissen/article/145/reis-richtig-waschen'
      }
    ]
  },
  {
    id: 'pilze-braten',
    title: 'Wie werden Pilze schön braun?',
    aliases: ['Pilze', 'Champignons', 'Austernpilze', 'Austernpilzen', 'Pfifferlinge', 'Pfifferlingen'],
    intro: 'Pilze brauchen Platz. In einer vollen Pfanne sammelt sich Flüssigkeit und sie dünsten im eigenen Saft.',
    points: [
      {
        text: 'Schmutz abbürsten oder feucht abwischen. Bei Bedarf kurz abspülen und gründlich trocknen.'
      },
      {
        text: 'Eine breite Pfanne mit etwas Fett erhitzen. Pilze in einer Lage, größere Mengen portionsweise braten.'
      },
      {
        text: 'Liegen lassen, bis die Unterseite Farbe bekommt. Wenden und fertig braten. Ausgetretenes Wasser verdampfen lassen, bevor Saucenflüssigkeit dazukommt.'
      }
    ],
    note: 'Knoblauch erst bei reduzierter Hitze zugeben, damit er nicht verbrennt.',
    sources: [
      {
        title: 'Good Food: How to cook mushrooms',
        url: 'https://www.bbcgoodfood.com/howto/guide/how-to-cook-mushrooms'
      }
    ]
  },
  {
    id: 'avocado-schneiden',
    title: 'Avocado entkernen und schneiden',
    aliases: ['Avocado', 'Avocados'],
    intro: 'Eine reife Avocado gibt auf sanften Druck nach. In Vierteln lässt sich der Kern leicht lösen.',
    points: [
      {
        text: 'Avocado waschen, trocknen und aufs Brett legen. Längs um den Kern einschneiden. Um eine Vierteldrehung drehen und nochmals längs einschneiden.'
      },
      { text: 'Viertel vorsichtig auseinanderlösen und den Kern mit den Fingern herausnehmen.' },
      { text: 'Schale abziehen. Fruchtfleisch auf dem Brett in Scheiben oder Würfel schneiden.' }
    ],
    note: 'Kurz vor dem Servieren schneiden. Etwas Zitronen- oder Limettensaft verlangsamt das Braunwerden.',
    sources: [
      {
        title: 'California Avocados: Cutting avocados correctly',
        url: 'https://californiaavocado.com/how-to/how-to-choose-and-use-an-avocado/'
      }
    ]
  },
  {
    id: 'zitrus-filetieren',
    title: 'Orange und Grapefruit filetieren',
    aliases: ['Orange', 'Orangen', 'Grapefruit', 'Grapefruits'],
    intro: 'Filetieren entfernt Schale, weiße Haut und Trennhäute. Übrig bleiben zarte Fruchtfilets.',
    points: [
      { text: 'Oben und unten eine dünne Scheibe abschneiden. Die Frucht auf eine Schnittfläche stellen.' },
      {
        text: 'Schale samt weißer Haut mit einem scharfen Messer von oben nach unten abschneiden. Der Rundung folgen und möglichst wenig Fruchtfleisch entfernen.'
      },
      { text: 'Die Filets jeweils dicht an beiden Trennhäuten einschneiden und herauslösen. Den Saft dabei auffangen.' }
    ],
    note: 'Das Häutegerüst über einer Schüssel ausdrücken. Den Saft für das Dressing abmessen.',
    sources: [
      {
        title: 'Great British Chefs: How to segment an orange',
        url: 'https://www.greatbritishchefs.com/how-to-cook/how-to-segment-an-orange'
      }
    ]
  },
  {
    id: 'steak-braten',
    title: 'Wie bekommt ein Steak eine gute Kruste?',
    aliases: ['Steak', 'Steaks', 'Rumpsteak', 'Rumpsteaks', 'Rib-Eye', 'Ribeye', 'Entrecôte', 'Rinderfilet'],
    intro:
      'Eine trockene Oberfläche und eine vorgeheizte, schwere Pfanne helfen beim Bräunen. Die Kruste sagt allein nichts über den Gargrad im Inneren aus.',
    points: [
      {
        text: 'Steak trocken tupfen und nach Rezept salzen. Hoch erhitzbares Öl in die heiße Pfanne geben, ohne es stark rauchen zu lassen.'
      },
      {
        text: 'Mit Abstand anbraten und wenden, bis beide Seiten Farbe haben. Hitze zum Weitergaren reduzieren, erst dann Butter und Kräuter zugeben.'
      },
      {
        text: 'Gargrad mit einem Fleischthermometer nach Rezept prüfen. Vor dem Anschneiden ruhen lassen.'
      }
    ],
    note: 'Die Garzeit hängt von Dicke, Zuschnitt und Ausgangstemperatur ab. Eine feste Minutenzahl passt nicht immer.',
    sources: [
      {
        title: 'Good Food Middle East: How to cook steak',
        url: 'https://www.bbcgoodfoodme.com/how-to/how-to-cook-steak/'
      }
    ]
  },
  {
    id: 'tofu-braten',
    title: 'Tofu knusprig braten',
    aliases: ['Tofu', 'Naturtofu', 'Räuchertofu'],
    intro: 'Für eine Kruste braucht es festen Tofu mit trockener Oberfläche. Seidentofu ist dafür zu weich.',
    points: [
      {
        text: 'Tofu abgießen und trocken tupfen. Sehr feuchten Tofu vor dem Schneiden in ein sauberes Tuch wickeln und etwa 30 Minuten beschweren. Trockener Tofu braucht das nicht.'
      },
      {
        text: 'Nach Rezept schneiden und gegebenenfalls dünn in Speisestärke wenden. Überschüssige Stärke abschütteln.'
      },
      {
        text: 'In heißem Öl portionsweise braten. Erst wenden, wenn sich eine Kruste gebildet hat.'
      }
    ],
    note: 'Sauce erst zum Schluss zugeben und zügig servieren: In Flüssigkeit wird die Kruste weicher.',
    sources: [{ title: 'Good Food: How to press tofu', url: 'https://www.bbcgoodfood.com/howto/guide/how-press-tofu' }]
  },
  {
    id: 'knoblauch-braten',
    title: 'Knoblauch braten, ohne dass er bitter wird',
    aliases: ['Knoblauch', 'Knoblauchzehe', 'Knoblauchzehen'],
    intro: 'Fein gehackter oder gepresster Knoblauch bräunt schnell und verbrennt in einer sehr heißen Pfanne leicht.',
    points: [
      {
        text: 'Nach scharfem Anbraten die Hitze reduzieren. Knoblauch in etwas Fett bei kleiner bis mittlerer Hitze unter Rühren garen.'
      },
      {
        text: 'Auf Duft und Farbe achten: Knoblauch soll duften und höchstens hellgolden werden. Verbrannte Stückchen schmecken bitter.'
      },
      {
        text: 'Flüssigkeit oder weitere Zutaten nach Rezept rechtzeitig zugeben. Ganze Zehen und feuchte Gemüsemischungen brauchen länger als fein gehackter Knoblauch allein.'
      }
    ],
    sources: [
      { title: 'Serious Eats: Spaghetti aglio e olio', url: 'https://www.seriouseats.com/spaghetti-aglio-olio-recipe' },
      { title: 'Good Food: Garlic mushrooms', url: 'https://www.bbcgoodfood.com/howto/guide/how-to-cook-mushrooms' }
    ]
  },
  {
    id: 'zitrusschale-abreiben',
    title: 'Zitrusschale richtig abreiben',
    // Match zest or an explicitly qualified whole fruit, never a juice-only lemon row.
    aliases: [
      'Zitronenabrieb',
      'Limettenabrieb',
      'Orangenabrieb',
      'Zitronenschale',
      'Limettenschale',
      'Orangenschale',
      'Zitrone (Abrieb',
      'Zitronen (Abrieb',
      'Zitrone (Schale fein abgerieben',
      'Zitronen (Schale fein abgerieben',
      'Limette (Abrieb',
      'Limetten (Abrieb',
      'Orange (Abrieb',
      'Orangen (Abrieb'
    ],
    intro:
      'Das Aroma sitzt in der farbigen Schale. Die weiße Schicht darunter kann bitter schmecken und bleibt an der Frucht.',
    points: [
      {
        text: 'Eine Frucht mit essbarer Schale verwenden, etwa eine Bio-Zitrone. Gründlich waschen und abtrocknen.'
      },
      {
        text: 'Die ganze Frucht mit wenig Druck fein abreiben. Nach jedem Zug etwas drehen und nur die farbige Schicht abnehmen.'
      },
      {
        text: 'Zuerst abreiben, dann bei Bedarf halbieren und auspressen. So lässt sich die Frucht besser halten.'
      }
    ],
    sources: [
      { title: 'Bon Appétit: How to zest a lemon', url: 'https://www.bonappetit.com/story/how-to-zest-a-lemon' }
    ]
  }
] as const satisfies readonly IngredientTip[]

export type IngredientTipId = (typeof ingredientTips)[number]['id']
