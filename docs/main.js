var I=(e,r="ts")=>`
  <pre><code class="language-${r}">${e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}</code></pre>
`,Z=[{id:"overview",title:"Overview",eyebrow:"Browser SDK",description:"A lightweight frontend error reporting SDK designed to POST normalized client error payloads to any endpoint you control.",body:`
      <p><strong>@revivejs/client-errors</strong> is built for real production apps that need client-side runtime error reporting without buying into a hosted platform, dashboard, or vendor backend. It captures errors, collects safe context, normalizes everything into one payload shape, and ships it to any endpoint you define.</p>
      <p>The package stays framework-agnostic on purpose. The core runs in plain browsers today, and future React, Angular, and Vue wrappers can stay thin because they will reuse this same runtime.</p>
    `},{id:"installation",title:"Installation",eyebrow:"Quick start",description:"The simplest setup is a single relative endpoint path and a normal POST request.",body:`
      ${I("npm install @revivejs/client-errors","bash")}
      ${I(`import { initClientErrors } from "@revivejs/client-errors";

initClientErrors({
  endpoint: "api/frontend-errors"
});`)}
      <p>Absolute URLs are also supported, but the documentation examples default to a relative path because that fits the most common browser-to-app-backend setup.</p>
    `},{id:"transport",title:"Transport & Auth",eyebrow:"Backend agnostic",description:"Use pure POST with no authentication, bearer token auth, custom headers, dynamic headers, or cookie-based requests.",body:`
      ${I(`initClientErrors({
  endpoint: "api/frontend-errors"
});`)}
      ${I(`initClientErrors({
  endpoint: "api/frontend-errors",
  auth: {
    type: "bearer",
    token: "public-ingest-token"
  }
});`)}
      ${I(`initClientErrors({
  endpoint: "api/frontend-errors",
  auth: {
    type: "custom",
    headers: {
      "X-Ingest-Key": "demo-public-key"
    }
  },
  getHeaders: async () => ({
    "X-Session": window.sessionStorage.getItem("session") ?? "anonymous"
  }),
  credentials: "include"
});`)}
    `},{id:"api",title:"API",eyebrow:"Public surface",description:"The SDK exposes both initialization and manual capture APIs for domain-specific reporting.",body:`
      ${I(`import {
  addBreadcrumb,
  captureException,
  captureMessage,
  destroy,
  flush,
  initClientErrors,
  setCustomContext,
  setUserContext
} from "@revivejs/client-errors";

const client = initClientErrors({
  endpoint: "api/frontend-errors",
  appName: "billing-ui",
  environment: "production",
  release: "1.2.0"
});

setUserContext({ id: "u_42", email: "team@example.com" });
setCustomContext({ tenantId: "tenant-acme" });
addBreadcrumb({ type: "checkout.step", value: "confirm-payment" });
await captureException(new Error("Checkout failed"));
await captureMessage("A recoverable warning", "warn");
await flush();
client.destroy();
destroy();`)}
    `},{id:"sanitization",title:"Sanitization",eyebrow:"Privacy-aware",description:"Safe defaults are on by default, and the sanitization layer is configurable for enterprise rules.",body:`
      ${I(`initClientErrors({
  endpoint: "api/frontend-errors",
  sanitize: {
    enabled: true,
    redactKeys: ["password", "token", "authorization", "cookie"],
    redactHeaders: ["authorization", "cookie"],
    redactQueryParams: ["token", "session"],
    stripInputValues: {
      password: true,
      email: true,
      textarea: false
    },
    maskSelectors: [".masked-card-number"],
    removeSelectors: ["[data-private='true']"],
    maxStringLength: 1000,
    maxStackLength: 8000
  }
});`)}
      <p>The SDK applies truncation and redaction before transport so the payload stays practical and safer to process on the backend.</p>
    `},{id:"limitations",title:"Limitations",eyebrow:"Notes",description:"The package is intentionally focused on client error reporting, not observability platform scope.",body:`
      <ul>
        <li>It does not include a hosted dashboard, replay service, or vendor backend.</li>
        <li>Screenshot capture is optional and best-effort. Cross-origin assets and browser restrictions can limit fidelity.</li>
        <li>The SDK is designed to fail silent. If transport or screenshot capture fails, the host app should keep working normally.</li>
        <li>Absolute endpoints are supported too, even though the docs examples use a relative path by default.</li>
      </ul>
    `}];var v=(e,r)=>e.length>r?`${e.slice(0,r)}\u2026`:e,$=(e,r,t)=>{e.push(r),e.length>t&&e.splice(0,e.length-t)};var k=(e,r)=>{try{return e()}catch{return r}},T=async(e,r)=>{try{return await e()}catch{return r}},M=e=>{try{e()}catch{}};var O=e=>{if(!(e instanceof Element))return"unknown";let r=e.tagName.toLowerCase(),t=e.id?`#${e.id}`:"",n=typeof e.className=="string"&&e.className.trim()?`.${e.className.trim().split(/\s+/).slice(0,2).join(".")}`:"",o=v(k(()=>{var s,i;return(i=(s=e.textContent)==null?void 0:s.trim())!=null?i:""},""),64),a=o?` "${o}"`:"";return`${r}${t}${n}${a}`};var z=()=>new Date().toISOString();var Je=(e,r)=>{var t,n;return{...r,value:v(r.value,(t=e.config.sanitize.maxBreadcrumbValueLength)!=null?t:240),timestamp:(n=r.timestamp)!=null?n:z()}},N=(e,r)=>{e.config.breadcrumbs.enabled&&$(e.breadcrumbs,Je(e,r),e.config.breadcrumbs.maxEntries)},fe=e=>{var t,n;if(typeof window=="undefined"||typeof document=="undefined"||!e.config.breadcrumbs.enabled)return[];let r=[];if(e.config.breadcrumbs.captureClicks){let o=a=>{e.destroyed||N(e,{type:"ui.click",value:O(a.target)})};document.addEventListener("click",o,!0),r.push(()=>document.removeEventListener("click",o,!0))}if(e.config.breadcrumbs.captureNavigation){let o=i=>{N(e,{type:i,value:window.location.href})},a=()=>o("navigation.popstate"),s=()=>o("navigation.hashchange");window.addEventListener("popstate",a),window.addEventListener("hashchange",s),r.push(()=>window.removeEventListener("popstate",a)),r.push(()=>window.removeEventListener("hashchange",s)),(t=window.history)!=null&&t.pushState&&(e.originalPushState=window.history.pushState.bind(window.history),window.history.pushState=function(...i){var l;let d=(l=e.originalPushState)==null?void 0:l.call(e,...i);return M(()=>o("navigation.pushState")),d},r.push(()=>{e.originalPushState&&(window.history.pushState=e.originalPushState)})),(n=window.history)!=null&&n.replaceState&&(e.originalReplaceState=window.history.replaceState.bind(window.history),window.history.replaceState=function(...i){var l;let d=(l=e.originalReplaceState)==null?void 0:l.call(e,...i);return M(()=>o("navigation.replaceState")),d},r.push(()=>{e.originalReplaceState&&(window.history.replaceState=e.originalReplaceState)}))}return r};var U=e=>typeof e=="object"&&e!==null,W=e=>{if(!U(e))return!1;let r=Object.getPrototypeOf(e);return r===Object.prototype||r===null};var Ge="[Circular]",B=e=>{let r=new WeakSet;return JSON.stringify(e,(t,n)=>{if(typeof n=="bigint")return n.toString();if(typeof n=="function")return`[Function ${n.name||"anonymous"}]`;if(U(n)){if(r.has(n))return Ge;r.add(n)}return n instanceof Error?{name:n.name,message:n.message,stack:n.stack}:n},2)},S=e=>{if(!W(e)&&!Array.isArray(e))return e;try{return JSON.parse(B(e))}catch{return e}};var Xe=e=>e.map(r=>typeof r=="string"?r:B(r)).join(" "),Ze=(e,r,t)=>{var n;return{level:r,message:v(Xe(t),(n=e.config.sanitize.maxConsoleEntryLength)!=null?n:1e3),timestamp:z()}},ge=(e,r)=>{if(typeof console=="undefined")return[];let t=[],n=(o,a)=>{if(!a)return;let s=console[o];e.originalConsole[o]=s.bind(console),console[o]=(...i)=>{var l;if(s.apply(console,i),e.destroyed||e.recursionGuard>0)return;let d=Ze(e,o,i);$(e.consoleEntries,d,(l=e.config.sanitize.maxConsoleEntries)!=null?l:20),r({kind:"console",source:`console.${o}`,level:o,message:d.message})},t.push(()=>{e.originalConsole[o]&&(console[o]=e.originalConsole[o])})};return n("error",e.config.captureConsoleErrors),n("warn",e.config.captureConsoleWarnings),t};var he=(e,r)=>{if(typeof window=="undefined"||!e.config.captureUnhandledRejections)return;let t=n=>{e.destroyed||r({kind:"promise_rejection",source:"unhandledrejection",error:n.reason})};return window.addEventListener("unhandledrejection",t),()=>window.removeEventListener("unhandledrejection",t)};var Ye=e=>{if(e instanceof Element)return k(()=>{if("src"in e&&typeof e.src=="string")return e.src;if("href"in e&&typeof e.href=="string")return e.href},void 0)},ye=(e,r)=>{if(typeof window=="undefined")return;let t=n=>{var i,d;if(e.destroyed)return;let o=(i=n.target)!=null?i:null;if(o&&o!==window){if(!e.config.captureResourceErrors)return;r({kind:"resource",source:"window.error",target:o,fileName:Ye(o)});return}if(!e.config.captureWindowErrors)return;let s=n;r({kind:"exception",source:"window.error",error:(d=s.error)!=null?d:new Error(s.message||"Unknown window error"),message:s.message,fileName:s.filename,line:s.lineno,column:s.colno})};return window.addEventListener("error",t,!0),()=>window.removeEventListener("error",t,!0)};var er=e=>e instanceof Error&&e.message?e.message:typeof e=="string"?e:typeof e=="object"&&e&&"message"in e&&typeof e.message=="string"?e.message:B(e),rr=e=>{if(e instanceof Error&&typeof e.stack=="string"||typeof e=="object"&&e&&"stack"in e&&typeof e.stack=="string")return e.stack},Ce=e=>{var n,o,a,s,i,d;if(e.kind==="resource")return{type:"resource",name:"ResourceLoadError",message:`Failed to load resource: ${O((n=e.target)!=null?n:null)}`,fileName:e.fileName,line:e.line,column:e.column};if(e.kind==="message")return{type:e.source||"message",name:"CapturedMessage",message:(o=e.message)!=null?o:"Unknown message"};if(e.kind==="console")return{type:e.source||"console",name:"ConsoleCapture",message:(a=e.message)!=null?a:"Captured console entry"};let r=(i=e.error)!=null?i:(s=e.extra)==null?void 0:s.originalError,t=r instanceof Error||typeof r=="object"&&r&&"name"in r&&typeof r.name=="string"?r.name:void 0;return{type:e.kind,name:t,message:(d=e.message)!=null?d:er(r),stack:rr(r),fileName:e.fileName,line:e.line,column:e.column}};var tr=()=>{if(typeof window!="undefined")return{width:window.innerWidth,height:window.innerHeight}},nr=()=>{if(!(typeof window=="undefined"||!window.screen))return{width:window.screen.width,height:window.screen.height}},or=()=>typeof window=="undefined"?{url:""}:{url:window.location.href,path:window.location.pathname,query:window.location.search||void 0,referrer:typeof document!="undefined"&&document.referrer||void 0,title:typeof document!="undefined"&&document.title||void 0},sr=()=>{if(typeof navigator!="undefined")return{userAgent:navigator.userAgent,language:navigator.language,viewport:tr(),screen:nr()}},Ee=(e,r,t)=>{var d,l,c,u,m,f,C,E,b,g,w,R,P,q;let n=e.config.appName||e.config.environment||e.config.release?{name:e.config.appName,environment:e.config.environment,release:e.config.release}:void 0,o=k(()=>{var x,h;return(h=(x=e.config).getUserContext)==null?void 0:h.call(x)},void 0),a=k(()=>{var x,h;return(h=(x=e.config).getCustomContext)==null?void 0:h.call(x)},void 0),s={...(d=S(o))!=null?d:{},...(l=S(e.userContext))!=null?l:{},...(u=S((c=r.extra)==null?void 0:c.user))!=null?u:{}},i={...(m=S(a))!=null?m:{},...(f=S(e.customContext))!=null?f:{},...(E=S((C=r.extra)==null?void 0:C.custom))!=null?E:{}};return{schemaVersion:"1.0",eventId:r.eventId,timestamp:r.timestamp,app:n,page:or(),browser:sr(),error:Ce(r),console:e.consoleEntries.slice(),breadcrumbs:[...e.breadcrumbs,...(g=(b=r.extra)==null?void 0:b.breadcrumbs)!=null?g:[]],network:(R=(w=r.extra)==null?void 0:w.network)==null?void 0:R.slice(),screenshot:t&&e.config.screenshot.includeInPayload?{format:e.config.screenshot.format,dataUrl:t}:void 0,user:Object.keys(s).length?s:void 0,custom:Object.keys(i).length?{...i,...(P=r.extra)!=null&&P.tags?{tags:r.extra.tags}:{}}:(q=r.extra)!=null&&q.tags?{tags:r.extra.tags}:void 0}};var K=e=>new Set((e!=null?e:[]).map(r=>r.trim().toLowerCase()).filter(Boolean)),j=e=>({redactKeys:K(e.redactKeys),redactHeaders:K(e.redactHeaders),redactQueryParams:K(e.redactQueryParams),redactBodyPaths:K(e.redactBodyPaths)}),be=(e,r)=>j(r).redactKeys.has(e.trim().toLowerCase()),we=(e,r)=>{var o,a;let t=e.join(".").trim().toLowerCase();if(!t)return!1;let n=j(r);return n.redactBodyPaths.has(t)||n.redactKeys.has((a=(o=e[e.length-1])==null?void 0:o.toLowerCase())!=null?a:"")},A=(e,r)=>{var o,a;let t=(o=r.replacementText)!=null?o:"[Redacted]",n=j(r);if(!n.redactQueryParams.size)return e;try{let s=typeof window!="undefined"&&((a=window.location)!=null&&a.href)?window.location.href:"http://localhost/",i=new URL(e,s);return n.redactQueryParams.forEach(d=>{i.searchParams.has(d)&&i.searchParams.set(d,t)}),/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(e)?i.toString():e.startsWith("?")?i.search:e.startsWith("#")?i.hash:`${i.pathname}${i.search}${i.hash}`}catch{return e}};var ir=(e,r,t)=>{var n,o,a,s;return r==="console"?(n=e.maxConsoleEntryLength)!=null?n:1e3:r==="breadcrumb"?(o=e.maxBreadcrumbValueLength)!=null?o:240:t[t.length-1]==="stack"?(a=e.maxStackLength)!=null?a:8e3:(s=e.maxStringLength)!=null?s:1e3},Y=(e,r,t)=>{let n=r.transform?r.transform(e,t):e;if(typeof n=="string"){let o=ir(r,t.source,t.path),s=t.path[t.path.length-1]==="url"||t.source==="query"?A(n,r):n;return v(s,o)}return n},ee=(e,r,t)=>{var o,a;if(r.enabled===!1)return e;if(e==null||typeof e=="number"||typeof e=="boolean"||typeof e=="string")return Y(e,r,t);if(Array.isArray(e))return e.map((s,i)=>ee(s,r,{...t,path:[...t.path,String(i)]}));if(!U(e)||!W(e))return Y(String(e),r,t);let n={};for(let[s,i]of Object.entries(e)){let d=[...t.path,s];if(be(s,r)||we(d,r)){n[s]=(o=r.replacementText)!=null?o:"[Redacted]";continue}if(t.source==="headers"&&j(r).redactHeaders.has(s.toLowerCase())){n[s]=(a=r.replacementText)!=null?a:"[Redacted]";continue}n[s]=ee(i,r,{...t,key:s,path:d})}return n},ar=(e,r)=>{var o;let t=(o=r.maxConsoleEntries)!=null?o:20;return e.slice(-t).map(a=>{var s;return{...a,message:v(A(a.message,r),(s=r.maxConsoleEntryLength)!=null?s:1e3)}})},ve=(e,r)=>{var n,o;let t=ee(e,r,{path:[],source:"payload"});return(n=t.page)!=null&&n.url&&(t.page.url=A(t.page.url,r)),(o=t.page)!=null&&o.query&&(t.page.query=A(t.page.query,r)),t.console&&(t.console=ar(t.console,r)),t.breadcrumbs&&(t.breadcrumbs=t.breadcrumbs.map(a=>{var s;return{...a,value:v(A(a.value,r),(s=r.maxBreadcrumbValueLength)!=null?s:240)}})),t},lr=(e,r)=>{var n,o;if(r.stripInputValues===!0)return!0;if(!r.stripInputValues||typeof r.stripInputValues!="object")return!1;if(e instanceof HTMLTextAreaElement)return(n=r.stripInputValues.textarea)!=null?n:!1;let t=e.type.toLowerCase()||"text";return(o=r.stripInputValues[t])!=null?o:!1},Se=(e,r)=>{var n,o,a;if(r.enabled===!1)return;let t=(n=r.replacementText)!=null?n:"[Redacted]";(o=r.removeSelectors)==null||o.forEach(s=>{e.querySelectorAll(s).forEach(i=>i.remove())}),(a=r.maskSelectors)==null||a.forEach(s=>{e.querySelectorAll(s).forEach(i=>{i.textContent=t})}),e.querySelectorAll("input, textarea").forEach(s=>{lr(s,r)&&(s.value=t,s.setAttribute("value",t),s instanceof HTMLTextAreaElement&&(s.textContent=t))})};var dr=()=>typeof document=="undefined"?"":Array.from(document.styleSheets).map(e=>{try{return Array.from(e.cssRules).map(r=>r.cssText).join(`
`)}catch{return""}}).join(`
`),cr=(e,r,t,n)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${n}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:${t}px;height:${n}px;overflow:hidden;background:#fff;">
      <style>${r}</style>
      ${e}
    </div>
  </foreignObject>
