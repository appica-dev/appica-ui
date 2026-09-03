import { mount } from 'svelte'
import Root from './root.svelte'
import './styles.css'

const target = document.getElementById('app')
if (!target) throw new Error('Missing #app')

mount(Root, { target })
