"use strict";
const layoutsList = ["layout-1-a", "layout-2-a", "layout-2-b", "layout-3-a", "layout-3-b", "layout-3-c", "layout-3-d", "layout-3-e", "layout-3-f", "layout-3-g"];
setLayoutEvent();
function setLayoutEvent() 
{
    const layoutBtn = document.querySelector("#layout-btn");
    const navBtn = document.querySelector("#nav-btn");
    const layouts = document.querySelectorAll("#layout-selection .layout");

    if(!layoutBtn || !layouts.length)return;

    layoutBtn.addEventListener("click", toggleLayoutSelection);

    for (const layout of layouts) 
    {
        layout.addEventListener("click", toggleLayoutSelection);
        layout.addEventListener("click", setLayoutVideoEvent);
    }

    navBtn?.addEventListener("click", toggleNav);
}
function toggleLayoutSelection()
{
    const layoutSelection = document.querySelector("#layout-selection");
    if(!layoutSelection)return;
    if(layoutSelection.style.display) layoutSelection.style.display = "";
    else layoutSelection.style.display = "grid";
}
function setLayoutVideoEvent()
{
    setLayoutVideo(this.dataset.layout);
}
function setLayoutVideo(layoutId)
{
    const videoContainer = document.querySelector(".video-container");
    const layout = layoutId;
    if(!videoContainer || !layout)return;
    videoContainer.classList.remove(...layoutsList)
    console.log(layout);
    videoContainer.classList.add("layout-"+layout)
}
function toggleNav()
{
    const nav = document.querySelector(".video-controller");
    nav?.classList.toggle("open");
}
function toggleVisibleLayout(players)
{
    const layouts = document.querySelectorAll("#layout-selection .layout");
    for (const layout of layouts) 
    {
        if(layout.classList.contains(`layout-${players}`))
        {
            layout.style.display = "";
        }
        else
        {
            layout.style.display = "none";
        }
    }
    
}