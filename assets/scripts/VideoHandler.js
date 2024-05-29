"use strict";
import { streamers, VideoOption, requestInterval, envProd } from "./Config.js";
import { LayoutMenu } from "./LayoutMenu.js";

export class VideoHandler
{
    /** @type {boolean} tell if it is the first time the script is loaded */
    firstload = true;
    /** @type {boolean} tell if the auto display of the video is activated */
    autodisplay = true;
    /** @type {boolean} tell if the watermarks should be displayed */
    watermark = true;

    /** @type {LayoutMenu} Layout Menu Controller */
    layoutMenu;

    /**
     * Handle the video players
     * @param {LayoutMenu} layoutMenu Layout Menu Controller
     */
    constructor(layoutMenu)
    {
        this.layoutMenu = layoutMenu;
        this.autodisplay = this.layoutMenu.settings.autodisplay??this.autodisplay ;
        this.watermark = (!this.layoutMenu.settings.watermark)??this.watermark;
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

            const viewers = document.createElement("span");
            viewers.classList.add("viewers");
            viewers.textContent = "0";

            button.append(img, badge, viewers);

            list.append(button);

            const toMove = document.createElement("div");
            toMove.append(img.cloneNode());
            toMove.classList.add("move-layout", "hide");
            this.layoutMenu.appendToMoveMenu(toMove, "player_"+name);
        }

        const autoDisplayBtn = document.querySelector("#auto-display-checkbox");
        autoDisplayBtn?.addEventListener("change", ()=>this.toggleAutoDisplay(autoDisplayBtn));
        autoDisplayBtn.checked = this.autodisplay;

        const watermarkBtn = document.querySelector("#watermark-checkbox");
        watermarkBtn?.addEventListener("change", ()=>this.toggleWatermark(watermarkBtn));
        watermarkBtn.checked = this.watermark;
        document.body.classList.toggle("hide-watermark", !this.watermark);

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
    checkOnlineStream()
    {
        for (const name in streamers) 
        {
            const url = streamers[name].url+"?streamer="+name;
            fetch(url)
                .then(this.handleOnlineState.bind(this))
                .catch(e=>console.warn(`Impossible de fetch ${url}`,e));
        }
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

        const online = response.status == 200;
        
        if(response.ok) 
        {
            if(online)
            {
                button.classList.add("online");
                response.json().then(data=>this.handleResponseData(data, button));
            }

            if(this.firstload || this.autodisplay)
            {
                this.toggleStreamer(button, online);
            }
        }
        if(!online)
        {
            button.classList.remove("online");
            const badge = button.querySelector(".badge");
            if(!badge)return;
            badge.textContent = "";
        }
    }
    /**
     * Display data about the current stream
     * @param {Object} data data about the current stream
     * @param {HTMLElement} button button of the current streamer
     */
    handleResponseData(data, button)
    {
        const 
            /** @type {string} number of people watching the stream */
            viewers = data.response.totalConnections??"0",
            /** @type {number} timestamp of the start time */
            since = Date.parse(data.response.createdTime),
            /** @type {number} timestamp of the current time */
            now = Date.now(),
            /** @type {number} minutes since the stream started */
            minutes = Math.floor((now - since)/1000/60),
            /** @type {number} hours since the stream started */
            hours = Math.floor(minutes / 60),
            /** @type {HTMLElement} viewers indicator */
            counter = button.querySelector(".viewers"),
            /** @type {HTMLElement} time indicator */
            badge = button.querySelector(".badge");

        if(!counter || !badge)return;

        counter.textContent = viewers;
        badge.textContent = hours>0? `${hours}h${minutes%60}m`:`${minutes}m`;
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
    /**
     * toggle the watermarks
     * @param {HTMLInputElement} checkbox checkbox Element
     */
    toggleWatermark(checkbox)
    {
        this.watermark = !checkbox.checked;
        document.body.classList.toggle("hide-watermark", this.watermark);
        this.layoutMenu.saveSettings({watermark: this.watermark});
    }
}