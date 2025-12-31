# Router Module
# Router Documentation

A client-side router for building single-page applications. Handles navigation, view management, and context sharing between components.

## Getting Started

```javascript
import { Router } from './router/router.js';

const router = Router.instance;

// Initialize the router
router.initRouter();
```

The Router is a singleton, so you always get the same instance.

---

## Setup

### initRouter()

Initialize the router to handle navigation. Call this once when your app starts.

```javascript
router.initRouter();
```

This sets up:
- Click handlers for intercepting link clicks
- Browser back/forward button support
- Initial route on page load

---

## Defining Routes

### addViewRoute(route, ViewClass, destroy)

Register a route with a view class.

```javascript
class HomePage {
  render(data) {
    document.getElementById('app').innerHTML = '<h1>Home</h1>';
  }
  destroy() {
    // Cleanup code
  }
}

router.addViewRoute('/home', HomePage, true);
```

**Parameters:**
- `route` (String): URL path like '/home' or '/about'
- `ViewClass` (Class): View class to instantiate
- `destroy` (Boolean): If false, view is cached and reused. Default: true

**View Requirements:**
Your view class must have:
- `render(data)` method - called when route is activated
- `destroy()` method - called when leaving route

### addEventRoute(path, event)

Register a route that emits an event instead of rendering a view.

```javascript
router.addEventRoute('/logout', 'userLogout');

eventEmitter.on('userLogout', () => {
  clearUserData();
  router.redirect('/login');
});
```

**Parameters:**
- `path` (String): URL path
- `event` (String): Event name to emit

---

## Navigation

### redirect(route, data)

Navigate to a route programmatically.

```javascript
router.redirect('/dashboard');
router.redirect('/profile', { userId: 123 });
```

**Parameters:**
- `route` (String): Target route path
- `data` (Any): Optional data passed to view's render method

### Link Interception

The router automatically intercepts clicks on `<a>` tags and handles them as client-side navigation.

```javascript
// This will be handled by the router
dom({
  tag: 'a',
  attributes: { href: '/about' },
  children: ['About']
});
```

**Not intercepted:**
- External links (different origin)
- Links with `target="_blank"`
- Links with `download` attribute
- Non-HTTP protocols (mailto:, tel:, etc.)
- Middle/right clicks
- Ctrl/Cmd/Shift/Alt + click
- Hash-only changes on same page

---

## View Management

### getCurrentView()

Get the currently active view instance.

```javascript
const currentView = router.getCurrentView();
if (currentView) {
  currentView.updateData(newData);
}
```

### destroyCurrentView()

Manually destroy the current view.

```javascript
router.destroyCurrentView();
```

**Note:** This is called automatically when navigating to a new route.

---

## Context Management

Share data between views and components using the context system.

### storeValueInContext(name, value)

Store a value in the router's context.

```javascript
router.storeValueInContext('user', { id: 1, name: 'Alice' });
router.storeValueInContext('theme', 'dark');
```

**Parameters:**
- `name` (String): Key to store value under
- `value` (Any): Value to store

### getvalueFromContext(name)

Retrieve a value from context.

```javascript
const user = router.getvalueFromContext('user');
const theme = router.getvalueFromContext('theme');
```

**Parameters:**
- `name` (String): Key to retrieve

**Returns:** Stored value or undefined

### removeValueFromContext(name)

Remove a specific value from context.

```javascript
router.removeValueFromContext('user');
```

### removeAllValuesFromContext()

Clear all context values.

```javascript
router.removeAllValuesFromContext();
```

---

## Reactive Context

Subscribe to context changes to reactively update your UI.

### subscribe(key, callback)

Listen for changes to a context value.

```javascript
router.subscribe('user', (user) => {
  console.log('User changed:', user);
  updateUserDisplay(user);
});

// Later, when you update context
router.storeValueInContext('user', newUser);  // Triggers callback
```

**Parameters:**
- `key` (String): Context key to watch
- `callback` (Function): Called when value changes

---

## Error Handling

### setErrorHandler(handler)

Set a custom error handler for routing errors.

```javascript
router.setErrorHandler((error) => {
  console.error('Routing error:', error);
  router.redirect('/error');
});
```

### handleError(error)

Manually trigger error handling.

```javascript
try {
  someRiskyOperation();
} catch (error) {
  router.handleError(error);
}
```

---

## Complete Example

```javascript
import { Router } from './router/router.js';
import { dom } from './dom/dom.js';

const router = Router.instance;

// Define views
class HomePage {
  render(data) {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(dom({
      tag: 'div',
      children: [
        dom({ tag: 'h1', children: ['Home'] }),
        dom({ 
          tag: 'a', 
          attributes: { href: '/about' },
          children: ['Go to About']
        })
      ]
    }));
  }
  destroy() {
    console.log('Leaving home page');
  }
}

class AboutPage {
  render(data) {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(dom({
      tag: 'div',
      children: [
        dom({ tag: 'h1', children: ['About'] }),
        dom({ 
          tag: 'a', 
          attributes: { href: '/home' },
          children: ['Go to Home']
        })
      ]
    }));
  }
  destroy() {}
}

// Register routes
router.addViewRoute('/home', HomePage);
router.addViewRoute('/about', AboutPage);
router.addViewRoute('/error', ErrorPage);

// Setup event route
router.addEventRoute('/logout', 'userLogout');

eventEmitter.on('userLogout', () => {
  router.removeValueFromContext('user');
  router.redirect('/home');
});

// Initialize
router.initRouter();
```

---

## View Caching

Control whether views are cached or recreated on each navigation.

```javascript
// View is destroyed and recreated each time (default)
router.addViewRoute('/home', HomePage, true);

// View is cached and reused
router.addViewRoute('/profile', ProfilePage, false);
```

**When to cache:**
- Heavy views that are expensive to create
- Views that maintain state between navigations
- Frequently visited pages

**When not to cache:**
- Views that need fresh data each time
- Simple, lightweight views
- Views with cleanup requirements

---

## Navigation with Data

Pass data between routes.

```javascript
// In source view
router.redirect('/profile', { userId: 123, tab: 'settings' });

// In ProfilePage view
class ProfilePage {
  render(data) {
    console.log(data);  // { userId: 123, tab: 'settings' }
    this.loadUserProfile(data.userId);
    this.showTab(data.tab);
  }
  destroy() {}
}
```

---

## Best Practices

**Do:**
- Call `initRouter()` once at app startup
- Always implement both `render()` and `destroy()` in views
- Clean up event listeners and timers in `destroy()`
- Use context for global app state
- Cache expensive views with `destroy: false`

**Don't:**
- Create multiple router instances
- Forget to handle the /error route
- Store large objects in context
- Manipulate history directly (use `redirect()`)
- Mix event routes and view routes on the same path

---

## URL Handling

The router automatically:
- Normalizes URLs relative to the current page
- Preserves query strings and hashes
- Updates browser history
- Supports back/forward buttons

```javascript
// All these work
router.redirect('/about');
router.redirect('about');
router.redirect('/about?tab=1');
router.redirect('/about#section');
- [lean the framework](./README.md)