</svg>`,ur=e=>new Promise((r,t)=>{let n=new Image;n.onload=()=>r(n),n.onerror=()=>t(new Error("Screenshot image could not be loaded.")),n.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(e)}`}),pr=async e=>{var m,f;if(typeof document=="undefined"||typeof window=="undefined"||typeof XMLSerializer=="undefined")return null;let r=document.body;if(!r)return null;let t=r.cloneNode(!0);if(!(t instanceof HTMLElement))return null;Se(t,e.sanitize);let n=Math.min(window.innerWidth||1280,(m=e.maxWidth)!=null?m:1440),o=Math.min(window.innerHeight||720,(f=e.maxHeight)!=null?f:1200),s=new XMLSerializer().serializeToString(t),i=dr(),d=cr(s,i,n,o),l=await ur(d),c=document.createElement("canvas");c.width=n,c.height=o;let u=c.getContext("2d");return u?(u.drawImage(l,0,0,n,o),c.toDataURL(e.format,e.format==="image/jpeg"?e.quality:void 0)):null},xe=async(e,r)=>{if(!e.enabled)return null;let t={format:e.format,quality:e.quality,maxWidth:e.maxWidth,maxHeight:e.maxHeight,sanitize:r};return e.provider?T(()=>{var n,o;return(o=(n=e.provider)==null?void 0:n.call(e,t))!=null?o:null},null):T(()=>pr(t),null)};var mr=e=>/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(e),ke=async e=>{var n;let r=await T(()=>typeof e=="function"?e():e,"");if(typeof r!="string")return null;let t=r.trim();if(!t)return null;try{return mr(t)?new URL(t).toString():typeof window=="undefined"||typeof((n=window.location)==null?void 0:n.href)!="string"?null:new URL(t,window.location.href).toString()}catch{return null}};var fr=60*1024,gr=e=>typeof TextEncoder!="undefined"?new TextEncoder().encode(e).length:e.length,hr=(e,r)=>{var t;return(t=e.screenshot)!=null&&t.dataUrl?!1:gr(r)<=fr},yr=e=>e.auth.type==="bearer"?{Authorization:`Bearer ${e.auth.token}`}:e.auth.type==="custom"?{...e.auth.headers}:{},Cr=async e=>{let r=await T(()=>{var t,n;return(n=(t=e.getHeaders)==null?void 0:t.call(e))!=null?n:{}},{});return{"Content-Type":"application/json",...e.headers,...yr(e),...r}},Er=e=>{if(typeof AbortController=="undefined")return{cleanup:()=>{}};let r=new AbortController,t=globalThis.setTimeout(()=>r.abort(),e);return{signal:r.signal,cleanup:()=>globalThis.clearTimeout(t)}},br=e=>new Promise(r=>{globalThis.setTimeout(r,e)}),Te=async(e,r)=>{let t=await ke(e.endpoint);if(!t||typeof fetch!="function")throw new Error("Client errors endpoint could not be resolved.");let n=await Cr(e),o=JSON.stringify(r),a=hr(r,o),s=0,i=new Error("Client errors transport failed.");for(;s<=e.maxRetries;){let{signal:d,cleanup:l}=Er(e.timeoutMs);try{let c=await fetch(t,{method:e.method,headers:n,body:o,credentials:e.credentials,keepalive:a,signal:d});return l(),{ok:c.ok,status:c.status,statusText:c.statusText}}catch(c){l(),i=c,s+=1,s<=e.maxRetries&&await br(150*s)}}throw i};var Pe=()=>{let e=globalThis.crypto;if(e&&typeof e.randomUUID=="function")return e.randomUUID();let r=Math.random().toString(16).slice(2);return`rvlce-${Date.now().toString(36)}-${r}`};var Le="POST",Ie={type:"none"},Me={enabled:!0,maxEntries:25,captureClicks:!0,captureNavigation:!0},Re={enabled:!1,format:"image/jpeg",quality:.82,maxWidth:1440,maxHeight:1200,includeInPayload:!0},re={enabled:!0,redactKeys:["password","token","authorization","cookie","secret","apikey","apiKey"],redactHeaders:["authorization","cookie","x-api-key"],redactQueryParams:["password","token","authorization","cookie","apikey","apiKey"],redactBodyPaths:["password","token","authorization","cookie","secret"],maskSelectors:[],removeSelectors:[],stripInputValues:!1,maxStringLength:1e3,maxStackLength:8e3,maxConsoleEntryLength:1e3,maxConsoleEntries:20,maxBreadcrumbValueLength:240,maxDomSnippetLength:4e3,replacementText:"[Redacted]"},ze={maxEvents:10,perMilliseconds:6e4};var wr=e=>{var t,n,o,a,s,i,d,l;let r=typeof(e==null?void 0:e.stripInputValues)=="object"?{text:(t=e.stripInputValues.text)!=null?t:!1,email:(n=e.stripInputValues.email)!=null?n:!1,password:(o=e.stripInputValues.password)!=null?o:!0,search:(a=e.stripInputValues.search)!=null?a:!1,tel:(s=e.stripInputValues.tel)!=null?s:!1,url:(i=e.stripInputValues.url)!=null?i:!1,textarea:(d=e.stripInputValues.textarea)!=null?d:!1}:(l=e==null?void 0:e.stripInputValues)!=null?l:re.stripInputValues;return{...re,...e,stripInputValues:r}},Ae=e=>{var a,s,i,d,l,c,u,m,f,C,E,b,g;let r={...Me,...e.breadcrumbs},t={...Re,...e.screenshot},n=wr(e.sanitize),o={...ze,...e.rateLimit};return{...e,method:Le,enabled:(a=e.enabled)!=null?a:!0,debug:(s=e.debug)!=null?s:!1,auth:(i=e.auth)!=null?i:Ie,headers:(d=e.headers)!=null?d:{},credentials:(l=e.credentials)!=null?l:"omit",timeoutMs:(c=e.timeoutMs)!=null?c:6e3,maxRetries:(u=e.maxRetries)!=null?u:0,captureWindowErrors:(m=e.captureWindowErrors)!=null?m:!0,captureUnhandledRejections:(f=e.captureUnhandledRejections)!=null?f:!0,captureConsoleErrors:(C=e.captureConsoleErrors)!=null?C:!1,captureConsoleWarnings:(E=e.captureConsoleWarnings)!=null?E:!1,captureResourceErrors:(b=e.captureResourceErrors)!=null?b:!1,breadcrumbs:r,screenshot:t,sanitize:n,rateLimit:o,dedupeWindowMs:(g=e.dedupeWindowMs)!=null?g:3e3}};var vr=e=>{if(e.processing||e.inFlight>0||e.queue.length>0)return;e.flushResolvers.splice(0,e.flushResolvers.length).forEach(t=>t())},F=(e,r)=>{e.destroyed||e.scheduled||e.processing||(e.scheduled=!0,globalThis.setTimeout(async()=>{if(e.scheduled=!1,!(e.processing||e.destroyed)){e.processing=!0;try{for(;!e.destroyed&&e.queue.length>0;){let t=e.queue.shift();if(t){e.inFlight+=1;try{await r(t)}finally{e.inFlight-=1}}}}finally{e.processing=!1,vr(e),e.queue.length>0&&F(e,r)}}},0))},qe=(e,r,t)=>{e.destroyed||!e.config.enabled||(e.queue.push(r),F(e,t))},He=async e=>{!e.processing&&e.inFlight===0&&e.queue.length===0||await new Promise(r=>{e.flushResolvers.push(r)})};var Ue=(e,r)=>{let t=e.config.rateLimit.perMilliseconds,n=e.config.rateLimit.maxEvents;return e.rateWindow=e.rateWindow.filter(o=>r-o<=t),e.rateWindow.length>=n?!0:(e.rateWindow.push(r),!1)},Be=(e,r,t)=>{var a,s,i;let n=[r.error.type,(a=r.error.name)!=null?a:"",r.error.message,(s=r.error.stack)!=null?s:"",(i=r.page.path)!=null?i:""].join("|");for(let[d,l]of e.dedupeMap.entries())t-l>e.config.dedupeWindowMs&&e.dedupeMap.delete(d);let o=e.dedupeMap.get(n);return o&&t-o<=e.config.dedupeWindowMs?!0:(e.dedupeMap.set(n,t),!1)};var je=e=>({config:e,queue:[],scheduled:!1,processing:!1,inFlight:0,destroyed:!1,flushResolvers:[],cleanupTasks:[],breadcrumbs:[],consoleEntries:[],dedupeMap:new Map,rateWindow:[],recursionGuard:0,originalConsole:{}});var De=async(e,r)=>{if(e.destroyed||!e.config.enabled)return;let t=Date.parse(r.timestamp)||Date.now();e.recursionGuard+=1;try{let n=ve(Ee(e,r),e.config.sanitize);if(Ue(e,t)||Be(e,n,t)||!k(()=>{var i,d,l;return(l=(d=(i=e.config).shouldSend)==null?void 0:d.call(i,n))!=null?l:!0},!0))return;if(e.config.screenshot.enabled){let i=await xe(e.config.screenshot,e.config.sanitize);i&&e.config.screenshot.includeInPayload&&(n={...n,screenshot:{format:e.config.screenshot.format,dataUrl:i}})}let a=await T(()=>{var i,d,l;return(l=(d=(i=e.config).beforeSend)==null?void 0:d.call(i,n))!=null?l:n},n);if(!a)return;let s=await Te(e.config,a);if(s.ok){M(()=>{var i,d;return(d=(i=e.config).onSuccess)==null?void 0:d.call(i,a,s)});return}M(()=>{var i,d;return(d=(i=e.config).onError)==null?void 0:d.call(i,new Error(`Client errors transport responded with ${s.status} ${s.statusText}`))})}catch(n){M(()=>{var o,a;return(a=(o=e.config).onError)==null?void 0:a.call(o,n)})}finally{e.recursionGuard=Math.max(0,e.recursionGuard-1)}},Sr=e=>({eventId:Pe(),timestamp:z(),...e}),xr=e=>r=>{if(e.destroyed||!e.config.enabled)return null;let t=Sr(r);return qe(e,t,async n=>De(e,n)),t.eventId},kr=e=>{e.destroyed||(e.destroyed=!0,e.cleanupTasks.splice(0,e.cleanupTasks.length).forEach(r=>r()),e.queue=[],e.flushResolvers.splice(0,e.flushResolvers.length).forEach(r=>r()))},_e=e=>{let r=Ae(e),t=je(r),n=xr(t),o=ye(t,n),a=he(t,n),s=ge(t,n),i=fe(t);return t.cleanupTasks.push(...i,...s,...o?[o]:[],...a?[a]:[]),{get config(){return{...t.config}},async captureException(l,c){var u,m;return n({kind:"exception",source:(u=c==null?void 0:c.source)!=null?u:"manual.exception",error:l,extra:{...c,originalError:(m=c==null?void 0:c.originalError)!=null?m:l}})},async captureMessage(l,c="error",u){var m;return n({kind:"message",source:(m=u==null?void 0:u.source)!=null?m:"manual.message",level:c,message:l,extra:u})},addBreadcrumb(l){N(t,l)},setUserContext(l){t.userContext=l?S(l):void 0},setCustomContext(l){t.customContext=l?S(l):void 0},async flush(){F(t,async l=>De(t,l)),await He(t)},destroy(){kr(t)}}};var p=null,$e=e=>(p==null||p.destroy(),p=_e(e),p),Oe=(e,r)=>{var t;return(t=p==null?void 0:p.captureException(e,r))!=null?t:Promise.resolve(null)},Ne=(e,r,t)=>{var n;return(n=p==null?void 0:p.captureMessage(e,r,t))!=null?n:Promise.resolve(null)},V=e=>{p==null||p.addBreadcrumb(e)};var Q=()=>{var e;return(e=p==null?void 0:p.flush())!=null?e:Promise.resolve()},We=()=>{p==null||p.destroy(),p=null};var Tr=(e,r,t)=>`import { initClientErrors } from "@revivejs/client-errors";

initClientErrors({
  endpoint: "${e}",
  appName: "docs-playground",
  environment: "development",
  release: "0.1.0",
  captureWindowErrors: true,
  captureUnhandledRejections: true,
  captureConsoleErrors: ${t},
  screenshot: {
    enabled: true,
    format: "image/png",
    includeInPayload: true
  }${r==="bearer"?`,
  auth: {
    type: "bearer",
    token: "public-ingest-token"
  }`:r==="custom"?`,
  auth: {
    type: "custom",
    headers: {
      "X-Ingest-Key": "demo-public-key"
    }
  }`:""}
});`,Ke=async()=>new Promise(e=>{globalThis.requestAnimationFrame(()=>{globalThis.requestAnimationFrame(()=>e())})}),Pr=()=>{throw new Error("Division by zero in checkout pricing engine")},te=(e,r)=>{var n;if(!r){e.textContent="No payload received yet.";return}let t=(n=r.screenshot)!=null&&n.dataUrl?{...r,screenshot:{...r.screenshot,dataUrl:`${r.screenshot.dataUrl.slice(0,180)}... [truncated in docs preview]`}}:r;e.textContent=JSON.stringify(t,null,2)},J=(e,r,t,n)=>{var a,s,i,d;let o=(a=n==null?void 0:n.screenshot)==null?void 0:a.dataUrl;if(!o){e.hidden=!0,e.removeAttribute("src"),r.hidden=!1,t.textContent="The next captured error will render a full-screen screenshot of the page here.";return}e.src=o,e.alt="Captured screenshot of the client-errors playground action",e.hidden=!1,r.hidden=!0,t.textContent=`${(i=(s=n==null?void 0:n.screenshot)==null?void 0:s.format)!=null?i:"image/png"} attached to event ${(d=n==null?void 0:n.eventId)!=null?d:"unknown"}`},Fe=e=>{var oe,se,ie,ae,le,de,ce,ue;let r=console.error.bind(console),t=typeof window!="undefined"&&window.location.hostname.endsWith("github.io"),n=[];e.innerHTML=`
    <section class="playground">
      <div class="playground__header">
        <div>
          <span class="eyebrow">Live playground</span>
          <h2>Trigger a real client-side failure and inspect the exact report</h2>
          <p>This demo initializes the SDK, provokes a checkout calculation error on click, and renders both the normalized payload and the full-screen screenshot captured when the failure happens.</p>
        </div>
      </div>
      <div class="playground__grid">
        <div class="playground__panel">
          <label class="field">
            <span>Endpoint</span>
            <input id="playground-endpoint" type="text" value="api/frontend-errors" />
          </label>
          <label class="field">
            <span>Auth mode</span>
            <select id="playground-auth">
              <option value="none">No auth</option>
              <option value="bearer">Bearer token</option>
              <option value="custom">Custom headers</option>
            </select>
          </label>
          <label class="field field--inline">
            <input id="playground-console-errors" type="checkbox" />
            <span>Capture console.error</span>
          </label>
          <div class="actions">
            <button id="playground-init" class="button" type="button">Initialize SDK</button>
            <button id="playground-clear" class="button button--secondary" type="button">Clear server logs</button>
          </div>
          <div class="playground__tools">
            <span class="eyebrow eyebrow--muted">Extra triggers</span>
            <div class="actions">
              <button id="playground-capture-message" class="button button--secondary" type="button">Capture message</button>
              <button id="playground-trigger-console" class="button button--secondary" type="button">console.error</button>
            </div>
            <div class="actions">
              <button id="playground-trigger-rejection" class="button button--secondary" type="button">Unhandled rejection</button>
              <button id="playground-breadcrumb" class="button button--secondary" type="button">Add breadcrumb</button>
            </div>
          </div>
          <div class="snippet">
            <h3>Vanilla setup</h3>
            <pre><code id="playground-code"></code></pre>
          </div>
        </div>
        <div class="playground__preview">
          <div class="preview-card">
            <div class="status-pill" id="playground-status">SDK not initialized</div>
            <div class="status-meta" id="playground-count">Server events: 0</div>
            <p class="preview-copy">${t?"This public docs build runs in static preview mode, so it prepares the payload locally without sending a network request.":"Use the checkout button to trigger a pricing failure. The UI below shows the failed state before the SDK captures the exception and a full-screen screenshot."}</p>
          </div>
          <div class="demo-surface" id="playground-demo-surface" data-phase="ready">
            <div class="demo-surface__bar">
              <span class="demo-surface__phase" id="playground-demo-phase">Checkout ready</span>
              <span class="demo-surface__action" id="playground-demo-action">Waiting for a user action</span>
            </div>
            <div class="demo-surface__body">
              <div class="demo-surface__summary">
                <div class="demo-metric">
                  <span>Subtotal</span>
                  <strong>$128.45</strong>
                </div>
                <div class="demo-metric">
                  <span>Promotion divider</span>
                  <strong id="playground-demo-divider">0</strong>
                </div>
                <div class="demo-metric">
                  <span>Order total</span>
                  <strong id="playground-demo-total">Pending calculation</strong>
                </div>
              </div>
              <div class="demo-surface__notice" id="playground-demo-note">Click the button to simulate a broken checkout rule that divides by zero.</div>
              <div class="demo-surface__error" id="playground-demo-error" hidden></div>
            </div>
            <div class="demo-surface__footer">
              <span class="demo-chip" id="playground-demo-click">No click recorded yet</span>
              <div class="actions">
                <button id="playground-trigger-demo" class="button" type="button">Trigger checkout error</button>
                <button id="playground-reset-demo" class="button button--secondary" type="button">Reset surface</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="playground__row">
        <div class="preview-card preview-card--payload">
          <h3>Last received payload</h3>
          <p class="preview-copy">This is the exact normalized JSON POSTed to the local ingest endpoint after the action above fails.</p>
          <pre><code id="playground-output">No payload received yet.</code></pre>
        </div>
      </div>
      <div class="playground__row">
        <div class="preview-card">
          <h3>Captured screenshot</h3>
          <p class="preview-copy" id="playground-screenshot-meta">The next captured error will render a full-screen screenshot of the page here.</p>
          <div class="screenshot-card">
            <div class="screenshot-empty" id="playground-screenshot-empty">No screenshot captured yet.</div>
            <img id="playground-screenshot-image" class="screenshot-image" hidden />
          </div>
        </div>
      </div>
    </section>
  `;let o=e.querySelector("#playground-endpoint"),a=e.querySelector("#playground-auth"),s=e.querySelector("#playground-console-errors"),i=e.querySelector("#playground-code"),d=e.querySelector("#playground-output"),l=e.querySelector("#playground-status"),c=e.querySelector("#playground-count"),u=e.querySelector("#playground-screenshot-image"),m=e.querySelector("#playground-screenshot-empty"),f=e.querySelector("#playground-screenshot-meta"),C=e.querySelector("#playground-demo-surface"),E=e.querySelector("#playground-demo-phase"),b=e.querySelector("#playground-demo-action"),g=e.querySelector("#playground-demo-note"),w=e.querySelector("#playground-demo-error"),R=e.querySelector("#playground-demo-click"),P=e.querySelector("#playground-demo-total"),q=e.querySelector("#playground-demo-divider");if(!o||!a||!s||!i||!d||!l||!c||!u||!m||!f||!C||!E||!b||!g||!w||!R||!P||!q)return;let x=()=>{C.dataset.phase="ready",E.textContent="Checkout ready",b.textContent="Waiting for a user action",g.textContent="Click the button to simulate a broken checkout rule that divides by zero.",R.textContent="No click recorded yet",P.textContent="Pending calculation",q.textContent="0",w.hidden=!0,w.textContent=""},h=()=>{i.textContent=Tr(o.value,a.value,s.checked)},D=async()=>{var y,L,_,H,pe;if(t){let G=(y=n[n.length-1])!=null?y:null;c.textContent=`Prepared events: ${n.length}`,te(d,G),J(u,m,f,G);return}try{let X=await(await fetch("api/frontend-errors/logs")).json(),me=(H=(_=(L=X.items)==null?void 0:L[X.items.length-1])==null?void 0:_.payload)!=null?H:null;c.textContent=`Server events: ${(pe=X.count)!=null?pe:0}`,te(d,me),J(u,m,f,me)}catch{c.textContent="Server events: unavailable",d.textContent="Unable to read server logs.",J(u,m,f,null)}},ne=async()=>{We(),n.splice(0,n.length);let y=o.value.trim(),L=a.value,_=s.checked;$e({endpoint:y,appName:"docs-playground",environment:"development",release:"0.1.0",captureWindowErrors:!0,captureUnhandledRejections:!0,captureConsoleErrors:_,screenshot:{enabled:!0,format:"image/png",includeInPayload:!0,maxWidth:1440,maxHeight:1200},auth:L==="bearer"?{type:"bearer",token:"public-ingest-token"}:L==="custom"?{type:"custom",headers:{"X-Ingest-Key":"demo-public-key"}}:{type:"none"},beforeSend:H=>t?(n.push(H),l.textContent="Payload prepared locally",D(),null):H,onSuccess:()=>{l.textContent="Payload delivered",D()},onError:()=>{l.textContent="Transport or SDK step failed silently"}}),l.textContent="SDK initialized",h(),t||await fetch("api/frontend-errors/logs",{method:"DELETE"}),await D()};(oe=e.querySelector("#playground-init"))==null||oe.addEventListener("click",()=>{ne()}),(se=e.querySelector("#playground-clear"))==null||se.addEventListener("click",async()=>{n.splice(0,n.length),t||await fetch("api/frontend-errors/logs",{method:"DELETE"}),te(d,null),J(u,m,f,null),c.textContent=t?"Prepared events: 0":"Server events: 0",l.textContent=t?"Prepared payloads cleared":"Server logs cleared",x()}),(ie=e.querySelector("#playground-capture-message"))==null||ie.addEventListener("click",async()=>{V({type:"manual",value:"captureMessage button clicked"}),await Ne("Playground informational message","warn",{custom:{channel:"docs-playground"}}),await Q()}),(ae=e.querySelector("#playground-trigger-console"))==null||ae.addEventListener("click",async()=>{console.error("Playground console.error sample"),await Q()}),(le=e.querySelector("#playground-trigger-rejection"))==null||le.addEventListener("click",()=>{Promise.reject(new Error("Playground unhandled rejection"))}),(de=e.querySelector("#playground-breadcrumb"))==null||de.addEventListener("click",()=>{V({type:"manual",value:"Manual breadcrumb from playground"}),l.textContent="Breadcrumb added"}),(ce=e.querySelector("#playground-reset-demo"))==null||ce.addEventListener("click",()=>{x(),l.textContent="Demo surface reset"}),(ue=e.querySelector("#playground-trigger-demo"))==null||ue.addEventListener("click",async()=>{V({type:"manual",value:"Checkout CTA clicked in playground"}),C.dataset.phase="processing",E.textContent="Repricing order",b.textContent="Checkout CTA clicked",g.textContent="The UI is recalculating the order total before the failure is reported.",R.textContent="Clicked: Trigger checkout error",P.textContent="Recomputing...",w.hidden=!0,w.textContent="",l.textContent="Simulating checkout failure",await Ke();try{let y=Pr();P.textContent=`$${y.toFixed(2)}`,g.textContent="Calculation unexpectedly succeeded."}catch(y){let L=y instanceof Error?y.message:"Unknown checkout runtime error";C.dataset.phase="failed",E.textContent="Checkout failed",b.textContent="Division error visible in the UI",g.textContent="This visible error state is rendered first so the screenshot shows the exact broken page state.",P.textContent="Order total unavailable",w.hidden=!1,w.textContent=L,l.textContent="Division error captured, flushing queue",r("Playground checkout error:",y),await Ke(),await Oe(y,{source:"docs.checkout-demo",custom:{demo:"checkout-surface",action:"trigger-checkout-error",divider:0,orderId:"demo-order-2048",surfaceState:"failed"}}),await Q()}}),o.addEventListener("input",h),a.addEventListener("change",h),s.addEventListener("change",h),h(),x(),D(),ne()};var Qe=document.querySelector("#app");if(!Qe)throw new TypeError("Docs app root was not found.");var Lr=Z.map(e=>`
      <section id="${e.id}" class="panel">
        <div class="page__head">
          <span class="eyebrow">${e.eyebrow}</span>
          <h3>${e.title}</h3>
          <p>${e.description}</p>
        </div>
        <div class="page__body">${e.body}</div>
      </section>
    `).join(""),Ir=['<a href="#playground">Live Playground</a>',...Z.map(e=>`<a href="#${e.id}">${e.title}</a>`)].join("");Qe.innerHTML=`
  <div class="layout">
    <aside class="sidebar">
      <a class="brand" href="#playground">
        <span class="eyebrow">ReviveJS</span>
        <h1>@revivejs/client-errors</h1>
        <p>A lightweight frontend error reporting SDK with optional screenshot and context capture, designed to send reports to any developer-defined endpoint without platform lock-in.</p>
      </a>
      <nav class="nav">
        ${Ir}
      </nav>
    </aside>
    <main class="content">
      <div id="playground"></div>
      <section class="hero">
        <span class="eyebrow">Vanilla TypeScript SDK</span>
        <h2>Frontend error reporting without a vendor backend.</h2>
        <p><strong>@revivejs/client-errors</strong> captures browser runtime failures, normalizes context into one stable JSON contract, applies privacy-aware sanitization, and POSTs the result to any endpoint you control.</p>
        <div class="hero__meta">
          <span>Absolute and relative endpoints</span>
          <span>Pure POST or authenticated requests</span>
          <span>Queue-based fail-silent processing</span>
          <span>Optional screenshots</span>
        </div>
      </section>
      ${Lr}
    </main>
  </div>
`;var Ve=document.querySelector("#playground");Ve&&Fe(Ve);
