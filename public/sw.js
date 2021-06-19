let key = null;

self.addEventListener('push', event => {
    console.log('[Service Worker] Push Received.');
    let title = 'Server Push';
    let options = {
      body: 'push TEST',
    };
    if (event.data) {
      options = event.data.json();
      title = options.title;
      key = options.key;
    }
    event.waitUntil(self.registration.showNotification(title, options));
});


self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(`http://localhost:3000/event.html?key=${key}`)
  );
});