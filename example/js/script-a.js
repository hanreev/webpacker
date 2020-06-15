// Vanilla JS
window.addEventListener('load', () => {
  const p = document.createElement('p');
  const button = document.createElement('button');
  button.innerText = 'Button 1';
  button.addEventListener('click', event => {
    alert(event.target.innerText + ' clicked');
  });
  p.appendChild(button);
  document.body.appendChild(p);
});

// jQuery (Webpack ProvidePlugin make $ and jQuery available as global variable. See webpacker.config.js)
$(document).ready(() => {
  const anchor = $('<a>', { href: 'https://github.com/hanreev/webpacker', target: '_blank' }).text('Webpacker');
  $('body').append($('<p>').append(anchor));
});
