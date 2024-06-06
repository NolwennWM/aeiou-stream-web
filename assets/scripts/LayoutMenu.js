"use strict";

export class LayoutMenu 
{
    layoutsList = ["layout-0-a", "layout-1-a", "layout-2-a", "layout-2-b", "layout-2-c", "layout-3-a", "layout-3-b", "layout-3-c", "layout-3-d", "layout-3-e", "layout-3-f"/* , "layout-3-g" */, "layout-4-a"];
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
            moveBtn = document.querySelector("#move-btn"),
            overlay = document.querySelector("#overlay"),
            layouts = document.querySelectorAll("#layout-selection .layout");
        this.overlay = overlay;
        this.layouts = layouts;
    
        if(!layoutBtn || !layouts.length)return;
    
        layoutBtn.addEventListener("click", this.toggleLayoutSelection.bind(this));
    
        for (const layout of layouts) 
        {
            layout.addEventListener("click", this.closeModals.bind(this));
            layout.addEventListener("click", ()=>this.setLayoutVideoEvent(layout));
        }
        
        overlay?.addEventListener("click", this.closeModals.bind(this));
        moveBtn?.addEventListener("click", this.toggleMoveMenu.bind(this));
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
        this.closeModals(layoutSelection);
        const toggle = layoutSelection.classList.toggle("hide");
        this.toggleOverlay(toggle);
        
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
        const videoMoveMenu = document.querySelector("#move-videos");
        const nbPlayers = videoContainer.children.length;

        let layout = layoutId;
        if(!layout) layout = this.settings["layout-"+nbPlayers];
        if(!layout) layout = nbPlayers + "-a";

        videoContainer?.classList.remove(...this.layoutsList);
        videoContainer?.classList.add("layout-"+layout);
        videoMoveMenu?.classList.remove(...this.layoutsList);
        videoMoveMenu?.classList.add("layout-"+layout);

        const settings = {};
        settings["layout-"+nbPlayers] = layout;
        this.saveSettings(settings);
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
        const layouts = this.layouts;
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
     * Open or close the modal for move videos
     */
    toggleMoveMenu()
    {
        this.toggleOverlay();
        const moveContainer = document.querySelector("#move-videos");
        if(!moveContainer)return;
        this.closeModals(moveContainer);
        const toggle = moveContainer.classList.toggle("hide");
        this.toggleOverlay(toggle);
    }
    /**
     * Add a tag in the move menu.
     * @param {HTMLElement} tag container to move
     * @param {string} id id of the video container
     */
    appendToMoveMenu(tag, id)
    {
        const moveContainer = document.querySelector("#move-videos");
        if(!moveContainer)return;
        tag.dataset.for = id;
        tag.draggable = true;
        moveContainer.append(tag);

        tag.addEventListener("dragstart",this.dragStart.bind(this));
        tag.addEventListener("dragover",this.dragOver.bind(this));
        tag.addEventListener("drop",this.dropHandler.bind(this));
    }
    /**
     * toggle the icon of the identified streamer in the move menu
     * @param {string} id identifiant to toggle
     * @param {string} className layout class
     * @param {boolean} force force the toggle
     */
    toggleMoveItemClass(id, className, force=undefined)
    {
        const toMove = document.querySelector(`[data-for="${id}"]`);
        toMove?.classList.toggle(className, force);
    }
    /**
     * Save the target of the dragStart.
     * @param {DragEvent} ev dragstart event
     */
    dragStart(ev)
    {
        const target = this.getDragAndDropTarget(ev);
        if(!target)return;

        ev.dataTransfer.setData("text", target.dataset.for);
        ev.dataTransfer.effectAllowed = "move";
    }
    /**
     * prevent default event of dragover
     * @param {DragEvent} ev dragover event
     */
    dragOver(ev)
    {
        ev.preventDefault()
    }
    /**
     * exchange place of the two video players.
     * @param {DragEvent} ev drop event
     */
    dropHandler(ev)
    {
        ev.preventDefault()
        const target2 = this.getDragAndDropTarget(ev);
        const data = ev.dataTransfer.getData("text");
        const target1 = document.querySelector(`[data-for="${data}"]`);
        if(!target1 || !target2 || target1 === target2)return;

        const video1 = document.querySelector("#"+data);
        const video2 = document.querySelector("#"+target2.dataset.for);
        if(!video1 || !video2)return;

        const class1 = "layout-child-"+video1.dataset.layoutChild;
        const class2 = "layout-child-"+video2.dataset.layoutChild;

        video1.classList.remove(class1);
        video1.classList.add(class2);

        video2.classList.remove(class2);
        video2.classList.add(class1);

        target1.classList.remove(class1);
        target1.classList.add(class2);

        target2.classList.remove(class2);
        target2.classList.add(class1);

        const tmp = video1.dataset.layoutChild;
        video1.dataset.layoutChild = video2.dataset.layoutChild;
        video2.dataset.layoutChild = tmp;
    }
    /**
     * get the target of the event.
     * @param {Event} ev Event Object
     * @returns {HTMLElement} target of the event
     */
    getDragAndDropTarget(ev)
    {
        return ev.target.dataset.for?ev.target:ev.target.closest("[data-for]");
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
    /**
     * close opened modal
     * @param {HTMLElement|undefined} except modal to not close
     */
    closeModals(except=undefined)
    {
        const modals = document.querySelectorAll(".modal:not(.hide)");
        this.toggleOverlay(true);
        modals.forEach(m=>{
            if(m===except)return;
            m.classList.add("hide")
        });
    }
    /**
     * show or hide overlay
     * @param {boolean|undefined} force force to add or delete overlat
     */
    toggleOverlay(force)
    {
        this.overlay?.classList.toggle("hide", force);
    }
}