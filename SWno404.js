self.addEventListener('install', e => {
    self.skipWaiting(); // update even if other tabs are open in the browser
});
self.addEventListener('fetch', e => e.respondWith(
    fetch(e.request).then(proxyResponse)
));

function proxyResponse(origin)
{
    return origin.status<400 ? origin : new Response(null, {
        status: 202,
        statusText: "Accepted",
        headers: new Headers({
            "Status": origin.status,
            "StatusText": origin.statusText
        })
    });
}