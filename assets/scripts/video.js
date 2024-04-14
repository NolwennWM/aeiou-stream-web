// Initialize OvenPlayer
displayStreamers();
/**
 * Display the buttons of each streamers, 
 * add event listeners,
 * And set interval for the online check
 */
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
    setInterval(checkOnlineStream, requestInterval)
    checkOnlineStream();
}
/**
 * Create or remove a video player when button is clicked.
 */
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
/**
 * Launch request on each streamers for check which one is online.
 */
async function checkOnlineStream()
{
    const requests = [];
    for (const name in streamers) 
    {
        requests.push(fetch(streamers[name].url+"?streamer="+name));
    }
    const responses = await Promise.all(requests);
    responses.forEach(handleOnlineState);
    if(envProd)console.clear();
}
/**
 * Change the badge for display which streamer is online.
 * @param {Response} response 
 */
function handleOnlineState(response)
{
    const streamer = (new URL(response.url)).searchParams.get("streamer");
    if(!streamer) return;
    const button = document.querySelector(`button[data-streamer="${streamer}"]`);
    if(!button) return;
    if(response.ok) button.classList.add("online");
    else button.classList.remove("online");
}