self.addEventListener('push', event => {
    console.log('[Service Worker] Push Received.');
    let title = 'Server Push';
    let options = {
      body: 'push TEST',
    };
    if (event.data) {
      options = event.data.json();
      title = options.title;
    }
    event.waitUntil(self.registration.showNotification(title, options));
})