import * as fm from "../framwork/index.js";

const [x, setX] = fm.createSignal(50);
const [y, setY] = fm.createSignal(50);

// Main container for the entire application
const appContainer = fm.domAbstracting({
  tag: 'div',
  attributes: { class: 'container' },
  children: []
});
document.body.append(appContainer);



function createCubeAnimationCard() {
  const card = fm.domAbstracting({
    tag: 'div',
    attributes: { class: 'card' },
    children: []
  });

  const title = fm.domAbstracting({
    tag: 'h2',
    attributes: {},
    children: ['Cube Animation']
  });

  const animationContainer = fm.domAbstracting({
    tag: 'div',
    attributes: { class: 'animation-container' },
    children: []
  });

  const movableDiv = fm.domAbstracting({
    tag: 'div',
    attributes: {
      id: 'red-cube',
      style: `background-color: red; 
                  width: 50px; height: 50px;
                  transform-origin: center; 
                  transition: transform 0.2s ease-in-out;` },
    children: []
  });

  fm.createEffect(() => {
    const xPosition = x();
    const yPosition = y();
    movableDiv.style.transform = `translateX(${xPosition}px) translateY(${yPosition}px)`;
  });
  animationContainer.append(movableDiv);

  const moveButtonX = fm.domAbstracting({
    tag: 'button',
    attributes: {
      onclick: () => setX(x() + 10)
    },
    children: ['Move x']
  });

  const moveButtonY = fm.domAbstracting({
    tag: 'button',
    attributes: {
      onclick: () => setY(y() + 10)
    },
    children: ['Move y']
  });

  card.append(title, moveButtonX, moveButtonY, animationContainer);
  return card;
}



// ------------------------------------------------------ User Profile Card ------------------------------------------------------
function createUserProfileCard() {
  const card = fm.domAbstracting({
    tag: 'div',
    attributes: { class: 'card' },
    children: []
  });

  const [isLoggedIn, setLoggedIn] = fm.createSignal(false, 'isLoggedIn');

  const loginButton = fm.domAbstracting({
    tag: 'button',
    attributes: {
      onclick: () => setLoggedIn(true)
    },
    children: ['Log In']
  });

  const loggedInContent = fm.domAbstracting({
    tag: 'div',
    attributes: { class: 'loggedIn-content' },
    children: [
      {
        tag: 'span',
        attributes: {},
        children: ['Welcome back! ']
      },
      {
        tag: 'button',
        attributes: {
          onclick: () => setLoggedIn(false)
        },
        children: ['Log Out']
      }
    ]
  });

  const container = fm.domAbstracting({
    tag: 'div',
    attributes: { id: 'user-profile' },
    children: [
      {
        tag: 'h1',
        attributes: {},
        children: ['My App']
      }
    ]
  });

  const showComponent = fm.Show({
    when: isLoggedIn,
    fallback: loginButton,
    children: loggedInContent
  });

  container.appendChild(showComponent);
  card.append(container);
  return card;
}

// --- Append Cards to App Container ---
if (appContainer) {
  // appContainer.append(createCubeAnimationCard(), createUserProfileCard());
  appContainer.append(createCubeAnimationCard());
}