import assert from 'node:assert/strict'
import { test } from 'node:test'
import { aromas } from '../config/aromas.ts'
import { aromaCombinations } from '../config/aroma-combinations.ts'
import { aromaSearchFields, combinationSearchFields, matchAromaSearch } from './aroma-search.ts'

const findAromas = (query) =>
  aromas.filter((aroma) => matchAromaSearch(aromaSearchFields(aroma), query).matches).map((aroma) => aroma.id)
const findCombinations = (query) =>
  aromaCombinations
    .filter((combination) => matchAromaSearch(combinationSearchFields(combination, aromas), query).matches)
    .map((combination) => combination.id)

test('seed content has unique anchors, valid references and complete application plans', () => {
  assert.equal(aromas.length, 36)
  assert.equal(aromaCombinations.length, 20)
  const ids = [...aromas, ...aromaCombinations].map((entry) => entry.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const aroma of aromas) {
    assert.ok(aroma.character && aroma.mistake && aroma.applications.length)
    for (const application of aroma.applications) assert.ok(application.form && application.place && application.method)
  }
  for (const combination of aromaCombinations) {
    assert.equal(combination.status, 'Zum Ausprobieren')
    assert.ok(combination.why && combination.product)
    assert.ok(combination.steps.length >= 3)
    assert.ok(['Grundwürzung', 'Vorbereitung'].includes(combination.steps[0].place))
    assert.equal(combination.steps.at(-1).place, 'Finish')
    assert.ok(combination.steps.some((step) => ['Garmethode', 'Vorbereitung'].includes(step.place)))
    for (const step of [...combination.steps, ...(combination.variant?.steps ?? [])]) {
      assert.ok(step.when && step.instruction)
      for (const ingredient of step.ingredients) {
        assert.ok(ingredient.name && ingredient.form && ingredient.role)
        if (ingredient.aromaId) assert.ok(aromas.some((aroma) => aroma.id === ingredient.aromaId))
      }
    }
  }
})

test('Lachs returns explicitly recorded partners and curated combinations with useful reasons', () => {
  assert.ok(findAromas('Lachs').includes('dill'))
  const dill = aromas.find((aroma) => aroma.id === 'dill')
  assert.equal(matchAromaSearch(aromaSearchFields(dill), 'Lachs').reason, 'Lebensmittelpartner: Lachs')
  assert.deepEqual(findCombinations('Lachs'), ['lachs-maracuja-senf-dill', 'lachs-dill-sumach-honig'])
  assert.equal(
    matchAromaSearch(combinationSearchFields(aromaCombinations[0], aromas), 'Lachs').reason,
    'Hauptprodukt: Lachs'
  )
})

test('aliases, capitalization, umlauts and whitespace normalize consistently', () => {
  assert.deepEqual(findAromas(' CUMIN '), ['kreuzkuemmel'])
  assert.deepEqual(findAromas('Kreuzkuemmel'), findAromas('Kreuzkümmel'))
  assert.deepEqual(findCombinations('Cumin'), findCombinations('Kreuzkümmel'))
  assert.ok(findAromas('Curry').includes('currypulver'))
  assert.ok(findAromas('Curry').includes('curryblaetter'))
  assert.ok(findAromas('SUESSLICH').includes('vanille'))
})

test('multiple words combine across fields, all are required, reasons explain both matches', () => {
  const dill = aromas.find((aroma) => aroma.id === 'dill')
  for (const id of ['muskat', 'dill', 'petersilie', 'oregano'])
    assert.ok(findAromas('  frisch   Finish  ').includes(id))
  assert.ok(!findAromas('frisch Finish').includes('paprika-edelsuess'))
  assert.equal(matchAromaSearch(aromaSearchFields(dill), 'frisch Finish').reason, 'Aroma: frisch · Einsatzort: Finish')
  assert.deepEqual(findCombinations('Lachs Cumin'), [])
  assert.deepEqual(findAromas('Lachs nichtvorhanden'), [])
})

test('empty query restores all entries and unknown queries yield no suggestions', () => {
  assert.equal(findAromas('  ').length, aromas.length)
  assert.equal(findCombinations('').length, aromaCombinations.length)
  assert.equal(matchAromaSearch(aromaSearchFields(aromas[0]), '').reason, '')
  assert.deepEqual(findAromas('unbekanntxyz'), [])
  assert.deepEqual(findCombinations('unbekanntxyz'), [])
})

test('new aliases reach the intended profile and its curated applications', () => {
  for (const [query, id] of [
    ['Cayenne', 'cayennepfeffer'],
    ['Paprika geräuchert', 'paprika-geraeuchert'],
    ['Kuemmel', 'kuemmel'],
    ['Kalonji', 'schwarzkuemmel'],
    ['Sesam', 'sesam'],
    ['Sichuan-Pfeffer', 'szechuanpfeffer'],
    ['Szechuanpfeffer', 'szechuanpfeffer']
  ])
    assert.ok(findAromas(query).includes(id), query)
  assert.deepEqual(findCombinations('Sichuan-Pfeffer'), ['bohnen-szechuanpfeffer-ingwer-chili'])
  assert.deepEqual(findCombinations('Szechuanpfeffer'), ['bohnen-szechuanpfeffer-ingwer-chili'])
  assert.ok(findCombinations('Sesam').includes('gurke-sesam-knoblauch-reisessig'))
  assert.deepEqual(findAromas('Kalonji'), ['schwarzkuemmel'])
  const lookup = (id) => aromaSearchFields(aromas.find((aroma) => aroma.id === id))
  assert.equal(matchAromaSearch(lookup('kreuzkuemmel'), 'Kalonji').matches, false)
  assert.equal(matchAromaSearch(lookup('kreuzkuemmel'), 'Kuemmel').reason, 'Name: Kreuzkümmel')
  assert.equal(matchAromaSearch(lookup('kuemmel'), 'Kuemmel').reason, 'Name: Kümmel')
  assert.equal(matchAromaSearch(lookup('schwarzkuemmel'), 'Kuemmel').reason, 'Name: Schwarzkümmel')
  assert.equal(matchAromaSearch(lookup('paprika-edelsuess'), 'Paprika geräuchert').matches, false)
})

test('new profiles and combination sources are complete and link to HTTPS references', () => {
  for (const entry of [...aromas.slice(17), ...aromaCombinations.slice(12)]) {
    assert.ok(entry.sources?.length, entry.id)
    for (const source of entry.sources) {
      assert.ok(source.title)
      assert.equal(new URL(source.url).protocol, 'https:')
    }
  }
  assert.equal(aromas.find((aroma) => aroma.id === 'sesam').kind, 'Saat')
  for (const combination of aromaCombinations.slice(12)) {
    assert.ok(combination.sources.some((source) => source.title.startsWith('Inspiriert von:')))
  }
})
