"use strict";
import { streamers, VideoOption, requestInterval, envProd } from "./Config.js";
import { LayoutMenu } from "./LayoutMenu.js";

export class VideoHandler
{
    firstload = true;
    autodisplay = true;
    /**
     * Handle the video players
     * @param {LayoutMenu} layoutMenu Layout Menu Controller
     */
    constructor(layoutMenu)
    {
        this.layoutMenu = layoutMenu;
        this.autodisplay = this.layoutMenu.settings.autodisplay??true;
        this.displayStreamers();
    }
    /**
     * Display the buttons of each streamers, 
     * add event listeners,
     * And set interval for the online check
     */
    displayStreamers()
    {
        const list = document.querySelector(".streamers-list");
        if(!streamers || !list)return;
        let i = 0;
        for (const name in streamers) 
        {
            i++;
            const info = streamers[name];

            const button = document.createElement("button");
            button.dataset.streamer = name;
            button.title = `Affiche le stream de ${name}`;
            button.addEventListener("click", ()=>this.toggleStreamer(button));

            const img = document.createElement("img");
            img.src = info.image;
            img.alt = "logo de "+name;

            const badge = document.createElement("span");
            badge.classList.add("badge");

            button.append(img, badge);

            list.append(button);

            const toMove = document.createElement("div");
            toMove.append(img.cloneNode());
            toMove.classList.add("move-layout", "hide");
            this.layoutMenu.appendToMoveMenu(toMove, "player_"+name);
        }

        const autoDisplayBtn = document.querySelector("#auto-display-checkbox");
        autoDisplayBtn?.addEventListener("change", ()=>this.toggleAutoDisplay(autoDisplayBtn));
        autoDisplayBtn.checked = this.autodisplay;

        setInterval(this.checkOnlineStream.bind(this), requestInterval)
        this.checkOnlineStream();
    }
    /**
     * Create or remove a video player when button is clicked.
     */
    toggleStreamer(button, force = undefined) 
    {
        const container = document.querySelector(".video-container");
        const name = button.dataset.streamer;
        if(!container || !name)return;
        const id = "player_"+name;
        const player = document.querySelector(`#${id}`);
        if(!force && player)
        {
            button.classList.remove("selected");
            player.remove();
            this.layoutMenu.toggleMoveItemClass(id,"layout-child-"+player.dataset.layoutChild, false);
            this.layoutMenu.toggleMoveItemClass(id,"hide", true);

            for (let i = 0; i < container.children.length; i++) {
                const ovenVideo = container.children[i];
                const oldClass = "layout-child-"+ovenVideo.dataset.layoutChild;
                const newClass = "layout-child-"+i;

                ovenVideo.classList.remove(oldClass);
                ovenVideo.classList.add(newClass);
                ovenVideo.dataset.layoutChild = i;

                this.layoutMenu.toggleMoveItemClass(ovenVideo.id, oldClass, false);
                this.layoutMenu.toggleMoveItemClass(ovenVideo.id, newClass, true);
            }
        }
        else if(!player && (force === true|| force === undefined))
        {
            const video = document.createElement("div");
            video.id = id;

            container.append(video);

            const optionsStreamer = new VideoOption(streamers[name]);
            OvenPlayer.create(id, optionsStreamer);
            button.classList.add("selected");

            const layoutClass = "layout-child-"+container.children.length;
            
            this.layoutMenu.toggleMoveItemClass(id,layoutClass, true);
            this.layoutMenu.toggleMoveItemClass(id,"hide", false);

            const ovenVideo = document.querySelector("#"+id);
            if(ovenVideo)
            {
                ovenVideo.classList.add(layoutClass);
                ovenVideo.dataset.layoutChild = container.children.length;
            }
        }

        this.layoutMenu.setLayoutVideo();
        this.layoutMenu.toggleVisibleLayout(container.children.length);
    }
    /**
     * Launch request on each streamers for check which one is online.
     */
    async checkOnlineStream()
    {
        const requests = [];
        for (const name in streamers) 
        {
            requests.push(fetch(streamers[name].url+"?streamer="+name));
        }
        
        const responses = await Promise.all(requests);
        responses.forEach(this.handleOnlineState.bind(this));
        this.firstload = false;

        if(envProd)console.clear();
    }
    /**
     * Change the badge for display which streamer is online.
     * @param {Response} response response object of fetch
     */
    handleOnlineState(response)
    {
        const streamer = (new URL(response.url)).searchParams.get("streamer");
        if(!streamer) return;
        const button = document.querySelector(`button[data-streamer="${streamer}"]`);
        if(!button) return;

        if(response.ok) 
        {
            const online = response.status == 200;
            if(online)
            {
                button.classList.add("online");
            }
            else button.classList.remove("online");

            if(this.firstload || this.autodisplay)
            {
                this.toggleStreamer(button, online);
            }
        }
    }
    /**
     * toggle if the video have to be display automatically
     * @param {HTMLInputElement} checkbox checkbox Element
     */
    toggleAutoDisplay(checkbox)
    {
        this.autodisplay = checkbox.checked;
        this.layoutMenu.saveSettings({autodisplay: checkbox.checked});
    }
}