const C='nhatky-v11',A=['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=='nk-share').map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method==='POST'&&u.pathname.endsWith('/share-target')){
  e.respondWith((async()=>{
   const fd=await e.request.formData(),c=await caches.open('nk-share'),base=self.registration.scope;
   for(const k of await c.keys())await c.delete(k);
   const meta={title:fd.get('title')||'',text:fd.get('text')||'',url:fd.get('url')||'',files:[]};let i=0;
   for(const f of [...fd.getAll('media'),...fd.getAll('backup')]){if(!(f instanceof File)||!f.size)continue;const k='shared-file-'+(i++);await c.put(base+k,new Response(f,{headers:{'Content-Type':f.type||'application/octet-stream'}}));meta.files.push({k,name:f.name,type:f.type})}
     await c.put(base+'shared-meta',new Response(JSON.stringify(meta)));
   return Response.redirect(base+'index.html?shared=1',303)})());return}
 if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{const cl=r.clone();caches.open(C).then(x=>x.put(e.request,cl));return r}).catch(()=>caches.match(e.request)))});
