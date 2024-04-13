// Initialize OvenPlayer
displayStreamers();

function displayStreamers()
{
    const list = document.querySelector(".streamers-list");
    if(!streamers || !list)return;
    for (const name in streamers) 
    {
        const info = streamers[name];

        const button = document.createElement("button");
        button.dataset.streamer = name;
        button.addEventListener("click", toggleStreamer);

        const img = document.createElement("img");
        img.src = info.image;
        img.alt = "logo de "+name;

        const badge = document.createElement("span");
        badge.classList.add("badge");

        button.append(img, badge);

        list.append(button);
    }
}
function toggleStreamer() 
{
    const container = document.querySelector(".video-container");
    const name = this.dataset.streamer;
    if(!container || !name)return;
    const id = "player_"+name;
    const player = document.querySelector(`#${id}`);
    if(player)
    {
        this.classList.remove("selected");
        player.remove();
    }
    else
    {
        const video = document.createElement("div");
        video.id = id;

        container.append(video);

        const optionsStreamer = new VideoOption(streamers[name]);
        OvenPlayer.create(id, optionsStreamer);
        this.classList.add("selected");
    }
    const players = container.children.length;
    setLayoutVideo(players+"-a");
    toggleVisibleLayout(players);
}
