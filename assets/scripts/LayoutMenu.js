"use strict";

export class LayoutMenu 
{
    layoutsList = ["layout-1-a", "layout-2-a", "layout-2-b", "layout-3-a", "layout-3-b", "layout-3-c", "layout-3-d", "layout-3-e", "layout-3-f"/* , "layout-3-g" */, "layout-4-a"];
    storageName = "layout-setting";
    /**
     * control the layout of the application
     */
    constructor()
    {
        this.getSettings();
        this.setLayoutEvent();
    }
    /**
     * Set event listener of navigation bar and layout settings
     */
    setLayoutEvent() 
    {
        const 
            layoutBtn = document.querySelector("#layout-btn"), 
            navBtn = document.querySelector("#nav-btn"),
            layouts = document.querySelectorAll("#layout-selection .layout");
    
        if(!layoutBtn || !layouts.length)return;
    
        layoutBtn.addEventListener("click", this.toggleLayoutSelection);
    
        for (const layout of layouts) 
        {
            layout.addEventListener("click", this.toggleLayoutSelection);
            layout.addEventListener("click", ()=>this.setLayoutVideoEvent(layout));
        }
    
        navBtn?.addEventListener("click", this.toggleNav);
        this.toggleVisibleLayout(0);
    }
    /**
     * Open the modal of layout selection
     */
    toggleLayoutSelection()
    {
        const layoutSelection = document.querySelector("#layout-selection");
        if(!layoutSelection)return;
        if(layoutSelection.style.display) layoutSelection.style.display = "";
        else layoutSelection.style.display = "grid";
    }
    /**
     * Handle the click on the layout selection
     */
    setLayoutVideoEvent(layoutBtn)
    {
        this.setLayoutVideo(layoutBtn.dataset.layout);
    }
    /**
     * Set the selected layout on the video container
     * @param {string|undefined} layoutId id of the selected layout
     */
    setLayoutVideo(layoutId=undefined)
    {
        const videoContainer = document.querySelector(".video-container");
        const nbPlayers = videoContainer.children.length;
        let layout = layoutId;
        if(!layout) layout = this.settings["layout-"+nbPlayers];
        if(!layout) layout = nbPlayers + "-a";
        if(!videoContainer)return;

        videoContainer.classList.remove(...this.layoutsList)
        videoContainer.classList.add("layout-"+layout)

        const settings = {};
        settings["layout-"+nbPlayers] = layout;
        this.saveSettings(settings)
    }
    /**
     * Open or close the navbar
     */
    toggleNav()
    {
        const nav = document.querySelector(".video-controller");
        nav?.classList.toggle("open");
    }
    /**
     * toggle which layouts are visibles.
     * @param {number} players number of video players
     */
    toggleVisibleLayout(players)
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
    /**
     * Save the settings of the application
     * @param {Object} settings settings to save (no deep save)
     */
    saveSettings(settings)
    {
        this.getSettings();
        this.settings = {...this.settings, ...settings};
        localStorage.setItem(this.storageName, JSON.stringify(this.settings));
    }
    /**
     * get settings of the application.
     */
    getSettings()
    {
        this.settings = JSON.parse(localStorage.getItem(this.storageName)??"{}");
    }
}