import { dom, Router, usePathname, useNavigate, Show } from "../../framwork/index.js";

// Initialize the router
Router.instance.initRouter();

// Get router hooks
const pathname = usePathname();
const navigate = useNavigate();

// Simple route matching
function Route({ path, children }) {
  return Show({
    when: () => pathname() === path,
    children
  });
}

// Components
const Home =  dom({
  tag: "div",
  children: [
    { tag: "h1", children: ["Home Page"] },
    { tag: "p", children: ["Welcome to the home page!"] }
  ]
});

const About = dom({
  tag: "div",
  children: [
    { tag: "h1", children: ["About Page"] },
    { tag: "p", children: ["This is the about page."] }
  ]
});

// Navigation component
const Nav = dom({
  tag: "nav",
  children: [
    {
      tag: "a",
      attributes: { href: "/" },
      children: ["Home"]
    },
    " | ",
    {
      tag: "a",
      attributes: { href: "/about" },
      children: ["About"]
    },
    " | ",
    {
      tag: "button",
      attributes: {
        onclick: () => navigate("/contact")
      },
      children: ["Contact (programmatic)"]
    }
  ]
});

// App component with routing
const App = () => dom({
  tag: "div",
  children: [
    // () => Nav(),
    {
      tag: "main",
      children: [
        () => Route({ path: "/", children: [Home] }),
        () => Route({ path: "/about", children: [About] }),
        () => Route({
          path: "/contact", children: [
            {
              tag: "div",
              children: [
                { tag: "h1", children: ["Contact"] },
                { tag: "p", children: ["Contact us here!"] }
              ]
            }
          ]
        })
      ]
    }
  ]
});

document.body.appendChild(App());