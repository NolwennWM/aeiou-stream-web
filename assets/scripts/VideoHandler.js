"use strict";
import { streamers, VideoOption, requestInterval, envProd, path } from "./Config.js";

export class VideoHandler
{
    constructor(layoutMenu)
    {
        this.layoutMenu = layoutMenu;
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
        for (const name in streamers) 
        {
            const info = streamers[name];

            const button = document.createElement("button");
            button.dataset.streamer = name;
            button.addEventListener("click", ()=>this.toggleStreamer(button));

            const img = document.createElement("img");
            img.src = info.image;
            img.alt = "logo de "+name;

            const badge = document.createElement("span");
            badge.classList.add("badge");

            button.append(img, badge);

            list.append(button);
        }
        setInterval(this.checkOnlineStream.bind(this), requestInterval)
        this.checkOnlineStream();
    }
    /**
     * Create or remove a video player when button is clicked.
     */
    toggleStreamer(button) 
    {
        const container = document.querySelector(".video-container");
        const name = button.dataset.streamer;
        if(!container || !name)return;
        const id = "player_"+name;
        const player = document.querySelector(`#${id}`);
        if(player)
        {
            button.classList.remove("selected");
            player.remove();
        }
        else
        {
            const video = document.createElement("div");
            video.id = id;

            container.append(video);

            const optionsStreamer = new VideoOption(streamers[name]);
            OvenPlayer.create(id, optionsStreamer);
            button.classList.add("selected");
        }
        const players = container.children.length;
        this.layoutMenu.setLayoutVideo();
        this.layoutMenu.toggleVisibleLayout(players);
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

        if(envProd)console.clear();
    }
    /**
     * Change the badge for display which streamer is online.
     * @param {Response} response 
     */
    handleOnlineState(response)
    {
        const streamer = (new URL(response.url)).searchParams.get("streamer");
        if(!streamer) return;

        const button = document.querySelector(`button[data-streamer="${streamer}"]`);
        if(!button) return;

        if(response.ok) 
        {
            if(!button.classList.contains("online"))
            {
                button.classList.add("online");
                this.toggleStreamer(button);
            }
        }
        else button.classList.remove("online");

    }
}