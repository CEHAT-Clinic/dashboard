/* eslint-disable no-console */
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

/**
 * Function used to register a service worker for the application, making the app
 * a progressive web app (PWA)
 * @param config - optional configuration to add logic when the service worker
 *                 registration succeeds or is updated.
 */
export function register(config?: Config): void {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support service workers.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const serviceWorkerUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(serviceWorkerUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidServiceWorker(serviceWorkerUrl, config);
      }
    });
  }
}

/**
 * Registers a service worker. This tells the browser that there is a service
 * worker, and it goes through the install and activate lifecyle events.
 * See https://developers.google.com/web/fundamentals/primers/service-workers/registration
 * for documentation.
 * @param serviceWorkerUrl - URL where service worker file is located
 * @param config - optional configuration to add logic when the service worker
 *                 registration succeeds or is updated.
 */
function registerValidServiceWorker(serviceWorkerUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(serviceWorkerUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker === null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Here, everything has been precached.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}

/**
 * Confirms that a valid service worker exists, and reloads the page if not.
 * @param serviceWorkerUrl - URL where service worker file is located
 * @param config - optional configuration to add logic when the service worker
 *                 registration succeeds or is updated.
 */
function checkValidServiceWorker(serviceWorkerUrl: string, config?: Config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(serviceWorkerUrl, {
    headers: {'Service-Worker': 'script'},
  })
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      const indexNotFound = -1;
      const noJavaScript = contentType
        ? contentType.indexOf('javascript') === indexNotFound
        : false;
      const pageNotFound = 404;
      if (response.status === pageNotFound || noJavaScript) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidServiceWorker(serviceWorkerUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

/**
 * Unregisters a service worker
 */
export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}
