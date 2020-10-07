import fn from './fn.js'
import './css/index.css'

console.log('i am main. Haha')
fn()

const h1 = document.createElement('h1')
h1.innerText = 'hello world'
document.body.appendChild(h1)

const h2 = document.createElement('h1')
h2.innerText = 'hello h2'
document.body.appendChild(h2)
// 创建一个按钮 点击时动态导入其他模块
var btn = document.createElement('button')
btn.innerText = 'click'
document.body.appendChild(btn)
btn.onclick = function() {
  import('./dynamic')
}
export default {
  library: '---export default library---'
}

export const library = '---export library---'