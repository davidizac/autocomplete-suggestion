const sentences = [
  'Do you have time to meet next week?',
  'I have forwarded this message to the appropriate service rep.',
  "If you're not the right person, can you please put me in touch with whoever is?",
  'Thanks again for chatting today and I look forward to hearing from you!'
]

const getIndexOfStringAt40percent = (str) => {
  return Math.round(str.length * 0.4)
}

function getCaretPosition () {
  const sel = document.getSelection()
  const r = sel.getRangeAt(0)
  let rect
  let r2
  const node = r.startContainer
  const offset = r.startOffset
  if (offset > 0) {
    r2 = document.createRange()
    r2.setStart(node, (offset - 1))
    r2.setEnd(node, offset)
    rect = r2.getBoundingClientRect()
    return { left: rect.right, top: rect.top }
  } else if (offset < node.length) {
    r2 = document.createRange()
    // similar but select next on letter
    r2.setStart(node, offset)
    r2.setEnd(node, (offset + 1))
    rect = r2.getBoundingClientRect()
    return { left: rect.left, top: rect.top }
  } else {
    rect = node.getBoundingClientRect()
    const styles = getComputedStyle(node)
    const lineHeight = parseInt(styles.lineHeight)
    const fontSize = parseInt(styles.fontSize)
    const delta = (lineHeight - fontSize) / 2
    return { left: rect.left, top: (rect.top + delta) }
  }
}

function createSuggestionElement (top, left, color, fontSize, text) {
  const element = document.createElement('DIV')
  element.id = 'my_suggestion_element'
  element.style.position = 'fixed'
  element.style.top = `${top}px`
  element.style.left = `${left}px`
  element.style.opacity = '0.5'
  element.style.fontStyle = 'italic'
  element.style.zIndex = '10000'
  element.style.display = 'block'
  element.style.color = color
  element.style.fontSize = fontSize
  element.textContent = text
  return element
}

function updateSuggestionElement (top, left, text, element) {
  element.style.top = `${top}px`
  element.style.left = `${left}px`
  element.style.display = 'block'
  element.textContent = text
  return element
}

let suggestionElement

const findSuggestion = (text) => {
  let suggestion
  for (const sentence of sentences) {
    if (suggestion) break
    for (let i = getIndexOfStringAt40percent(sentence); i <= sentence.length - 1; i++) {
      const subSentence = sentence.slice(0, i)
      if (text.match(new RegExp(subSentence))) {
        if (text.endsWith(subSentence)) {
          suggestion = sentence.slice(i, sentence.length)
          break
        }
      } else {
        break
      }
    }
  }
  return suggestion
}

const onClick = () => {
  window.addEventListener('click', () => {
    document.activeElement.addEventListener('keyup', (event) => {
      const text = typeof event.target.value === 'string' ? event.target.value : event.target.textContent
      const { color, fontSize } = getComputedStyle(event.target)
      const suggestion = findSuggestion(text)
      const code = event.keyCode || event.which
      if (code === 9 && suggestion) {
        event.preventDefault()
        if (suggestionElement) {
          suggestionElement.style.display = 'none'
        }
        event.target.value ? event.target.value = text + suggestion : event.target.textContent = text + suggestion
      } else if (suggestion) {
        const { top, left } = getCaretPosition()
        if (!suggestionElement) {
          suggestionElement = createSuggestionElement(top, left, color, fontSize, suggestion)
          document.body.appendChild(suggestionElement)
        }
        updateSuggestionElement(top, left, suggestion, suggestionElement)
      } else if (suggestionElement) {
        suggestionElement.style.display = 'none'
      }
    })
  })
}

if (!window.listenerStarted) {
  window.listenerStarted = true
  document.addEventListener('readystatechange', onClick)
}
