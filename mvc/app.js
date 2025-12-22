import * as fm from "../framwork/index.js"

// const [count, setCount] = fm.createSignal(0);

// function redCube() {
//     const movableDiv = fm.domAbstracting({
//         tag: 'div',
//         attributes: {
//             style: 'width: 50px; height: 50px; background-color: red; position: absolute; top: 0px; left: 0px; text-align: center; color: white; line-height: 50px;'
//         },
//         children: ['Move me']
//     });

//     fm.createEffect(() => {
//         const position = count();
//         movableDiv.style.top = position + 'px';
//         movableDiv.style.left = position + 'px';
//     });
//     return movableDiv;
// }

// function button() {
    
//     const moveButton = fm.domAbstracting({
//         tag: 'button',
//         attributes: {
//             // Move by 10px on each click for better visibility
//             onclick: () => setCount(count() + 10)
//         },
//         children: ['Move Div']
//     });
//     return moveButton;
// }

// document.body.append(redCube(), button());

function UserProfile() {
  const [isLoggedIn, setLoggedIn] = fm.createSignal(false, 'isLoggedIn');

  // Create virtual node structures first, then convert to DOM
  const loginButtonVNode = {
    tag: 'button',
    attributes: {
      onclick: () => {
        console.log('Login button clicked, current value:', isLoggedIn());
        setLoggedIn(true);
        console.log('After setLoggedIn, value:', isLoggedIn());
      }
    },
    children: ['Log In']
  };

  const loggedInContentVNode = {
    tag: 'div',
    attributes: {},
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
  };

  // Convert virtual nodes to real DOM elements
  const loginButton = fm.domAbstracting(loginButtonVNode);
  const loggedInContent = fm.domAbstracting(loggedInContentVNode);

  const container = fm.domAbstracting({
    tag: 'div',
    attributes: {},
    children: [
      fm.domAbstracting({
        tag: 'h1',
        attributes: {},
        children: ['My App']
      })
    ]
  });

  const showComponent = fm.Show({
    when: isLoggedIn,
    fallback: loginButton,
    children: loggedInContent
  });

  container.appendChild(showComponent);

  return container;
}

document.body.append(UserProfile());