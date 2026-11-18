'use strict';
const CACHE='amg-nutrition-v1.1.0';
const ROOT=new URL('./',self.location.href).href;
const FILES=['./index.html','./manifest.webmanifest','./assets/app-icon.png'].map(p=>new URL(p,ROOT).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('amg-nutrition-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 if(event.request.mode==='navigate')event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(new URL('./index.html',ROOT).href,copy));}return response;}).catch(()=>caches.match(new URL('./index.html',ROOT).href)));
 else if(FILES.includes(event.request.url))event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});
