import type { AromaSource } from './aromas'

export type CombinationIngredient = {
  name: string
  aromaId?: string
  form: string
  role: string
}
export type CombinationStep = {
  place:
    'Grundwürzung' | 'Vorbereitung' | 'Garmethode' | 'Dressing' | 'Pürieren' | 'Binden' | 'Sauce' | 'Glasur' | 'Finish'
  when: string
  instruction: string
  ingredients: CombinationIngredient[]
}
export type AromaCombination = {
  id: string
  title: string
  product: string
  tags: string[]
  why: string
  status: 'Zum Ausprobieren' | 'Ausprobiert' | 'Bewährt'
  steps: CombinationStep[]
  variant?: { title: string; steps: CombinationStep[] }
  note?: string
  recipePath?: string
  sources?: AromaSource[]
}

const ingredient = (name: string, form: string, role: string, aromaId?: string): CombinationIngredient => ({
  name,
  form,
  role,
  ...(aromaId ? { aromaId } : {})
})
const step = (
  place: CombinationStep['place'],
  when: string,
  instruction: string,
  ...ingredients: CombinationIngredient[]
): CombinationStep => ({ place, when, instruction, ingredients })
const salt = ingredient('Salz', 'fein', 'Grundwürzung')
const oil = ingredient('Öl', 'flüssig', 'Bratfett')

