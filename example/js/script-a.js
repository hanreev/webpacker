// Vanilla JS
document.addEventListener('load', () => {
  const button = document.createElement('button')
  button.innerText = 'Button 1'
  document.body.appendChild(button)

  console.log('test')
})

// jQuery
const anchor = $('<a>')
$('body').append(anchor)
