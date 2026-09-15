import assert from 'node:assert/strict'
import { test } from 'node:test'
import { duplicateIds, findNestedTags, isExternalUrl, pageIds } from './built-site.mjs'

test('nested anchors and buttons are reported, siblings are not', () => {
  assert.equal(findNestedTags('<a href="#a"><a href="#b">x</a></a>', 'a').length, 1)
  assert.equal(findNestedTags('<a href="#a">x</a><a href="#b">y</a>', 'a').length, 0)
  assert.equal(findNestedTags('<button><button>x</button></button>', 'button').length, 1)
  assert.equal(findNestedTags('<button>x</button><button>y</button>', 'button').length, 0)
})

test('duplicate ids are reported once and single ids are left alone', () => {
  assert.deepEqual(duplicateIds('<p id="a"></p><p id="b"></p><p id="a"></p>'), ['a'])
  assert.deepEqual(duplicateIds('<p id="a"></p><p id="b"></p>'), [])
})

test('page ids collect every id in the document', () => {
  assert.deepEqual([...pageIds('<div id="zutaten"></div><a id="rezept-tipp"></a>')], ['zutaten', 'rezept-tipp'])
})

test('external urls are recognised', () => {
  for (const url of ['https://example.com', 'mailto:a@b.de', '//example.com/x', 'data:text/plain,x']) {
    assert.equal(isExternalUrl(url), true, url)
  }
  for (const url of ['/rezept/pizza/', '#zutaten', 'rezept/pizza/']) {
    assert.equal(isExternalUrl(url), false, url)
  }
})
