"use strict";

import { LayoutMenu } from "./LayoutMenu.js";
import { VideoHandler } from "./VideoHandler.js";

if(window.electron)
{
    startApp();
}
else if(navigator.serviceWorker)
{
    window.addEventListener("swready", startApp);
    // Service worker for hide 404 message in the console.
    navigator.serviceWorker.register("SWno404.js").then(_=> navigator.serviceWorker.controller
        ? window.dispatchEvent(new CustomEvent("swready")) // normal reload
        : navigator.serviceWorker.ready.then(_=> location.reload()) // first load or Ctrl+F5
    );
}
else
{
    startApp();
}


/**
 * Launch all the logic of the application.
 */
function startApp()
{
    const layoutMenu = new LayoutMenu();
    new VideoHandler(layoutMenu);
}