export const aromaCombinations: readonly AromaCombination[] = [
  {
    id: 'lachs-maracuja-senf-dill',
    title: 'Lachs · Maracuja · Senf · Dill',
    product: 'Lachs',
    tags: ['fruchtig', 'säuerlich', 'frisch', 'grün'],
    status: 'Zum Ausprobieren',
    why: 'Gebratener Lachs mit fruchtig-säuerlicher Maracujasauce, würzigem Senf und frischem Dill.',
    steps: [
      step('Grundwürzung', 'Vor dem Braten', 'Den Lachs trocken tupfen und separat salzen.', salt),
      step(
        'Garmethode',
        'Anschließend',
        'Auf der Haut in Öl braten und vollständig garen. Die Sauce separat vorbereiten.',
        oil
      ),
      step(
        'Sauce',
        'Während der Fisch gart',
        'Maracujafruchtfleisch mit Dijon und Öl verrühren. Honig nur nach dem Abschmecken ergänzen. Beim Anrichten neben den Fisch geben, damit die Haut knusprig bleibt.',
        ingredient('Maracuja', 'Fruchtfleisch', 'Frucht und Säure'),
        ingredient('Dijon-Senf', 'fertiger Senf', 'Würze'),
        ingredient('Olivenöl', 'mild', 'Verbindung'),
        ingredient('Honig', 'flüssig, optional', 'Süße')
      ),
      step(
        'Finish',
        'Beim Anrichten',
        'Dill über den Fisch geben.',
        ingredient('Dill', 'frisch, gehackt', 'frisches Kräuteraroma', 'dill')
      )
    ],
    variant: {
      title: 'Variante mit Maracuja-Senf-Glasur',
      steps: [
        step(
          'Glasur',
          'Während der Fisch gart',
          'Maracujafruchtfleisch durch ein Sieb streichen und den Saft mit wenig Honig separat leicht sirupartig einkochen. Vom Herd nehmen und Dijon einrühren. Den fertig gebratenen Lachs auf der Fleischseite dünn damit bestreichen. Bei dieser Variante entfällt die kalte Sauce.',
          ingredient('Maracuja', 'durchgesiebter Saft, eingekocht', 'Frucht und Säure'),
          ingredient('Dijon-Senf', 'fertiger Senf', 'Würze'),
          ingredient('Honig', 'flüssig', 'Süße und Haftung')
        ),
        step(
          'Finish',
          'Nach dem Garen',
          'Frischen Dill über die glasierte Oberseite streuen.',
          ingredient('Dill', 'frisch, gehackt', 'frisches Kräuteraroma', 'dill')
        )
      ]
    }
  },
  {
    id: 'lachs-dill-sumach-honig',
    title: 'Lachs · Dill · Sumach · Honig',
    product: 'Lachs',
    tags: ['frisch', 'säuerlich', 'süß'],
    status: 'Zum Ausprobieren',
    why: 'Sumach bringt fruchtige Säure zum Lachs. Etwas Honig rundet die Sauce ab, Dill gibt ihr Frische.',
    note: 'Sumach bleibt im Dressing leicht körnig. Honig erst nach dem Probieren ergänzen, damit die Sauce nicht unnötig süß wird.',
    steps: [
      step('Grundwürzung', 'Vor dem Braten', 'Lachs trocken tupfen und salzen.', salt),
      step('Garmethode', 'Anschließend', 'In Öl auf der Haut braten und vollständig garen.', oil),
      step(
        'Sauce',
        'Währenddessen',
        'Sumach mit mildem Öl und etwas Wasser verrühren. Kurz ziehen lassen, bei Bedarf mit wenig Honig abrunden und neben den Fisch geben.',
        ingredient('Sumach', 'gemahlen, ungesalzen', 'Säure', 'sumach'),
        ingredient('Honig', 'flüssig, optional', 'Süße'),
        ingredient('Olivenöl', 'mild', 'Verbindung'),
        ingredient('Wasser', 'kalt', 'Konsistenz')
      ),
      step(
        'Finish',
        'Beim Anrichten',
        'Dill frisch darübergeben.',
        ingredient('Dill', 'frisch, gehackt', 'Kräuterfrische', 'dill')
      )
    ]
  },
  {
    id: 'karotte-kreuzkuemmel-vanille-zitrone',
    title: 'Karotte · Kreuzkümmel · Vanille · Zitrone',
    product: 'Karotte',
    tags: ['warm', 'erdig', 'säuerlich', 'süßlich'],
    status: 'Zum Ausprobieren',
    why: 'Kreuzkümmel würzt die süßen Ofenkarotten. Dazu kommen etwas Vanille in der Butter und Zitrone zum Schluss.',
    note: 'Vanille und Kreuzkümmel können beide dominant werden. Die Vanillebutter zunächst nur an einer kleinen Portion probieren, bevor sie über alle Karotten kommt.',
    steps: [
      step(
        'Grundwürzung',
        'Vor dem Rösten',
        'Karotten mit Salz, Öl und gemahlenem Kreuzkümmel vermengen.',
        salt,
        oil,
        ingredient('Kreuzkümmel', 'gemahlen', 'erdiges Hauptaroma', 'kreuzkuemmel')
      ),
      step('Garmethode', 'Anschließend', 'Karotten im Ofen rösten, bis sie weich sind und gebräunte Stellen haben.'),
      step(
        'Sauce',
        'Kurz vor dem Servieren',
        'Etwas Butter sanft schmelzen und wenig Vanillemark darin ziehen lassen. Über die Karotten geben.',
        ingredient('Butter', 'ungesalzen', 'Aromaträger'),
        ingredient('Vanille', 'Mark', 'süßlicher Hintergrund', 'vanille')
      ),
      step(
        'Finish',
        'Beim Anrichten',
        'Mit Zitronensaft abschmecken und etwas fein geriebene Schale darübergeben.',
        ingredient('Zitrone', 'Saft und essbare Schale', 'Säure und frischer Duft')
      )
    ]
  },
  {
    id: 'blumenkohl-butter-muskat-sumach',
    title: 'Blumenkohl · braune Butter · Muskat · Sumach',
    product: 'Blumenkohl',
    tags: ['nussig', 'warm', 'säuerlich'],
    status: 'Zum Ausprobieren',
    why: 'Milder Blumenkohl mit nussiger Butter, warmem Muskat und säuerlichem Sumach.',
    steps: [
      step('Grundwürzung', 'Vor dem Rösten', 'Röschen mit Salz und Öl vermengen.', salt, oil),
      step('Garmethode', 'Anschließend', 'Blumenkohl im Ofen weich rösten und stellenweise bräunen.'),
      step(
        'Sauce',
        'Gegen Ende',
        'Butter separat erhitzen, bis die Milchbestandteile goldbraun sind und nussig duften. Vom Herd nehmen, Muskat einrühren und über den Blumenkohl geben.',
        ingredient('Butter', 'zu brauner Butter gebräunt', 'nussiges Hauptaroma'),
        ingredient('Muskat', 'frisch gerieben', 'warme Unterstützung', 'muskat')
      ),
      step(
        'Finish',
        'Beim Anrichten',
        'Sumach über die Röschen streuen.',
        ingredient('Sumach', 'gemahlen, ungesalzen', 'Säure', 'sumach')
      )
    ]
  },
  {
    id: 'lamm-kreuzkuemmel-piment-zimt',
    title: 'Lamm · Kreuzkümmel · Piment · Zimt · Petersilie',
    product: 'Lamm',
    tags: ['warm', 'würzig', 'frisch'],
    status: 'Zum Ausprobieren',
    why: 'Kräftig gewürzte Lammfrikadellen mit Kreuzkümmel, etwas Piment und Zimt. Frische Petersilie kommt nach dem Braten darüber.',
    steps: [
      step(
        'Grundwürzung',
        'Vor dem Formen',
        'Lammhack mit Salz, Kreuzkümmel und jeweils weniger Piment und Zimt vermengen. Eine kleine Probe durchbraten und abschmecken.',
        salt,
        ingredient('Kreuzkümmel', 'gemahlen', 'Hauptaroma', 'kreuzkuemmel'),
        ingredient('Piment', 'gemahlen', 'warme Unterstützung', 'piment'),
        ingredient('Zimt', 'gemahlen', 'Hintergrund', 'zimt')
      ),
      step('Garmethode', 'Nach dem Abschmecken', 'Flache Frikadellen formen und in Öl vollständig durchbraten.', oil),
      step(
        'Finish',
        'Beim Anrichten',
        'Frisch gehackte Petersilie darüberstreuen.',
        ingredient('Petersilie', 'frische Blätter, gehackt', 'Kräuterfrische', 'petersilie')
      )
    ]
  },
  {
    id: 'ente-wacholder-orange-thymian',
    title: 'Ente · Wacholder · Orange · Thymian',
    product: 'Ente',
    tags: ['harzig', 'fruchtig', 'würzig'],
    status: 'Zum Ausprobieren',
    why: 'Zur Ente gibt es eine Orangensauce mit Wacholder und Thymian. Die harzigen Gewürze passen zum kräftigen Fleisch.',
    steps: [
      step('Grundwürzung', 'Vor dem Garen', 'Entenkeulen trocken tupfen und salzen.', salt),
      step(
        'Garmethode',
        'Anschließend',
        'Keulen mit der Hautseite nach oben im Ofen vollständig und weich garen. Etwas entfetteten Bratensaft für die Sauce auffangen.'
      ),
      step(
        'Sauce',
        'Gegen Ende der Garzeit',
        'Orangensaft und Bratensaft mit angedrücktem Wacholder und Thymian köcheln lassen. Probieren und abseihen, sobald die Sauce kräftig genug gewürzt ist. Zur Ente servieren.',
        ingredient('Orange', 'frisch gepresster Saft', 'Frucht und Säure'),
        ingredient('Wacholder', 'getrocknete Beeren, angedrückt', 'harzige Würze', 'wacholder'),
        ingredient('Thymian', 'frische Zweige', 'Unterstützung', 'thymian')
      ),
      step(
        'Finish',
        'Beim Anrichten',
        'Etwas fein geriebene Orangenschale über die Sauce geben.',
        ingredient('Orange', 'essbare Schale', 'frischer Duft')
      )
    ]
  },
  {
    id: 'kuerbis-bockshornklee-honig-limette',
    title: 'Kürbis · Bockshornklee · Honig · Limette',
    product: 'Kürbis',
    tags: ['herb', 'süß', 'säuerlich'],
    status: 'Zum Ausprobieren',
    why: 'Bockshornkleesamen schmecken herb und leicht bitter, Kürbis bringt Süße mit. Limette macht das Gericht frischer. Honig nur nach Geschmack ergänzen.',
    note: 'Bockshornkleesamen sparsam verwenden. Zu viel davon macht den Kürbis bitter, auch mit zusätzlichem Honig.',
    steps: [
      step('Grundwürzung', 'Vor dem Garen', 'Kürbiswürfel mit Salz würzen.', salt),
      step(
        'Garmethode',
        'Anschließend',
        'Wenig gemahlene Bockshornkleesamen bei milder Hitze in Öl einrühren. Direkt Kürbis und etwas Wasser zugeben und zugedeckt weich garen.',
        oil,
        ingredient('Bockshornklee', 'gemahlene Samen, keine Blätter', 'herbe Würze', 'bockshornklee'),
        ingredient('Wasser', 'zum Dünsten', 'Garflüssigkeit')
      ),
      step(
        'Glasur',
        'Wenn der Kürbis weich ist',
        'Ist noch viel Flüssigkeit in der Pfanne, die weichen Kürbiswürfel herausheben und den Sud einkochen. Nach Geschmack wenig Honig einrühren und den Kürbis kurz darin wenden.',
        ingredient('Honig', 'flüssig, optional', 'Süße')
      ),
      step(
        'Finish',
        'Abseits der Hitze',
        'Mit Limettensaft abschmecken.',
        ingredient('Limette', 'frischer Saft', 'Säure')
      )
    ]
  },
  {
    id: 'rote-bete-wacholder-orange-ziegenkaese',
    title: 'Rote Bete · Wacholder · Orange · Ziegenkäse',
    product: 'Rote Bete',
    tags: ['erdig', 'harzig', 'fruchtig'],
    status: 'Zum Ausprobieren',
    why: 'Erdige Rote Bete mit fruchtiger Orangensauce, etwas Wacholder und cremigem Ziegenkäse.',
    steps: [
      step('Grundwürzung', 'Vor dem Garen', 'Geschälte Betespalten mit Salz und Öl vermengen.', salt, oil),
      step('Garmethode', 'Anschließend', 'Abgedeckt im Ofen weich garen. Zum Schluss offen rösten.'),
      step(
        'Sauce',
        'Währenddessen',
        'Orangensaft mit angedrücktem Wacholder sanft einkochen. Beeren abseihen und den Saft mit etwas Olivenöl verrühren. Über die Bete geben.',
        ingredient('Orange', 'Saft', 'Frucht und Säure'),
        ingredient('Wacholder', 'getrocknete Beeren, angedrückt', 'harzige Würze', 'wacholder'),
        ingredient('Olivenöl', 'mild', 'Verbindung')
      ),
      step(
        'Finish',
        'Beim Anrichten',
        'Ziegenfrischkäse darüberbröckeln.',
        ingredient('Ziegenkäse', 'Frischkäse', 'cremiger Gegenpart')
      )
    ]
  },
  {
    id: 'garnele-maracuja-vanille-chili',
    title: 'Garnele · Maracuja · Vanille · Chili',
    product: 'Garnele',
    tags: ['fruchtig', 'süßlich', 'scharf'],
    status: 'Zum Ausprobieren',
    why: 'Maracuja und Chili geben den Garnelen Säure und Schärfe. Wenig Vanille ergänzt den süßlichen Duft der Sauce.',
    note: 'Maracujas können unterschiedlich sauer sein. Sauce separat abschmecken und Vanille zunächst nur in einem kleinen Teil testen. Sie soll den Garnelengeschmack nicht überdecken.',
    steps: [
      step('Grundwürzung', 'Vor dem Braten', 'Geschälte Garnelen trocken tupfen und salzen.', salt),
      step(
        'Garmethode',
        'Anschließend',
        'In Öl braten, bis sie vollständig gegart sind. Auf einen Teller nehmen.',
        oil
      ),
      step(
        'Sauce',
        'Separat während des Bratens',
        'Maracujafruchtfleisch mit etwas Wasser, wenig Vanillemark und fein gehackter Chili sanft erwärmen. Probieren und nach Geschmack nachwürzen.',
        ingredient('Maracuja', 'Fruchtfleisch', 'Frucht und Säure'),
        ingredient('Vanille', 'Mark', 'süßlicher Hintergrund', 'vanille'),
        ingredient('Chili', 'frisch, fein gehackt', 'Schärfe'),
        ingredient('Wasser', 'nach Bedarf', 'Konsistenz')
      ),
      step('Finish', 'Beim Anrichten', 'Die warme Sauce um die Garnelen geben.')
    ]
  },
  {
    id: 'pilze-thymian-muskat-butter',
    title: 'Pilze · Thymian · Muskat · braune Butter',
    product: 'Pilze',
    tags: ['würzig', 'nussig', 'warm'],
    status: 'Zum Ausprobieren',
    why: 'Gebratene Pilze mit nussiger Butter und Thymian. Etwas Muskat kommt zum Schluss dazu.',
    steps: [
      step('Grundwürzung', 'Vor dem Braten', 'Pilze putzen, trocken halten und gleichmäßig schneiden.'),
      step('Garmethode', 'Anschließend', 'Portionsweise in Öl bräunen, dann salzen.', oil, salt),
      step(
        'Sauce',
        'In einer separaten kleinen Pfanne',
        'Butter goldbraun werden lassen und die Pfanne vom Herd nehmen. Thymian in der heißen Butter ziehen lassen. Sobald er duftet, Zweige entfernen und Butter zu den Pilzen geben, damit sie nicht weiter bräunt.',
        ingredient('Butter', 'zu brauner Butter gebräunt', 'nussiges Hauptaroma'),
        ingredient('Thymian', 'frische Zweige', 'Kräuterwürze', 'thymian')
      ),
      step(
        'Finish',
        'Abseits der Hitze',
        'Mit frisch geriebener Muskat abschmecken.',
        ingredient('Muskat', 'frisch gerieben', 'warmer Hintergrund', 'muskat')
      )
    ]
  },
  {
    id: 'tomate-oregano-sumach-zimt',
    title: 'Tomate · Oregano · Sumach · Zimt',
    product: 'Tomate',
    tags: ['fruchtig', 'würzig', 'säuerlich'],
    status: 'Zum Ausprobieren',
    why: 'Eine Tomatensauce mit Oregano und wenig Zimt. Sumach gibt ihr nach dem Kochen noch etwas fruchtige Säure.',
    note: 'Tomaten bringen bereits Säure mit. Sumach zunächst an einem Löffel Sauce probieren und nur ergänzen, wenn dir die zusätzliche Säure schmeckt.',
    steps: [
      step('Grundwürzung', 'Vor dem Garen', 'Grob gewürfelte Tomaten mit Salz würzen.', salt),
      step(
        'Garmethode',
        'Anschließend',
        'Tomaten in Olivenöl anschmoren.',
        ingredient('Olivenöl', 'mild', 'Aromaträger')
      ),
      step(
        'Sauce',
        'Beim Köcheln',
        'Oregano und wenig Zimt einrühren. Zu einer stückigen Sauce köcheln lassen und abschmecken.',
        ingredient('Oregano', 'getrocknete Blätter', 'Kräuterwürze', 'oregano'),
        ingredient('Zimt', 'gemahlen', 'warmer Hintergrund', 'zimt')
      ),
      step(
        'Finish',
        'Nach dem Garen',
        'Sumach auf die angerichtete Sauce streuen.',
        ingredient('Sumach', 'gemahlen, ungesalzen', 'Säure', 'sumach')
      )
    ]
  },
  {
    id: 'garnele-maracuja-kreuzkuemmel',
    title: 'Garnele · Maracuja · Kreuzkümmel',
    product: 'Garnele',
    tags: ['warm', 'erdig', 'fruchtig', 'säuerlich'],
    status: 'Zum Ausprobieren',
    why: 'Die Garnelen werden mit Kreuzkümmel gebraten. Dazu gibt es eine fruchtig-säuerliche Maracujasauce.',
    steps: [
      step(
        'Grundwürzung',
        'Vor dem Braten',
        'Garnelen trocken tupfen und mit Salz sowie wenig gemahlenem Kreuzkümmel würzen.',
        salt,
        ingredient('Kreuzkümmel', 'gemahlen', 'erdiges Hauptaroma', 'kreuzkuemmel')
      ),
      step(
        'Garmethode',
        'Anschließend',
        'In Öl vollständig garen. Die Hitze so wählen, dass das Gewürz nicht verbrennt.',
        oil
      ),
      step(
        'Sauce',
        'Währenddessen',
        'Maracujafruchtfleisch mit mildem Olivenöl verrühren. Probieren und Limettensaft nach Bedarf ergänzen.',
        ingredient('Maracuja', 'Fruchtfleisch', 'Frucht und Säure'),
        ingredient('Olivenöl', 'mild', 'Verbindung'),
        ingredient('Limette', 'Saft, optional', 'zusätzliche Säure')
      ),
      step('Finish', 'Beim Anrichten', 'Die Sauce über oder neben die Garnelen geben.')
    ]
  },
  {
    id: 'huhn-rauchpaprika-kreuzkuemmel-cayenne',
    title: 'Huhn · Paprika (geräuchert) · Kreuzkümmel · Cayenne · Zitrone',
    product: 'Huhn',
    tags: ['rauchig', 'warm', 'scharf'],
    why: 'Geräucherte Paprika und Kreuzkümmel würzen das Huhn. Mit Cayenne lässt sich die Schärfe dosieren, Zitronensaft kommt beim Servieren darüber.',
    status: 'Zum Ausprobieren',
    steps: [
      {
        place: 'Grundwürzung',
        when: 'Vor dem Garen',
        instruction:
          'Butter schmelzen und den grob zerstoßenen Kreuzkümmel darin erwärmen, bis er duftet. Hitze reduzieren, milde Rauchpaprika und Cayenne einrühren und vom Herd nehmen. Keulen salzen und mit der Gewürzbutter bestreichen.',
        ingredients: [
          {
            name: 'Salz',
            form: 'fein',
            role: 'Grundwürzung'
          },
          {
            name: 'Butter',
            form: 'geschmolzen',
            role: 'Aromaträger'
          },
          {
            name: 'Paprika (geräuchert)',
            form: 'gemahlen, mild',
            role: 'Rauch',
            aromaId: 'paprika-geraeuchert'
          },
          {
            name: 'Kreuzkümmel',
            form: 'grob zerstoßen',
            role: 'erdige Würze',
            aromaId: 'kreuzkuemmel'
          },
          {
            name: 'Cayennepfeffer',
            form: 'gemahlen',
            role: 'Schärfe',
            aromaId: 'cayennepfeffer'
          }
        ]
      },
      {
        place: 'Garmethode',
        when: 'Anschließend',
        instruction:
          'Keulen mit der Haut nach oben im Ofen garen, bis das Fleisch am Knochen durch und zart ist. Die Gewürzschicht soll bräunen, nicht schwarz werden.',
        ingredients: []
      },
      {
        place: 'Sauce',
        when: 'Nach dem Garen',
        instruction: 'Den gegarten Bratensaft über das Fleisch geben.',
        ingredients: []
      },
      {
        place: 'Finish',
        when: 'Beim Servieren',
        instruction: 'Zitronensaft nach Geschmack über das Huhn geben.',
        ingredients: [
          {
            name: 'Zitrone',
            form: 'frischer Saft',
            role: 'Säure'
          }
        ]
      }
    ],
    sources: [
      {
        title: 'Inspiriert von: Milk Street: Paprika-Cumin Chicken',
        url: 'https://apnews.com/article/efcbb80aff08c4ceb94d90b36b294998'
      }
    ]
  },
  {
    id: 'mais-rauchpaprika-limette',
    title: 'Mais · Paprika (geräuchert) · Limette · Butter',
    product: 'Mais',
    tags: ['rauchig', 'süßlich', 'säuerlich'],
    why: 'Süßer, gerösteter Mais mit rauchiger Paprikabutter und frischem Limettensaft.',
    status: 'Zum Ausprobieren',
    steps: [
      {
        place: 'Grundwürzung',
        when: 'Vor dem Rösten',
        instruction: 'Vorgegarte Maiskolben trocken tupfen und dünn mit Öl bestreichen.',
        ingredients: [
          {
            name: 'Öl',
            form: 'neutral',
            role: 'Bratfett'
          }
        ]
      },
      {
        place: 'Garmethode',
        when: 'Anschließend',
        instruction: 'In der Pfanne oder auf dem Grill rösten und mehrfach wenden.',
        ingredients: []
      },
      {
        place: 'Sauce',
        when: 'Währenddessen',
        instruction:
          'Mild geräuchertes Paprikapulver in weiche Butter rühren und auf dem heißen Mais schmelzen lassen.',
        ingredients: [
          {
            name: 'Paprika (geräuchert)',
            form: 'gemahlen, mild',
            role: 'Rauch',
            aromaId: 'paprika-geraeuchert'
          },
          {
            name: 'Butter',
            form: 'weich',
            role: 'Aromaträger'
          }
        ]
      },
      {
        place: 'Finish',
        when: 'Beim Anrichten',
        instruction: 'Mit Limettensaft beträufeln.',
        ingredients: [
          {
            name: 'Limette',
            form: 'frischer Saft',
            role: 'Säure'
          }
        ]
      }
    ],
    sources: [
      {
        title: 'Inspiriert von: Good Food: Mais mit Paprika-Limetten-Butter',
        url: 'https://tollbit.bbcgoodfood.com/howto/guide/best-spices'
      }
    ]
  },
  {
    id: 'schwein-fenchelsaat-rosmarin-zitrone',
    title: 'Schwein · Fenchelsaat · Rosmarin · Zitrone',
    product: 'Schwein',
    tags: ['anisig', 'harzig', 'frisch'],
    why: 'Fenchelsaat bringt einen süßlichen Anisduft ans Fleisch, Rosmarin würzt kräftig. Zitrone kommt in die buttrige Pfannensauce.',
    status: 'Zum Ausprobieren',
    steps: [
      {
        place: 'Grundwürzung',
        when: 'Vor dem Braten',
        instruction:
          'Fenchelsaat und Rosmarin mit Salz fein mörsern oder in einer Gewürzmühle zerkleinern. Die Mischung auf beide Seiten des Schweinekoteletts reiben.',
        ingredients: [
          {
            name: 'Salz',
            form: 'fein',
            role: 'Grundwürzung'
          },
          {
            name: 'Fenchelsaat',
            form: 'fein gemörsert',
            role: 'anisige Würze',
            aromaId: 'fenchelsaat'
          },
          {
            name: 'Rosmarin',
            form: 'frische Nadeln, fein zerkleinert',
            role: 'harziger Gegenpart',
            aromaId: 'rosmarin'
          }
        ]
      },
      {
        place: 'Garmethode',
        when: 'Anschließend',
        instruction:
          'In Öl braten und vollständig garen. Die Hitze so wählen, dass Saat und Kräuter nicht verbrennen. Fleisch anschließend herausnehmen.',
        ingredients: [
          {
            name: 'Öl',
            form: 'neutral',
            role: 'Bratfett'
          }
        ]
      },
      {
        place: 'Sauce',
        when: 'Nach dem Braten',
        instruction: 'Den Bratensatz mit wenig Wasser lösen. Abseits der Hitze Butter und Zitronensaft einrühren.',
        ingredients: [
          {
            name: 'Wasser',
            form: 'zum Ablöschen',
            role: 'Konsistenz'
          },
          {
            name: 'Butter',
            form: 'kalt',
            role: 'Verbindung'
          },
          {
            name: 'Zitrone',
            form: 'frischer Saft',
            role: 'Säure'
          }
        ]
      },
      {
        place: 'Finish',
        when: 'Beim Anrichten',
        instruction: 'Sauce über oder neben das Fleisch geben.',
        ingredients: []
      }
    ],
    sources: [
      {
        title: 'Inspiriert von: Milk Street: Kotelett mit Fenchel und Rosmarin',
        url: 'https://apnews.com/article/cbc9ccd6b6f055602ef32bd7528011a7'
      }
    ]
  },
  {
    id: 'rotkohl-kuemmel-dill-zitrone',
    title: 'Rotkohl · Kümmel · Dill · Zitrone',
    product: 'Rotkohl',
    tags: ['frisch', 'würzig', 'säuerlich'],
    why: 'Ein knackiger Rotkohlsalat mit Kümmel im Zitronendressing und frischem Dill.',
    status: 'Zum Ausprobieren',
    steps: [
      {
        place: 'Grundwürzung',
        when: 'Zu Beginn',
        instruction: 'Rotkohl sehr fein schneiden, leicht salzen und mit den Händen etwas weich kneten.',
        ingredients: [
          {
            name: 'Salz',
            form: 'fein',
            role: 'Grundwürzung'
          }
        ]
      },
      {
        place: 'Vorbereitung',
        when: 'Für diesen Salat',
        instruction: 'Roh verwenden. Nach dem Kneten kurz stehen lassen und überschüssige Flüssigkeit abgießen.',
        ingredients: []
      },
      {
        place: 'Dressing',
        when: 'Vor dem Servieren',
        instruction:
          'Kümmel leicht anstoßen und mit Zitronensaft und Öl verrühren. Unter den Kohl mischen und ziehen lassen.',
        ingredients: [
          {
            name: 'Kümmel',
            form: 'ganze Saat, angestoßen',
            role: 'Würze',
            aromaId: 'kuemmel'
          },
          {
            name: 'Zitrone',
            form: 'frischer Saft',
            role: 'Säure'
          },
          {
            name: 'Öl',
            form: 'mild',
            role: 'Verbindung'
          }
        ]
      },
      {
        place: 'Finish',
        when: 'Beim Anrichten',
        instruction: 'Frisch gehackten Dill untermischen.',
        ingredients: [
          {
            name: 'Dill',
            form: 'frisch, gehackt',
            role: 'Kräuterfrische',
            aromaId: 'dill'
          }
        ]
      }
    ],
    sources: [
      {
        title: 'Inspiriert von: Great British Chefs: Rotkohl und Aromapartner',
        url: 'https://www.greatbritishchefs.com/how-to-cook/how-to-cook-red-cabbage'
      }
    ]
  },
  {
    id: 'karotte-koriandersaat-thymian',
    title: 'Karotte · Koriandersaat · Thymian',
    product: 'Karotte',
    tags: ['warm', 'zitrusartig', 'würzig'],
    why: 'Eine Karottensuppe mit zitrusartig duftender Koriandersaat und Thymian. Die Gewürze ziehen beim Kochen in der Suppe mit.',
    status: 'Zum Ausprobieren',
    steps: [
      {
        place: 'Grundwürzung',
        when: 'Zu Beginn',
        instruction: 'Zwiebel würfeln, Koriandersaat anstoßen und beides mit etwas Öl sanft anschwitzen.',
        ingredients: [
          {
            name: 'Öl',
            form: 'neutral',
            role: 'Bratfett'
          },
          {
            name: 'Zwiebel',
            form: 'gewürfelt',
            role: 'Basis'
          },
          {
            name: 'Koriandersaat',
            form: 'ganze Saat, angestoßen',
            role: 'zitrusartige Würze',
            aromaId: 'koriandersaat'
          }
        ]
      },
      {
        place: 'Garmethode',
        when: 'Anschließend',
        instruction:
          'Karottenstücke und Thymian zugeben und bei milder Hitze anschwitzen, bis die Karotten leicht Farbe annehmen. Dann mit Gemüsebrühe bedecken und weich köcheln. Holzige Thymianstiele vor dem Pürieren herausnehmen.',
        ingredients: [
          {
            name: 'Thymian',
            form: 'frische Zweige',
            role: 'Kräuterwürze',
            aromaId: 'thymian'
          },
          {
            name: 'Gemüsebrühe',
            form: 'flüssig',
            role: 'Garflüssigkeit'
          }
        ]
      },
      {
        place: 'Pürieren',
        when: 'Wenn die Karotten weich sind',
        instruction: 'Alles zur Suppe pürieren und die Konsistenz mit Brühe anpassen.',
        ingredients: []
      },
      {
        place: 'Finish',
        when: 'Vor dem Servieren',
        instruction: 'Mit etwas Weißweinessig abschmecken.',
        ingredients: [
          {
            name: 'Weißweinessig',
            form: 'flüssig',
            role: 'Säure'
          }
        ]
      }
    ],
    sources: [
      {
        title: 'Inspiriert von: Great British Chefs: Karotten-Koriander-Suppe',
        url: 'https://www.greatbritishchefs.com/recipes/carrot-coriander-soup-recipe'
      }
    ]
  },
  {
    id: 'kartoffel-senfsaat-curryblaetter-ingwer',
    title: 'Kartoffel · Senfsaat · Curryblätter · Ingwer',
    product: 'Kartoffel',
    tags: ['würzig', 'frisch', 'warm'],
    why: 'Kartoffeln in einer würzigen Zwiebelbasis mit Ingwer. Senfsaat und Curryblätter werden zuerst in Öl erhitzt.',
    status: 'Zum Ausprobieren',
    steps: [
      {
        place: 'Vorbereitung',
        when: 'Vor dem Garen',
        instruction:
          'Kartoffeln würfeln, Zwiebel und Ingwer fein schneiden. Frische Curryblätter gründlich trocken tupfen.',
        ingredients: []
      },
      {
        place: 'Garmethode',
        when: 'Anschließend',
        instruction:
          'Braune Senfsaat in Öl erhitzen, bis sie zu springen beginnt. Curryblätter vorsichtig zugeben. Zwiebel darin glasig dünsten, dann Ingwer kurz mitbraten. Kartoffeln zugeben und so viel Wasser angießen, dass sie teilweise bedeckt sind. Zugedeckt weich garen.',
        ingredients: [
          {
            name: 'Zwiebel',
            form: 'gewürfelt',
            role: 'Basis'
          },
          {
            name: 'Ingwer',
            form: 'frisch, fein gehackt',
            role: 'frische Schärfe',
            aromaId: 'ingwer'
          },
          {
            name: 'Curryblätter',
            form: 'frisch, trocken getupft',
            role: 'Kräuterduft',
            aromaId: 'curryblaetter'
          },
          {
            name: 'Öl',
            form: 'neutral',
            role: 'Bratfett'
          },
          {
            name: 'Senfsaat',
            form: 'braune Saat, ganz',
            role: 'Saatwürze',
            aromaId: 'senfsaat'
          },
          {
            name: 'Wasser',
            form: 'zum Garen',
            role: 'Garflüssigkeit'
          }
        ]
      },
      {
        place: 'Binden',
        when: 'Wenn die Kartoffeln weich sind',
        instruction:
          'Einige Kartoffelstücke zerdrücken und mit der restlichen Garflüssigkeit verrühren, sodass sie die übrigen Stücke leicht umhüllt.',
        ingredients: []
      },
      {
        place: 'Finish',
        when: 'Vor dem Servieren',
        instruction: 'Mit Salz abschmecken.',
        ingredients: [salt]
      }
    ],
    sources: [
      {
        title: 'Inspiriert von: Swasthi: Kartoffelcurry',
        url: 'https://www.indianhealthyrecipes.com/potato-curry-aloo-sabzi/'
      }
    ]
  },
  {
    id: 'gurke-sesam-knoblauch-reisessig',
    title: 'Gurke · Sesam · Knoblauch · Reisessig',
    product: 'Gurke',
    tags: ['nussig', 'frisch', 'säuerlich'],
    why: 'Knackige Gurke mit Knoblauch und Reisessig. Geröstetes Sesamöl würzt das Dressing, Sesamsaat gibt Biss.',
    status: 'Zum Ausprobieren',
    steps: [
      {
        place: 'Grundwürzung',
        when: 'Zu Beginn',
        instruction: 'Gurke leicht andrücken, in mundgerechte Stücke teilen, leicht salzen und kurz ziehen lassen.',
        ingredients: [
          {
            name: 'Salz',
            form: 'fein',
            role: 'Grundwürzung'
          }
        ]
      },
      {
        place: 'Vorbereitung',
        when: 'Für diesen Salat',
        instruction: 'Gurke roh lassen und ausgetretenes Wasser abgießen.',
        ingredients: []
      },
      {
        place: 'Dressing',
        when: 'Kurz vor dem Servieren',
        instruction:
          'Fein geriebenen Knoblauch mit Reisessig, Sojasauce und wenig geröstetem Sesamöl verrühren. Mit der Gurke vermengen.',
        ingredients: [
          {
            name: 'Knoblauch',
            form: 'frisch, fein gerieben',
            role: 'Würze'
          },
          {
            name: 'Reisessig',
            form: 'ungesüßt',
            role: 'Säure'
          },
          {
            name: 'Sojasauce',
            form: 'hell',
            role: 'Würze und Salz'
          },
          {
            name: 'Sesamöl',
            form: 'geröstet',
            role: 'Röstduft',
            aromaId: 'sesam'
          }
        ]
      },
      {
        place: 'Finish',
        when: 'Beim Anrichten',
        instruction: 'Geröstete Sesamsaat darüberstreuen.',
        ingredients: [
          {
            name: 'Sesam',
            form: 'helle Saat, geröstet',
            role: 'Biss und Nussaroma',
            aromaId: 'sesam'
          }
        ]
      }
    ],
    sources: [
      {
        title: 'Inspiriert von: The Woks of Life: Smashed Cucumber Salad',
        url: 'https://thewoksoflife.com/smashed-asian-cucumber-salad/'
      }
    ]
  },
  {
    id: 'bohnen-szechuanpfeffer-ingwer-chili',
    title: 'Grüne Bohnen · Szechuanpfeffer · Ingwer · Chili',
    product: 'Grüne Bohnen',
    tags: ['prickelnd', 'scharf', 'zitrusartig'],
    why: 'Gebratene Bohnen mit Ingwer, Knoblauch und Chili. Szechuanpfeffer bringt Zitrusduft und das typische Prickeln auf der Zunge.',
    status: 'Zum Ausprobieren',
    steps: [
      {
        place: 'Vorbereitung',
        when: 'Zu Beginn',
        instruction: 'Bohnen putzen und gründlich trocken tupfen. Ingwer, Knoblauch und Chili vorbereiten.',
        ingredients: []
      },
      {
        place: 'Garmethode',
        when: 'Anschließend',
        instruction:
          'In einem Wok oder einer tiefen Pfanne etwa 3 cm Öl erhitzen. Bohnen portionsweise etwa 5 Minuten frittieren, bis ihre Haut Blasen wirft und runzlig wird. Herausnehmen und auf Küchenpapier abtropfen lassen. Bis auf etwa 1 EL das Öl vorsichtig in ein hitzefestes Gefäß abgießen. Bei reduzierter Hitze Ingwer, Knoblauch und Chili im verbleibenden Öl anbraten.',
        ingredients: [
          {
            name: 'Ingwer',
            form: 'frisch, fein gehackt',
            role: 'frische Schärfe',
            aromaId: 'ingwer'
          },
          {
            name: 'Knoblauch',
            form: 'frisch, fein gehackt',
            role: 'Würze'
          },
          {
            name: 'Chili',
            form: 'frisch, fein gehackt',
            role: 'Schärfe'
          },
          {
            name: 'Öl',
            form: 'neutral',
            role: 'Bratfett'
          }
        ]
      },
      {
        place: 'Sauce',
        when: 'Gegen Ende',
        instruction:
          'Sojasauce und einen Schuss Wasser zu den Gewürzen geben. Bohnen zurück in die Pfanne geben und kurz darin schwenken.',
        ingredients: [
          {
            name: 'Sojasauce',
            form: 'hell',
            role: 'Würze und Salz'
          },
          {
            name: 'Wasser',
            form: 'zum Lösen des Bratensatzes',
            role: 'Konsistenz'
          }
        ]
      },
      {
        place: 'Finish',
        when: 'Unmittelbar vor dem Servieren',
        instruction: 'Fein gemahlene rote Szechuanpfefferschalen untermischen und abschmecken.',
        ingredients: [
          {
            name: 'Szechuanpfeffer',
            form: 'rote Fruchtschalen, fein gemahlen',
            role: 'Prickeln und Zitrusduft',
            aromaId: 'szechuanpfeffer'
          }
        ]
      }
    ],
    sources: [
      {
        title: 'Inspiriert von: Great British Chefs: Sichuan Green Beans',
        url: 'https://www.greatbritishchefs.com/recipes/sichuan-green-beans-recipe'
      }
    ]
  }
]
