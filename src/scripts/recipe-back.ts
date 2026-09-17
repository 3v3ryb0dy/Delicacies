import { initRecipeNavigation } from '../lib/recipe-navigation.ts'

const back = document.querySelector<HTMLAnchorElement>('[data-recipe-back]')
if (back) initRecipeNavigation({ overviewUrl: back.href.split('#')[0] })
