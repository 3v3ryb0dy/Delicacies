export type AromaSource = { title: string; url: string }
export type AromaApplication = {
  form: string
  place: string
  method: string
  start?: string
}
export type Aroma = {
  id: string
  name: string
  aliases: string[]
  kind: 'Gewürz' | 'Kraut' | 'Gewürzmischung' | 'Saat'
  tags: string[]
  character: string
  foods: string[]
  partners: string[]
  applications: AromaApplication[]
  mistake: string
  note?: string
  sources?: AromaSource[]
}

/** Suggested starting quantities for seasoning. */
export const aromas: readonly Aroma[] = [
  {
    id: 'vanille',
    name: 'Vanille',
    aliases: [],
    kind: 'Gewürz',
    tags: ['süßlich', 'warm', 'floral'],
    character: 'Duftet süßlich und blumig, ohne das Essen zu süßen.',
    foods: ['Karotte', 'Kürbis', 'Sellerie', 'Garnele', 'Jakobsmuschel', 'Ente'],
    partners: ['Butter', 'Zitrone', 'Maracuja', 'Kreuzkümmel'],
    applications: [
      {
        form: 'Schote, aufgeschlitzt',
        place: 'Sauce',
        method:
          'In einer warmen Butter- oder Sahnesauce ziehen lassen und die Schote vor dem Servieren entfernen. Zwischendurch abschmecken.'
      },
      {
        form: 'Mark',
        place: 'Püree',
        method: 'In gegartes Karottenpüree einrühren und vor einer weiteren Zugabe probieren.',
        start: 'Zum Einstieg: Mark von ⅛ Schote für 500 g gegarte Karotten. Nach dem Pürieren zugeben.'
      }
    ],
    mistake: 'Vanillezucker süßt zusätzlich. Für herzhafte Gerichte lässt sich reines Mark gezielter dosieren.'
  },
  {
    id: 'muskat',
    name: 'Muskat',
    aliases: ['Muskatnuss'],
    kind: 'Gewürz',
    tags: ['warm', 'würzig', 'süßlich'],
    character: 'Warm und würzig mit süßlich-holziger Note.',
    foods: ['Kartoffel', 'Blumenkohl', 'Spinat', 'Sahne', 'Käse', 'Kürbis', 'Pilze'],
    partners: ['Zitrone', 'Butter', 'Sumach'],
    applications: [
      {
        form: 'Frisch geriebene Nuss',
        place: 'Finish',
        method:
          'Über fertiges Kartoffelpüree oder Spinat reiben und abschmecken. Frisch gerieben duftet Muskat besonders kräftig.'
      },
      {
        form: 'Gemahlen',
        place: 'Sauce',
        method: 'In Béchamel einrühren und mitköcheln lassen. Vor dem Servieren noch einmal abschmecken.'
      }
    ],
    mistake: 'Nach und nach würzen. Wie viel Muskat von der Reibe kommt, hängt von der Reibe und vom Druck ab.'
  },
  {
    id: 'zimt',
    name: 'Zimt',
    aliases: ['Ceylonzimt', 'Cassia'],
    kind: 'Gewürz',
    tags: ['warm', 'süßlich', 'holzig'],
    character: 'Süßlich und warm. Je nach Sorte eher fein und blumig oder kräftig und scharf.',
    foods: ['Lamm', 'Kürbis', 'Karotte', 'Tomate'],
    partners: ['Kreuzkümmel', 'Orange', 'Piment', 'Sumach'],
    applications: [
      {
        form: 'Stange',
        place: 'Garflüssigkeit',
        method:
          'In einem Schmorgericht mitziehen lassen, zwischendurch probieren und die Stange entfernen, sobald der Geschmack kräftig genug ist.'
      },
      {
        form: 'Gemahlen',
        place: 'Sauce',
        method: 'In Tomatensauce einrühren und mitköcheln lassen.',
        start: 'Zum Einstieg: ⅛ TL gemahlener Ceylonzimt für 500 g Tomaten. Zu Beginn des Köchelns zugeben.'
      }
    ],
    mistake: 'Beim Wechsel der Zimtsorte mit wenig beginnen. Die Sorten schmecken unterschiedlich kräftig.',
    note: 'Cassia enthält meist mehr Cumarin als Ceylonzimt. Wer oft mit Zimt kocht, sollte auf die Sorte achten.',
    sources: [
      {
        title: 'BfR: Cumarin in Zimt und anderen Lebensmitteln',
        url: 'https://www.bfr.bund.de/fragen-und-antworten/thema/fragen-und-antworten-zu-cumarin-in-zimt-und-anderen-lebensmitteln/'
      }
    ]
  },
  {
    id: 'lorbeer',
    name: 'Lorbeer',
    aliases: ['Lorbeerblatt'],
    kind: 'Kraut',
    tags: ['würzig', 'herb', 'holzig'],
    character: 'Herb und würzig, mit einem leicht balsamischen Duft.',
    foods: ['Linsen', 'Bohnen', 'Ragout', 'Brühe', 'Tomate', 'Kartoffel'],
    partners: ['Piment', 'Kreuzkümmel', 'Zitrone'],
    applications: [
      {
        form: 'Ganzes getrocknetes Blatt',
        place: 'Garflüssigkeit',
        method: 'Früh in Brühe oder Ragout geben, mitziehen lassen und vor dem Essen entfernen.',
        start: 'Zum Einstieg: 1 getrocknetes Blatt für 750 ml Linsen-Garflüssigkeit. Ab Beginn des Köchelns mitgaren.'
      },
      {
        form: 'Frisches Blatt (Küchenlorbeer)',
        place: 'Sauce',
        method:
          'In der Sauce mitziehen lassen und herausnehmen, sobald sie kräftig genug gewürzt ist. Frische und getrocknete Blätter können unterschiedlich intensiv schmecken.'
      }
    ],
    mistake: 'Ganze Blätter vor dem Servieren entfernen. Sie bleiben auch nach dem Kochen zäh.'
  },
  {
    id: 'wacholder',
    name: 'Wacholder',
    aliases: ['Wacholderbeere'],
    kind: 'Gewürz',
    tags: ['harzig', 'würzig', 'frisch'],
    character: 'Duftet harzig und frisch, ähnlich wie Gin.',
    foods: ['Ente', 'Wild', 'Schwein', 'Pilze', 'Rote Bete', 'Rotkohl'],
    partners: ['Orange', 'Thymian', 'Ziegenkäse'],
    applications: [
      {
        form: 'Getrocknete Beeren, angedrückt',
        place: 'Garflüssigkeit',
        method: 'In Sauce oder Schmorflüssigkeit ziehen lassen. Anschließend abseihen oder die Beeren entfernen.',
        start: 'Zum Einstieg: 2 angedrückte Küchen-Wacholderbeeren für 250 ml Sauce. Beim Köcheln zugeben.'
      },
      {
        form: 'Fein gemörsert',
        place: 'Am Produkt',
        method:
          'Vor dem Garen sparsam auf Fleisch verteilen. Grobe Stücke vermeiden, wenn sie später nicht entfernt werden können.'
      }
    ],
    mistake: 'Für eine Sauce reicht es meist, die Beeren anzudrücken und mitziehen zu lassen. Rösten ist nicht nötig.'
  },
  {
    id: 'piment',
    name: 'Piment',
    aliases: ['Nelkenpfeffer', 'Allspice'],
    kind: 'Gewürz',
    tags: ['warm', 'würzig', 'süßlich'],
    character: 'Erinnert an Nelke, Pfeffer, Zimt und Muskat, ist aber ein einzelnes Gewürz.',
    foods: ['Lamm', 'Rind', 'Tomate', 'Aubergine', 'Hackfleisch'],
    partners: ['Zimt', 'Kreuzkümmel', 'Petersilie'],
    applications: [
      {
        form: 'Ganze Körner',
        place: 'Garflüssigkeit',
        method: 'Im Ragout mitziehen lassen. Im Gewürzbeutel lassen sich die Körner später gut entfernen.'
      },
      {
        form: 'Gemahlen',
        place: 'Am Produkt',
        method:
          'Gleichmäßig in eine Hackfleischmasse einarbeiten und eine kleine Probe durchgaren, bevor du nachwürzt.',
        start: 'Zum Einstieg: ⅛ TL gemahlener Piment für 500 g Lammhack. Vor dem Garen einarbeiten.'
      }
    ],
    mistake: 'Neben Zimt oder Nelke sparsam verwenden, damit Piment die anderen Gewürze nicht überdeckt.'
  },
  {
    id: 'dill',
    name: 'Dill',
    aliases: ['Dillspitzen'],
    kind: 'Kraut',
    tags: ['frisch', 'grün', 'anisig'],
    character: 'Frisch-grün, leicht anisig und süßlich duftend.',
    foods: ['Lachs', 'Forelle', 'Gurke', 'Kartoffel', 'Joghurt'],
    partners: ['Senf', 'Zitrone', 'Maracuja', 'Sumach'],
    applications: [
      {
        form: 'Frische Spitzen, gehackt',
        place: 'Finish',
        method: 'Erst beim Anrichten über den gegarten Fisch geben.',
        start:
          'Zum Einstieg: 1 EL locker gefüllter gehackter Dill für 400 g gegarten Lachs. Beim Servieren darüberstreuen.'
      },
      {
        form: 'Frische Spitzen',
        place: 'Sauce',
        method: 'In ein kaltes Joghurtdressing rühren. Wer mag, streut beim Servieren noch etwas Dill darüber.'
      },
      {
        form: 'Getrocknete Spitzen',
        place: 'Sauce',
        method:
          'In der Sauce ziehen lassen und dann abschmecken. Getrockneter Dill schmeckt anders als frischer und braucht eine andere Menge.'
      }
    ],
    mistake: 'Für einen frischen Dillgeschmack erst kurz vor dem Servieren zugeben.'
  },
  {
    id: 'petersilie',
    name: 'Petersilie',
    aliases: ['Blattpetersilie'],
    kind: 'Kraut',
    tags: ['frisch', 'grün', 'herb'],
    character: 'Grün, grasig und leicht herb.',
    foods: ['Pilze', 'Kartoffel', 'Lamm', 'Blumenkohl', 'Garnele'],
    partners: ['Zitrone', 'Knoblauch', 'Sumach', 'Kreuzkümmel'],
    applications: [
      {
        form: 'Frische Blätter, gehackt',
        place: 'Finish',
        method: 'Über das fertige Gericht geben oder abseits der Hitze untermischen.'
      },
      {
        form: 'Frische Stiele',
        place: 'Garflüssigkeit',
        method: 'In Brühe mitziehen lassen und später abseihen.'
      },
      {
        form: 'Getrocknete Blätter',
        place: 'Sauce',
        method: 'In einer feuchten Sauce ziehen lassen. Für ein ausgeprägt frisches Finish frische Blätter wählen.'
      }
    ],
    mistake: 'Auch die Stiele geben Geschmack ab. Für Brühe können sie mit in den Topf.'
  },
  {
    id: 'thymian',
    name: 'Thymian',
    aliases: [],
    kind: 'Kraut',
    tags: ['warm', 'würzig', 'floral'],
    character: 'Würzig, leicht herb und je nach Sorte floral.',
    foods: ['Pilze', 'Huhn', 'Lamm', 'Tomate', 'Ente'],
    partners: ['Zitrone', 'Honig', 'Wacholder', 'Butter'],
    applications: [
      {
        form: 'Frische Zweige',
        place: 'In Fett',
        method: 'In warmer Butter ziehen lassen. Holzige Zweige vor dem Servieren herausnehmen.'
      },
      {
        form: 'Getrocknete Blätter',
        place: 'Sauce',
        method: 'In einer Tomatensauce mitköcheln lassen und nach dem Ziehen abschmecken.',
        start: 'Zum Einstieg: ¼ TL getrockneter Thymian für 500 g Tomaten. Zu Beginn des Köchelns zugeben.'
      }
    ],
    mistake: 'Thymian in heißem Fett nicht dunkel werden lassen, sonst kann er bitter schmecken.'
  },
  {
    id: 'rosmarin',
    name: 'Rosmarin',
    aliases: [],
    kind: 'Kraut',
    tags: ['harzig', 'kräftig', 'würzig'],
    character: 'Kräftig harzig und ätherisch.',
    foods: ['Kartoffel', 'Lamm', 'Schwein'],
    partners: ['Knoblauch', 'Zitrone', 'Honig'],
    applications: [
      {
        form: 'Frischer Zweig',
        place: 'In Fett',
        method: 'Öl oder Butter damit sanft aromatisieren und den Zweig herausnehmen, bevor er dunkel wird.'
      },
      {
        form: 'Frische oder getrocknete Nadeln, fein gehackt',
        place: 'Am Produkt',
        method:
          'Vor dem Garen mit Öl auf Kartoffeln verteilen. Getrocknete Nadeln besonders fein zerkleinern und geringer dosiert beginnen.'
      }
    ],
    mistake:
      'Nadeln fein hacken, damit keine harten Stücke im Essen bleiben. Mit wenig beginnen, denn Rosmarin schmeckt sehr kräftig.'
  },
  {
    id: 'oregano',
    name: 'Oregano',
    aliases: [],
    kind: 'Kraut',
    tags: ['warm', 'herb', 'würzig'],
    character: 'Warm und herb. Getrocknet schmeckt Oregano oft kräftiger als frisch.',
    foods: ['Tomate', 'Aubergine', 'Feta', 'Lamm'],
    partners: ['Zitrone', 'Sumach', 'Zimt'],
    applications: [
      {
        form: 'Getrocknete Blätter',
        place: 'Sauce',
        method: 'In Tomatensauce mitköcheln lassen.',
        start: 'Zum Einstieg: ½ TL getrockneter Oregano für 500 g Tomaten. Zu Beginn des Köchelns zugeben.'
      },
      {
        form: 'Frische Blätter',
        place: 'Finish',
        method:
          'Zum Schluss über gebackene Aubergine oder Tomaten geben, wenn die frische Kräuternote erhalten bleiben soll.'
      }
    ],
    mistake: 'Getrockneten Oregano zunächst sparsam zugeben und nach dem Mitkochen abschmecken.'
  },
  {
    id: 'currypulver',
    name: 'Currypulver',
    aliases: ['Curry'],
    kind: 'Gewürzmischung',
    tags: ['würzig', 'warm'],
    character:
      'Je nach Mischung mild, scharf oder besonders würzig. Ein Blick auf die Zutatenliste hilft beim Auswählen.',
    foods: ['Huhn', 'Kürbis', 'Kartoffel', 'Tomate', 'Joghurt'],
    partners: ['Kokos', 'Ingwer', 'Limette'],
    applications: [
      {
        form: 'Pulvermischung',
        place: 'In Fett',
        method:
          'Bei reduzierter Hitze in Öl oder eine feuchte Zwiebelbasis rühren und anschließend Flüssigkeit zugeben. Nicht dunkel rösten.'
      },
      {
        form: 'Pulvermischung',
        place: 'Sauce',
        method: 'In die Sauce rühren und eine Weile mitköcheln lassen. Dann abschmecken.',
        start:
          'Zum Einstieg: 1 TL mildes Currypulver für 500 g Kürbis und 200 ml Kokosmilch. Zu Beginn des Garens zugeben.'
      }
    ],
    mistake:
      'Eine neue Mischung erst probieren, bevor du die gewohnte Menge verwendest. Curryblätter sind ein eigenes Gewürz.'
  },
  {
    id: 'kreuzkuemmel',
    name: 'Kreuzkümmel',
    aliases: ['Cumin', 'Kreuzkuemmel'],
    kind: 'Gewürz',
    tags: ['warm', 'erdig', 'würzig'],
    character: 'Warm, erdig und deutlich würzig. Rösten verändert die Aromatik.',
    foods: ['Karotte', 'Blumenkohl', 'Lamm', 'Joghurt', 'Garnele', 'Linsen'],
    partners: ['Sumach', 'Zimt', 'Kurkuma', 'Zitrone', 'Vanille'],
    applications: [
      {
        form: 'Ganze Samen',
        place: 'In Fett',
        method:
          'In mäßig heißem Öl erwärmen, bis sie duften. Bevor sie dunkel werden, die weiteren Zutaten zugeben. Alternativ trocken rösten und anschließend mahlen.'
      },
      {
        form: 'Gemahlen',
        place: 'Am Produkt',
        method: 'Mit Öl auf Karotten verteilen und rösten. Das Pulver muss nicht zuvor separat angeröstet werden.',
        start: 'Zum Einstieg: ¼ TL gemahlener Kreuzkümmel für 500 g rohe Karotten. Vor dem Rösten mit Öl verteilen.'
      },
      {
        form: 'Gemahlen',
        place: 'Sauce',
        method: 'In eine feuchte Sauce rühren und mitgaren. Nicht allein auf höchste Pfannenhitze geben.'
      }
    ],
    mistake:
      'Ein Löffel Samen entspricht nicht einem Löffel Pulver. Gemahlenen Kreuzkümmel bei milder Hitze zugeben, damit er nicht verbrennt.'
  },
  {
    id: 'kurkuma',
    name: 'Kurkuma',
    aliases: ['Turmeric', 'Gelbwurz'],
    kind: 'Gewürz',
    tags: ['erdig', 'herb', 'warm'],
    character: 'Schmeckt erdig und leicht bitter und färbt das Essen kräftig gelb.',
    foods: ['Huhn', 'Linsen', 'Kürbis', 'Reis'],
    partners: ['Kreuzkümmel', 'Ingwer', 'Kokos', 'Bockshornklee'],
    applications: [
      {
        form: 'Gemahlen',
        place: 'Sauce',
        method: 'In eine feuchte Zwiebelbasis oder direkt in die Garflüssigkeit rühren und mitgaren.',
        start:
          'Zum Einstieg: ¼ TL gemahlene Kurkuma für 200 g trockene Linsen und 600 ml Garflüssigkeit. Am Anfang zugeben.'
      },
      {
        form: 'Frische Wurzel, fein gerieben',
        place: 'Sauce',
        method:
          'In einer Sauce mitgaren und nach Geschmack dosieren. Frische Wurzel nicht eins zu eins gegen Pulver austauschen.'
      }
    ],
    mistake: 'Nicht allein nach der Farbe dosieren. Zu viel Kurkuma kann herb schmecken.',
    sources: [
      {
        title: 'McCormick: Kurkuma, auch in Reis-Garwasser',
        url: 'https://www.mccormick.com/products/mccormick-culinary-ground-turmeric-16-oz'
      }
    ]
  },
  {
    id: 'sumach',
    name: 'Sumach',
    aliases: ['Sumac'],
    kind: 'Gewürz',
    tags: ['säuerlich', 'fruchtig', 'herb'],
    character:
      'Fruchtig-säuerlich und leicht herb. Das Pulver bleibt leicht körnig und säuert, ohne das Essen zu verdünnen.',
    foods: ['Lamm', 'Lachs', 'Fisch', 'Tomate', 'Zwiebel', 'Joghurt', 'Blumenkohl'],
    partners: ['Kreuzkümmel', 'Dill', 'Petersilie', 'Honig'],
    applications: [
      {
        form: 'Gemahlener Speisesumach',
        place: 'Finish',
        method: 'Nach dem Garen über Gemüse streuen, damit Säure und Textur deutlich wahrnehmbar bleiben.',
        start:
          'Zum Einstieg: ½ TL ungesalzener gemahlener Sumach für 500 g gegarten Blumenkohl. Beim Anrichten darüberstreuen.'
      },
      {
        form: 'Gemahlener Speisesumach',
        place: 'Dressing',
        method: 'In Joghurt oder Dressing einrühren und ziehen lassen. Die Zutatenliste auf zugesetztes Salz prüfen.'
      }
    ],
    mistake:
      'Sumach schmeckt anders als Zitronensaft und bringt keine Flüssigkeit mit. Beim Austauschen Menge und Konsistenz anpassen.'
  },
  {
    id: 'bockshornklee',
    name: 'Bockshornklee',
    aliases: ['Methi', 'Kasuri Methi', 'Bockshornkleesamen'],
    kind: 'Gewürz',
    tags: ['würzig', 'herb', 'süßlich'],
    character: 'Samen sind kräftig, bitter und an Karamell erinnernd. Blätter bringen eine eigene würzige Kräuternote.',
    foods: ['Tomate', 'Butter', 'Kürbis', 'Kartoffel', 'Huhn', 'Joghurt'],
    partners: ['Kurkuma', 'Kreuzkümmel', 'Limette', 'Honig'],
    applications: [
      {
        form: 'Ganze Samen',
        place: 'In Fett',
        method:
          'Behutsam in Öl erwärmen oder trocken rösten, anschließend in einer feuchten Zubereitung mitgaren. Nicht dunkel werden lassen.'
      },
      {
        form: 'Gemahlene Samen',
        place: 'Sauce',
        method:
          'Sparsam in eine Kürbissauce rühren und mitgaren. Die Samen schmecken deutlich bitterer als die Blätter.'
      },
      {
        form: 'Getrocknete Blätter (Kasuri Methi)',
        place: 'Sauce',
        method:
          'Zwischen den Fingern zerreiben und gegen Ende in eine Butter-Tomaten-Sauce rühren. Noch kurz ziehen lassen.'
      }
    ],
    mistake: 'Für die Butter-Tomaten-Sauce getrocknete Blätter verwenden. Samen verändern den Geschmack deutlich.',
    sources: [
      {
        title: 'Swasthi: Butter Chicken mit getrockneten Bockshornkleeblättern',
        url: 'https://www.indianhealthyrecipes.com/butter-chicken/'
      }
    ]
  },
  {
    id: 'tonkabohne',
    name: 'Tonkabohne',
    aliases: ['Tonka'],
    kind: 'Gewürz',
    tags: ['süßlich', 'warm', 'heuartig'],
    character: 'Erinnert an Vanille, Mandel und Heu.',
    foods: ['Kürbis', 'Sellerie', 'Karotte', 'Ente', 'Kirsche'],
    partners: ['Butter', 'Vanille'],
    applications: [
      {
        form: 'Getrocknete Bohne, fein gerieben',
        place: 'Püree',
        method: 'Fein gerieben in fertiges Selleriepüree rühren.'
      }
    ],
    mistake:
      'Tonkabohnen enthalten unterschiedlich viel Cumarin. Dieser Stoff kann bei empfindlichen Menschen die Leber schädigen.',
    sources: [
      {
        title: 'Bayerisches LGL: Cumarin',
        url: 'https://www.lgl.bayern.de/lebensmittel/chemie/inhaltsstoffe/pflanzeninhaltsstoffe/cumarin_index.htm'
      }
    ]
  },
  {
    id: 'cayennepfeffer',
    name: 'Cayennepfeffer',
    aliases: ['Cayenne', 'Cayenne-Pfeffer'],
    kind: 'Gewürz',
    tags: ['scharf', 'warm'],
    character: 'Fein gemahlene Chili mit deutlicher Schärfe. Trotz des Namens kein schwarzer Pfeffer.',
    foods: ['Huhn', 'Garnele', 'Mais', 'Käse', 'Tomate'],
    partners: ['Paprika', 'Kreuzkümmel', 'Zitrone', 'Knoblauch'],
    applications: [
      {
        form: 'Gemahlen',
        place: 'Sauce',
        method:
          'In eine warme Käse- oder Tomatensauce einrühren, gleichmäßig verteilen und vor dem Nachwürzen probieren.'
      },
      {
        form: 'Gemahlen',
        place: 'Am Produkt',
        method:
          'Mit Öl oder weicher Butter vermengen und dünn auf Huhn verteilen. Beim Garen darauf achten, dass die Gewürze nicht verbrennen.'
      }
    ],
    mistake: 'Cayenne ist deutlich schärfer als mildes Paprikapulver. Mit wenig beginnen und abschmecken.',
    sources: [
      {
        title: 'McCormick: Cayenne und Anwendungen',
        url: 'https://www.mccormick.com/products/mccormick-gourmet-organic-cayenne-red-pepper-1-5-oz'
      }
    ]
  },
  {
    id: 'paprika-geraeuchert',
    name: 'Paprika (geräuchert)',
    aliases: ['Rauchpaprika', 'Pimentón de la Vera', 'Pimenton de la Vera', 'Smoked Paprika'],
    kind: 'Gewürz',
    tags: ['rauchig', 'fruchtig', 'würzig'],
    character: 'Paprikaaroma mit deutlicher Rauchnote. Geräuchert beschreibt die Verarbeitung, nicht die Schärfe.',
    foods: ['Mais', 'Huhn', 'Bohnen', 'Kichererbse', 'Kartoffel'],
    partners: ['Cayennepfeffer', 'Kreuzkümmel', 'Limette', 'Butter'],
    applications: [
      {
        form: 'Gemahlen, mild (dulce)',
        place: 'In Fett',
        method:
          'In weiche Butter rühren und auf heißem Mais schmelzen lassen. Für eine warme Sauce bei reduzierter Hitze einrühren und anschließend Flüssigkeit zugeben.'
      },
      {
        form: 'Gemahlen, scharf (picante)',
        place: 'Sauce',
        method:
          'In einem Bohnenragout zunächst zurückhaltend einsetzen: Rauch und Schärfe kommen gemeinsam ins Gericht.'
      }
    ],
    mistake: 'Auf die Schärfeangabe achten. Das feine Pulver verbrennt in sehr heißem Fett schnell.',
    note: '„Pimentón“ allein bedeutet Paprikapulver und garantiert keine Rauchnote. Auf die Kennzeichnung „geräuchert“ beziehungsweise „ahumado“ achten. Pimentón de la Vera ist geräuchert.',
    sources: [
      {
        title: 'Spanish Sabores: Geräucherte und ungeräucherte spanische Paprika',
        url: 'https://spanishsabores.com/a-short-history-of-spanish-paprika/'
      },
      {
        title: 'The Kitchn: Süße, scharfe und geräucherte Paprika',
        url: 'https://www.thekitchn.com/whats-the-difference-between-sweet-hot-and-smoked-paprika-234756'
      }
    ]
  },
  {
    id: 'paprika-edelsuess',
    name: 'Paprika (edelsüß)',
    aliases: ['Edelsüßpaprika', 'Edelsuesspaprika', 'Süßes Paprikapulver'],
    kind: 'Gewürz',
    tags: ['fruchtig', 'mild', 'süßlich'],
    character: 'Mildes, ungeräuchertes Paprikapulver mit fruchtig-süßlicher Würze und roter Farbe.',
    foods: ['Huhn', 'Kartoffel', 'Rind', 'Tomate', 'Bohnen'],
    partners: ['Kümmel', 'Majoran', 'Knoblauch', 'Cayennepfeffer'],
    applications: [
      {
        form: 'Gemahlen, edelsüß',
        place: 'Sauce',
        method: 'In die feuchte Zwiebelbasis eines Paprikahuhns rühren, mit Brühe ablöschen und mitgaren.'
      },
      {
        form: 'Gemahlen, edelsüß',
        place: 'Am Produkt',
        method: 'Mit Öl auf Kartoffelspalten verteilen und rösten. Auf die Farbe der Gewürzschicht achten.'
      }
    ],
    mistake:
      'Geräucherte Paprika bringt zusätzlich Rauchgeschmack ins Gericht. Sie ist deshalb nicht für jede Anwendung ein passender Ersatz.',
    sources: [
      {
        title: 'The Kitchn: Paprikasorten unterscheiden',
        url: 'https://www.thekitchn.com/whats-the-difference-between-sweet-hot-and-smoked-paprika-234756'
      }
    ]
  },
  {
    id: 'kuemmel',
    name: 'Kümmel',
    aliases: ['Kuemmel', 'Caraway'],
    kind: 'Gewürz',
    tags: ['würzig', 'warm', 'herb'],
    character: 'Kräftig würzig, mit eigener ätherischer Note. Kümmel ist weder Kreuzkümmel noch Schwarzkümmel.',
    foods: ['Rotkohl', 'Weißkohl', 'Kartoffel', 'Schwein', 'Rote Bete'],
    partners: ['Dill', 'Zitrone', 'Majoran', 'Apfel'],
    applications: [
      {
        form: 'Ganze Saat, leicht angestoßen',
        place: 'Dressing',
        method: 'In ein Zitronendressing einrühren und mit fein geschnittenem Kohl ziehen lassen.'
      },
      {
        form: 'Gemahlen',
        place: 'Garflüssigkeit',
        method:
          'In eine Kohl- oder Kartoffelzubereitung einrühren und mitgaren, wenn keine ganzen Körner im Essen gewünscht sind.'
      }
    ],
    mistake: 'Kümmel und Kreuzkümmel schmecken trotz des ähnlichen Namens sehr unterschiedlich.',
    sources: [
      {
        title: 'Great British Chefs: Rotkohl mit Kümmel und Dill',
        url: 'https://www.greatbritishchefs.com/how-to-cook/how-to-cook-red-cabbage'
      }
    ]
  },
  {
    id: 'koriandersaat',
    name: 'Koriandersaat',
    aliases: ['Koriandersamen', 'Korianderkörner', 'Gemahlener Koriander'],
    kind: 'Gewürz',
    tags: ['zitrusartig', 'warm', 'würzig'],
    character: 'Warme, zitrusartige Würze. Die getrocknete Saat schmeckt anders als das frische Koriandergrün.',
    foods: ['Karotte', 'Huhn', 'Linsen', 'Kichererbse'],
    partners: ['Kreuzkümmel', 'Thymian', 'Ingwer', 'Zitrone'],
    applications: [
      {
        form: 'Ganze Saat, angestoßen',
        place: 'In Fett',
        method:
          'Mit Zwiebeln bei milder Hitze anschwitzen. Karotten zugeben und leicht anrösten, dann Brühe angießen und zur Suppe garen.'
      },
      {
        form: 'Gemahlen',
        place: 'Sauce',
        method:
          'In eine feuchte Currybasis einrühren und mitgaren. Neben Kreuzkümmel bringt Koriandersaat einen zitrusartigen Duft.'
      }
    ],
    mistake: 'Koriandergrün schmeckt anders als die Saat und lässt sich nicht einfach durch sie ersetzen.',
    sources: [
      {
        title: 'Great British Chefs: Karottensuppe mit Koriandersaat',
        url: 'https://www.greatbritishchefs.com/recipes/carrot-coriander-soup-recipe'
      }
    ]
  },
  {
    id: 'fenchelsaat',
    name: 'Fenchelsaat',
    aliases: ['Fenchelsamen', 'Fennel Seeds'],
    kind: 'Gewürz',
    tags: ['anisig', 'süßlich', 'warm'],
    character: 'Süßlich-anisige Saat mit warmer Würze. Anders einzusetzen als die frische Fenchelknolle.',
    foods: ['Schwein', 'Kartoffel', 'Tomate', 'Bohnen'],
    partners: ['Rosmarin', 'Zitrone', 'Salbei', 'Knoblauch'],
    applications: [
      {
        form: 'Ganze Saat, fein gemörsert',
        place: 'Am Produkt',
        method:
          'Für Schweinekoteletts mit Rosmarin und Salz fein mörsern und aufs Fleisch reiben. Beim Braten die Gewürze nicht schwarz werden lassen.'
      },
      {
        form: 'Gemahlen',
        place: 'Sauce',
        method:
          'In eine Tomaten- oder Bohnensauce einrühren und mitziehen lassen. Gemahlene Saat verteilt sich ohne einzelne kräftige Bissen.'
      }
    ],
    mistake: 'Wer nicht auf ganze Körner beißen möchte, mörsert oder mahlt die Saat vor dem Kochen.',
    sources: [
      {
        title: 'Jamie Oliver: Schweinebraten mit Fenchelsaat',
        url: 'https://www.jamieoliver.com/recipes/pork/summer-roast-pork-crackling'
      }
    ]
  },
  {
    id: 'senfsaat',
    name: 'Senfsaat',
    aliases: ['Senfkörner', 'Senfsamen', 'Mustard Seeds'],
    kind: 'Gewürz',
    tags: ['würzig', 'nussig', 'scharf'],
    character:
      'Je nach Sorte und Behandlung mild-nussig bis scharf. Gelbe Saat ist üblicherweise milder als braune. Fertiger Dijon-Senf ist eine andere Zubereitung.',
    foods: ['Kartoffel', 'Linsen', 'Kohl', 'Gurke'],
    partners: ['Curryblätter', 'Ingwer', 'Kreuzkümmel', 'Kurkuma'],
    applications: [
      {
        form: 'Braune Saat, ganz',
        place: 'In Fett',
        method:
          'In Öl erhitzen, bis die Körner zu springen beginnen. Einen Spritzschutz verwenden. Dann die weiteren Zutaten zugeben und die Hitze kontrollieren.'
      },
      {
        form: 'Gelbe Saat, ganz',
        place: 'Garflüssigkeit',
        method: 'In einem Gemüse-Essigsud mitziehen lassen, wenn mildere Saatwürze und einzelne Körner erwünscht sind.'
      }
    ],
    mistake:
      'Ganze Körner, Senfpulver und fertigen Senf unterschiedlich dosieren. Geschmack und Schärfe hängen von der Zubereitung ab.',
    sources: [
      {
        title: 'Swasthi: Kartoffelcurry mit Senfsaat',
        url: 'https://www.indianhealthyrecipes.com/potato-curry-aloo-sabzi/'
      }
    ]
  },
  {
    id: 'schwarzkuemmel',
    name: 'Schwarzkümmel',
    aliases: ['Nigella', 'Kalonji', 'Nigella sativa'],
    kind: 'Gewürz',
    tags: ['herb', 'würzig'],
    character:
      'Nigella sativa: kleine schwarze Samen mit herb-würzigem Geschmack. Kein schwarzer Sesam und kein Kreuzkümmel.',
    foods: ['Fladenbrot', 'Kartoffel', 'Kürbis', 'Aubergine'],
    partners: ['Kreuzkümmel', 'Fenchelsaat', 'Kurkuma'],
    applications: [
      {
        form: 'Ganze Saat',
        place: 'Am Produkt',
        method:
          'Auf befeuchteten Fladenbrotteig streuen und mitbacken. Die Samen sollen haften und nicht dunkel verbrennen.'
      },
      {
        form: 'Ganze Saat',
        place: 'In Fett',
        method: 'Für Kartoffelgemüse kurz in Öl erwärmen, dann die weiteren Zutaten zugeben und mitgaren.'
      }
    ],
    mistake:
      'Beim Kauf unter dem Namen „Black cumin“ auf Nigella sativa achten. Der englische Name wird für verschiedene Gewürze verwendet.',
    sources: [
      {
        title: 'Good Food: Nigella',
        url: 'https://tollbit.bbcgoodfood.com/glossary/nigella-seed-glossary'
      }
    ]
  },
  {
    id: 'kardamom-gruen',
    name: 'Grüner Kardamom',
    aliases: ['Kardamom', 'Green Cardamom'],
    kind: 'Gewürz',
    tags: ['frisch', 'zitrusartig', 'würzig'],
    character:
      'Intensiv duftend, zitrusartig und etwas kühl. Schwarzer Kardamom hat eine andere, häufig rauchigere Aromatik.',
    foods: ['Reis', 'Huhn', 'Karotte', 'Joghurt'],
    partners: ['Ingwer', 'Zimt', 'Gewürznelke'],
    applications: [
      {
        form: 'Grüne Kapseln, angedrückt',
        place: 'Garflüssigkeit',
        method: 'In Reis mitziehen lassen und die Kapseln vor dem Servieren herausnehmen.'
      },
      {
        form: 'Ausgelöste Samen, frisch gemahlen',
        place: 'Sauce',
        method:
          'Sparsam in eine Hühnersauce rühren und vor einer weiteren Zugabe probieren. Kapselhüllen nicht mitmahlen.'
      }
    ],
    mistake: 'Schwarzer Kardamom schmeckt kräftiger und oft rauchig. Er verändert das Gericht deutlich.',
    sources: [
      {
        title: 'Swasthi: Kardamom und weitere Gewürze',
        url: 'https://www.indianhealthyrecipes.com/indian-spices/'
      }
    ]
  },
  {
    id: 'ingwer',
    name: 'Ingwer',
    aliases: ['Ginger'],
    kind: 'Gewürz',
    tags: ['frisch', 'scharf', 'zitrusartig'],
    character:
      'Frischer Ingwer bringt saftige, zitrusartige Schärfe. Getrocknetes Pulver wirkt wärmer und weniger frisch.',
    foods: ['Kartoffel', 'Huhn', 'Grüne Bohnen', 'Karotte', 'Kürbis'],
    partners: ['Knoblauch', 'Chili', 'Szechuanpfeffer', 'Kardamom'],
    applications: [
      {
        form: 'Frische Wurzel, fein gehackt oder gerieben',
        place: 'In Fett',
        method:
          'Nach den Zwiebeln in eine Gemüse- oder Currybasis geben und kurz mitgaren, ohne die feinen Stücke zu verbrennen.'
      },
      {
        form: 'Getrocknet, gemahlen',
        place: 'Sauce',
        method:
          'In Kürbissuppe oder eine Schmorflüssigkeit einrühren. Nicht dieselbe Menge wie bei frischer Wurzel voraussetzen.'
      }
    ],
    mistake: 'Beim Wechsel zwischen frischem Ingwer und Pulver die Menge neu abschmecken.',
    sources: [
      {
        title: 'Swasthi: Ingwer in einer Kartoffelzubereitung',
        url: 'https://www.indianhealthyrecipes.com/potato-curry-aloo-sabzi/'
      }
    ]
  },
  {
    id: 'gewuerznelke',
    name: 'Gewürznelke',
    aliases: ['Nelke', 'Gewürznelken', 'Clove'],
    kind: 'Gewürz',
    tags: ['warm', 'süßlich', 'kräftig'],
    character: 'Warm und süßlich-würzig. Schon wenig Nelke schmeckt deutlich durch.',
    foods: ['Rotkohl', 'Schwein', 'Apfel', 'Birne'],
    partners: ['Zimt', 'Orange', 'Lorbeer'],
    applications: [
      {
        form: 'Ganz',
        place: 'Garflüssigkeit',
        method: 'Im Gewürzbeutel mit Rotkohl oder einer Sauce ziehen lassen und vor dem Essen entfernen.'
      },
      {
        form: 'Gemahlen',
        place: 'Sauce',
        method: 'Sehr zurückhaltend in eine Apfel- oder Schmorsoße einarbeiten. Erst nach dem Verteilen abschmecken.'
      }
    ],
    mistake: 'Ganze Nelken vor dem Servieren herausnehmen. Ein Biss darauf schmeckt sehr kräftig.',
    sources: [
      {
        title: 'Good Food: Gewürznelke',
        url: 'https://tollbit.bbcgoodfood.com/glossary/clove-glossary'
      }
    ]
  },
  {
    id: 'sternanis',
    name: 'Sternanis',
    aliases: ['Star Anise', 'Illicium verum'],
    kind: 'Gewürz',
    tags: ['anisig', 'süßlich', 'warm'],
    character:
      'Kräftig anisig und süßlich duftend. Verwendet wird die getrocknete sternförmige Frucht des Küchen-Sternanis.',
    foods: ['Ente', 'Schwein', 'Brühe', 'Birne'],
    partners: ['Ingwer', 'Zimt', 'Orange'],
    applications: [
      {
        form: 'Ganze Frucht oder Stück',
        place: 'Garflüssigkeit',
        method:
          'In Entensauce oder Brühe mitziehen lassen. Zwischendurch probieren und die Frucht entfernen, sobald der Geschmack kräftig genug ist.'
      },
      {
        form: 'Gemahlen',
        place: 'Sauce',
        method:
          'In eine Schmorsoße einrühren und zurückhaltend dosieren. Pulver lässt sich später nicht mehr herausnehmen.'
      }
    ],
    mistake: 'Für kleine Mengen Sauce kann schon ein Stück Sternanis reichen. Während des Ziehens probieren.',
    sources: [
      {
        title: 'Misty Ricardo: Sternanis und seine Anwendung',
        url: 'https://mistyricardo.com/glossary/'
      }
    ]
  },
  {
    id: 'safran',
    name: 'Safran',
    aliases: ['Saffron'],
    kind: 'Gewürz',
    tags: ['floral', 'herb', 'heuartig'],
    character: 'Duftet blumig und etwas nach Heu, schmeckt leicht herb und färbt Speisen gelb.',
    foods: ['Reis', 'Fisch', 'Garnele', 'Tomate', 'Fenchel'],
    partners: ['Butter', 'Zitrone', 'Knoblauch'],
    applications: [
      {
        form: 'Fäden',
        place: 'Garflüssigkeit',
        method:
          'In wenig warmer Brühe oder Wasser ziehen lassen und mitsamt dem Aufguss in Reis oder eine Fischsauce geben. So verteilen sich Aroma und Farbe.'
      },
      {
        form: 'Fein zerriebene Fäden',
        place: 'Sauce',
        method: 'Mit etwas warmer Flüssigkeit verrühren und gegen Ende in eine helle Sauce einarbeiten.'
      }
    ],
    mistake:
      'Nach dem Geschmack dosieren, nicht nur nach der Farbe. Kurkuma färbt ebenfalls gelb, schmeckt aber anders.',
    sources: [
      {
        title: 'Good Food: Safran vorbereiten',
        url: 'https://www.bbcgoodfood.com/glossary/saffron-glossary'
      }
    ]
  },
  {
    id: 'szechuanpfeffer',
    name: 'Szechuanpfeffer',
    aliases: ['Sichuanpfeffer', 'Sichuan-Pfeffer', 'Szechuan-Pfeffer', 'Szechuan Pepper'],
    kind: 'Gewürz',
    tags: ['zitrusartig', 'prickelnd', 'würzig'],
    character:
      'Zitrusduft und prickelndes, leicht betäubendes Mundgefühl. Das unterscheidet ihn von schwarzem Pfeffer und von der Hitze einer Chili.',
    foods: ['Grüne Bohnen', 'Gurke', 'Tofu', 'Ente'],
    partners: ['Ingwer', 'Chili', 'Knoblauch', 'Sesam'],
    applications: [
      {
        form: 'Rote Fruchtschalen, gemahlen',
        place: 'Finish',
        method:
          'Harte schwarze Samen und Stiele aussortieren. Die aromatischen Schalen fein mahlen und gegen Ende an gegarte Bohnen geben.'
      },
      {
        form: 'Grüne Fruchtschalen',
        place: 'In Fett',
        method:
          'Für eine frischere Zitrusnote behutsam in Öl ziehen lassen und abseihen. Das aromatisierte Öl beim Anrichten dosieren.'
      }
    ],
    mistake: 'Verwendet werden die aromatischen Fruchtschalen. Harte schwarze Samen aussortieren.',
    sources: [
      {
        title: 'Great British Chefs: Sichuanpfeffer',
        url: 'https://www.greatbritishchefs.com/collections/sichuan-peppercorn-recipes'
      }
    ]
  },
  {
    id: 'salbei',
    name: 'Salbei',
    aliases: ['Sage'],
    kind: 'Kraut',
    tags: ['herb', 'würzig', 'kräftig'],
    character: 'Kräftig herb und ätherisch, mit einer leicht an Minze erinnernden Note.',
    foods: ['Kürbis', 'Kartoffel', 'Pasta', 'Schwein'],
    partners: ['Butter', 'Zitrone', 'Knoblauch'],
    applications: [
      {
        form: 'Frische, trocken getupfte Blätter',
        place: 'In Fett',
        method:
          'In Butter sanft braten, bis sie aromatisch und leicht knusprig sind. Auf Kürbis oder Pasta geben. Nicht dunkel werden lassen.'
      },
      {
        form: 'Getrocknete Blätter, zerrieben',
        place: 'Sauce',
        method:
          'Sparsam in einer warmen Sauce oder Füllung mitziehen lassen. Nicht die Menge frischer Blätter übernehmen.'
      }
    ],
    mistake: 'Salbei sparsam verwenden und die Butter nicht zu heiß werden lassen.',
    sources: [
      {
        title: 'Good Food: Salbei',
        url: 'https://www.bbcgoodfood.com/glossary/sage-glossary'
      }
    ]
  },
  {
    id: 'estragon',
    name: 'Estragon',
    aliases: ['Tarragon'],
    kind: 'Kraut',
    tags: ['anisig', 'frisch', 'süßlich'],
    character:
      'Anisig und süßlich duftend. Französischer und russischer Estragon unterscheiden sich im Aroma. Vor dem Dosieren ein Blatt probieren.',
    foods: ['Huhn', 'Fisch', 'Ei', 'Karotte'],
    partners: ['Senf', 'Zitrone', 'Butter'],
    applications: [
      {
        form: 'Frische Blätter, gehackt',
        place: 'Sauce',
        method: 'Gegen Ende in eine warme Senf-Sahne-Sauce rühren. Vor weiterer Zugabe probieren.'
      },
      {
        form: 'Getrocknete Blätter',
        place: 'Sauce',
        method: 'In einer Sauce mitziehen lassen. Getrockneter Estragon duftet anders als frischer.'
      }
    ],
    mistake: 'Beim Wechsel zwischen frischem und getrocknetem Estragon mit wenig beginnen und abschmecken.',
    sources: [
      {
        title: 'Good Food: Estragon',
        url: 'https://tollbit.bbcgoodfood.com/glossary/tarragon-glossary'
      }
    ]
  },
  {
    id: 'majoran',
    name: 'Majoran',
    aliases: ['Marjoram'],
    kind: 'Kraut',
    tags: ['warm', 'würzig', 'süßlich'],
    character: 'Warm-würzig mit milden süßlichen Noten. Verwandt mit Oregano, aber kein identisches Aroma.',
    foods: ['Kartoffel', 'Bohnen', 'Schwein', 'Tomate'],
    partners: ['Kümmel', 'Knoblauch', 'Lorbeer'],
    applications: [
      {
        form: 'Getrocknete Blätter, zerrieben',
        place: 'Garflüssigkeit',
        method: 'In Kartoffelsuppe mitziehen lassen und vor dem Servieren abschmecken.'
      },
      {
        form: 'Frische Blätter',
        place: 'Finish',
        method: 'Zum Schluss über gegarte Bohnen oder Tomaten geben, wenn die Kräuternote deutlich bleiben soll.'
      }
    ],
    mistake: 'Oregano schmeckt meist kräftiger als Majoran. Beim Austauschen die Menge anpassen.',
    sources: [
      {
        title: 'Sysco: Kräuter- und Gewürzübersicht',
        url: 'https://syscoitems.ca/staging/recipes/FlavourGuide-Glossary%20%28English%29_0399360x1.pdf'
      }
    ]
  },
  {
    id: 'curryblaetter',
    name: 'Curryblätter',
    aliases: ['Curryblaetter', 'Curry Leaves', 'Kari Patta'],
    kind: 'Kraut',
    tags: ['würzig', 'frisch', 'zitrusartig'],
    character:
      'Aromatische Blätter mit eigener würziger Zitrusnote. Sie sind weder Currypulver noch das als Currykraut angebotene Küchenkraut.',
    foods: ['Kartoffel', 'Linsen', 'Reis', 'Kokos'],
    partners: ['Senfsaat', 'Ingwer', 'Kurkuma'],
    applications: [
      {
        form: 'Frische oder tiefgekühlte Blätter',
        place: 'In Fett',
        method:
          'Frische Blätter gründlich trocken tupfen. Tiefgekühlte von losem Eis befreien. Vorsichtig ins Öl geben, Spritzschutz verwenden und anschließend mit der Gemüsebasis garen.'
      },
      {
        form: 'Getrocknete Blätter',
        place: 'Garflüssigkeit',
        method:
          'In einer Kokossauce mitziehen lassen. Ihr Aroma ist meist schwächer als bei frischen Blättern. Currypulver schmeckt anders und ersetzt die Blätter nicht.'
      }
    ],
    mistake:
      'Blätter vor dem Braten gut trocknen, damit das Öl weniger spritzt. Currypulver ersetzt ihren Geschmack nicht.',
    sources: [
      {
        title: 'Swasthi: Kartoffelcurry mit Curryblättern',
        url: 'https://www.indianhealthyrecipes.com/potato-curry-aloo-sabzi/'
      }
    ]
  },
  {
    id: 'sesam',
    name: 'Sesam',
    aliases: ['Sesamsaat', 'Sesamsamen'],
    kind: 'Saat',
    tags: ['nussig', 'röstig'],
    character: 'Helle und schwarze Saat bringen nussige Noten und Biss. Rösten verändert Duft und Geschmack deutlich.',
    foods: ['Gurke', 'Tofu', 'Fisch', 'Brot', 'Grüne Bohnen'],
    partners: ['Knoblauch', 'Reisessig', 'Ingwer', 'Szechuanpfeffer'],
    applications: [
      {
        form: 'Helle oder schwarze Saat, ungeröstet',
        place: 'Am Produkt',
        method:
          'Für eine Kruste am Produkt verwenden oder separat trocken bei mäßiger Hitze rösten. Häufig bewegen und auf den Duft achten. Bei schwarzer Saat ist Bräunung schwerer zu erkennen.'
      },
      {
        form: 'Saat, bereits geröstet',
        place: 'Finish',
        method: 'Beim Servieren über Gurkensalat oder gegartes Gemüse streuen. Nicht unnötig erneut stark erhitzen.'
      },
      {
        form: 'Tahini (Sesampaste)',
        place: 'Dressing',
        method:
          'Die Paste im Glas verrühren, dann mit Zitronensaft und nach und nach Wasser zu einem cremigen Dressing rühren. Bei zu fester Konsistenz weiteres Wasser einarbeiten.'
      },
      {
        form: 'Geröstetes Sesamöl',
        place: 'Dressing',
        method:
          'Für Röstduft sparsam in ein Gurkendressing rühren oder am Ende über gegartes Gemüse geben. Zum Würzen verwenden. Mildes Öl aus ungerösteter Saat schmeckt anders.'
      }
    ],
    mistake:
      'Sesamsaat gibt Biss, Tahini macht Saucen cremig und geröstetes Öl würzt kräftig. Die Mengen lassen sich nicht eins zu eins übertragen.',
    sources: [
      {
        title: 'The Woks of Life: Gurkensalat mit Sesam',
        url: 'https://thewoksoflife.com/smashed-asian-cucumber-salad/'
      },
      {
        title: 'The Woks of Life: Geröstetes Sesamöl verwenden',
        url: 'https://thewoksoflife.com/sesame-oil/'
      },
      {
        title: 'Love and Lemons: Tahini-Dressing',
        url: 'https://www.loveandlemons.com/tahini-dressing/'
      }
    ]
  }
]
