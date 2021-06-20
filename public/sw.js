let key = null;
self.addEventListener('push', event => {
  if (event.data) {
    const options = event.data.json();
    const title = options.title;
    key = options.key;
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(`http://localhost:3000/event.html?key=${key}`)
  );
});