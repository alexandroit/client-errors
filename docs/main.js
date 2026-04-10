var k=(e,r="ts")=>`
  <pre><code class="language-${r}">${e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}</code></pre>
`,Y=[{id:"overview",title:"Overview",eyebrow:"Browser SDK",description:"Capture browser runtime errors and send a normalized JSON payload to an endpoint you control.",body:`
      <p><strong>@stackline/client-errors</strong> captures frontend errors in the browser, collects basic request and page context, normalizes the result into a stable payload, and sends it with a POST request.</p>
      <p>The package is framework-agnostic. You can use it in plain browser applications today and wrap the same runtime later for React, Angular, or Vue.</p>
    `},{id:"installation",title:"Installation",eyebrow:"Quick start",description:"Install the package and initialize it with your ingest endpoint.",body:`
      ${k("npm install @stackline/client-errors","bash")}
      ${k(`import { initClientErrors } from "@stackline/client-errors";

initClientErrors({
  endpoint: "api/frontend-errors"
});`)}
      <p>The examples in this documentation use a relative path. Absolute URLs are also supported when your ingest service is hosted elsewhere.</p>
    `},{id:"direct-download",title:"Direct Download",eyebrow:"Pure browser JavaScript",description:"Download the compiled browser bundle from GitHub and use the SDK without npm or a bundler.",body:`
      <p>If your project loads JavaScript directly in the browser, use the GitHub download bundle instead of npm.</p>
      <p><a class="button" href="https://github.com/alexandroit/client-errors/tree/main/downloads" target="_blank" rel="noreferrer">Open GitHub download bundle</a></p>
      <p>The bundle exposes <code>window.StacklineClientErrors</code>.</p>
      ${k(`<script src="./client-errors.browser.js"><\/script>
<script>
  StacklineClientErrors.initClientErrors({
    endpoint: "api/frontend-errors"
  });
<\/script>`,"html")}
    `},{id:"transport",title:"Transport & Auth",eyebrow:"Backend agnostic",description:"Use plain POST, bearer tokens, custom headers, dynamic headers, or cookie-based requests.",body:`
      ${k(`initClientErrors({
  endpoint: "api/frontend-errors"
});`)}
      ${k(`initClientErrors({
  endpoint: "api/frontend-errors",
  auth: {
    type: "bearer",
    token: "public-ingest-token"
  }
});`)}
      ${k(`initClientErrors({
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
      <p>The SDK uses <code>fetch</code> and builds the request from your configuration. It does not depend on any specific backend product or hosted service.</p>
    `},{id:"api",title:"API",eyebrow:"Public surface",description:"Initialize the SDK once, then use the manual helpers when you need to report domain-specific failures.",body:`
      ${k(`import {
  addBreadcrumb,
  captureException,
  captureMessage,
  destroy,
  flush,
  initClientErrors,
  setCustomContext,
  setUserContext
} from "@stackline/client-errors";

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
    `},{id:"debug-context",title:"Debug Context",eyebrow:"DOM & source lines",description:"Optionally attach a sanitized HTML snippet and a few lines of source around the failing location.",body:`
      ${k(`initClientErrors({
  endpoint: "api/frontend-errors",
  dom: {
    enabled: true
  },
  sourceContext: {
    enabled: true,
    contextLines: 2
  }
});`)}
      <p>Use <code>dom.enabled</code> when you want a small sanitized HTML snippet near the failing element. Use <code>sourceContext.enabled</code> when you want nearby source lines for same-origin scripts. Both features are optional.</p>
    `},{id:"sanitization",title:"Sanitization",eyebrow:"Privacy-aware",description:"Redact sensitive fields before data leaves the browser.",body:`
      ${k(`initClientErrors({
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
      <p>The SDK truncates and redacts data before transport. You can keep the defaults or add stricter rules for your own application.</p>
    `},{id:"limitations",title:"Limitations",eyebrow:"Notes",description:"This package focuses on client-side error reporting.",body:`
      <ul>
        <li>It does not include a hosted dashboard, replay service, or backend service.</li>
        <li>Screenshot capture is optional and best-effort. Cross-origin assets and browser restrictions can affect the result.</li>
        <li>If transport or screenshot capture fails, the SDK drops the event instead of interrupting the host application.</li>
        <li>Both relative and absolute endpoints are supported.</li>
      </ul>
    `}];var C=(e,r)=>e.length>r?`${e.slice(0,r)}\u2026`:e,j=(e,r,t)=>{e.push(r),e.length>t&&e.splice(0,e.length-t)};var y=(e,r)=>{try{return e()}catch{return r}},w=async(e,r)=>{try{return await e()}catch{return r}},R=e=>{try{e()}catch{}};var M=e=>{if(typeof Element=="undefined"||!(e instanceof Element))return"unknown";let r=e.tagName.toLowerCase(),t=e.id?`#${e.id}`:"",n=typeof e.className=="string"&&e.className.trim()?`.${e.className.trim().split(/\s+/).slice(0,2).join(".")}`:"",o=C(y(()=>{var i,s;return(s=(i=e.textContent)==null?void 0:i.trim())!=null?s:""},""),64),a=o?` "${o}"`:"";return`${r}${t}${n}${a}`};var U=()=>new Date().toISOString();var tr=(e,r)=>{var t,n;return{...r,value:C(r.value,(t=e.config.sanitize.maxBreadcrumbValueLength)!=null?t:240),timestamp:(n=r.timestamp)!=null?n:U()}},N=(e,r)=>{e.config.breadcrumbs.enabled&&j(e.breadcrumbs,tr(e,r),e.config.breadcrumbs.maxEntries)},ge=e=>{var t,n;if(typeof window=="undefined"||typeof document=="undefined"||!e.config.breadcrumbs.enabled)return[];let r=[];if(e.config.breadcrumbs.captureClicks){let o=a=>{e.destroyed||N(e,{type:"ui.click",value:M(a.target)})};document.addEventListener("click",o,!0),r.push(()=>document.removeEventListener("click",o,!0))}if(e.config.breadcrumbs.captureNavigation){let o=s=>{N(e,{type:s,value:window.location.href})},a=()=>o("navigation.popstate"),i=()=>o("navigation.hashchange");window.addEventListener("popstate",a),window.addEventListener("hashchange",i),r.push(()=>window.removeEventListener("popstate",a)),r.push(()=>window.removeEventListener("hashchange",i)),(t=window.history)!=null&&t.pushState&&(e.originalPushState=window.history.pushState.bind(window.history),window.history.pushState=function(...s){var l;let d=(l=e.originalPushState)==null?void 0:l.call(e,...s);return R(()=>o("navigation.pushState")),d},r.push(()=>{e.originalPushState&&(window.history.pushState=e.originalPushState)})),(n=window.history)!=null&&n.replaceState&&(e.originalReplaceState=window.history.replaceState.bind(window.history),window.history.replaceState=function(...s){var l;let d=(l=e.originalReplaceState)==null?void 0:l.call(e,...s);return R(()=>o("navigation.replaceState")),d},r.push(()=>{e.originalReplaceState&&(window.history.replaceState=e.originalReplaceState)}))}return r};var B=e=>typeof e=="object"&&e!==null,W=e=>{if(!B(e))return!1;let r=Object.getPrototypeOf(e);return r===Object.prototype||r===null};var nr="[Circular]",$=e=>{let r=new WeakSet;return JSON.stringify(e,(t,n)=>{if(typeof n=="bigint")return n.toString();if(typeof n=="function")return`[Function ${n.name||"anonymous"}]`;if(B(n)){if(r.has(n))return nr;r.add(n)}return n instanceof Error?{name:n.name,message:n.message,stack:n.stack}:n},2)},T=e=>{if(!W(e)&&!Array.isArray(e))return e;try{return JSON.parse($(e))}catch{return e}};var or=e=>e.map(r=>typeof r=="string"?r:$(r)).join(" "),ir=(e,r,t)=>{var n;return{level:r,message:C(or(t),(n=e.config.sanitize.maxConsoleEntryLength)!=null?n:1e3),timestamp:U()}},he=(e,r)=>{if(typeof console=="undefined")return[];let t=[],n=(o,a)=>{if(!a)return;let i=console[o];e.originalConsole[o]=i.bind(console),console[o]=(...s)=>{var l;if(i.apply(console,s),e.destroyed||e.recursionGuard>0)return;let d=ir(e,o,s);j(e.consoleEntries,d,(l=e.config.sanitize.maxConsoleEntries)!=null?l:20),r({kind:"console",source:`console.${o}`,level:o,message:d.message})},t.push(()=>{e.originalConsole[o]&&(console[o]=e.originalConsole[o])})};return n("error",e.config.captureConsoleErrors),n("warn",e.config.captureConsoleWarnings),t};var Ce=(e,r)=>{if(typeof window=="undefined"||!e.config.captureUnhandledRejections)return;let t=n=>{e.destroyed||r({kind:"promise_rejection",source:"unhandledrejection",error:n.reason})};return window.addEventListener("unhandledrejection",t),()=>window.removeEventListener("unhandledrejection",t)};var sr=e=>{if(e instanceof Element)return y(()=>{if("src"in e&&typeof e.src=="string")return e.src;if("href"in e&&typeof e.href=="string")return e.href},void 0)},ye=(e,r)=>{if(typeof window=="undefined")return;let t=n=>{var s,d;if(e.destroyed)return;let o=(s=n.target)!=null?s:null;if(o&&o!==window){if(!e.config.captureResourceErrors)return;r({kind:"resource",source:"window.error",target:o,fileName:sr(o)});return}if(!e.config.captureWindowErrors)return;let i=n;r({kind:"exception",source:"window.error",error:(d=i.error)!=null?d:new Error(i.message||"Unknown window error"),message:i.message,fileName:i.filename,line:i.lineno,column:i.colno})};return window.addEventListener("error",t,!0),()=>window.removeEventListener("error",t,!0)};var ar=e=>e instanceof Error&&e.message?e.message:typeof e=="string"?e:typeof e=="object"&&e&&"message"in e&&typeof e.message=="string"?e.message:$(e),lr=e=>{if(e instanceof Error&&typeof e.stack=="string"||typeof e=="object"&&e&&"stack"in e&&typeof e.stack=="string")return e.stack},Ee=e=>{var n,o,a,i,s,d;if(e.kind==="resource")return{type:"resource",name:"ResourceLoadError",message:`Failed to load resource: ${M((n=e.target)!=null?n:null)}`,fileName:e.fileName,line:e.line,column:e.column};if(e.kind==="message")return{type:e.source||"message",name:"CapturedMessage",message:(o=e.message)!=null?o:"Unknown message"};if(e.kind==="console")return{type:e.source||"console",name:"ConsoleCapture",message:(a=e.message)!=null?a:"Captured console entry"};let r=(s=e.error)!=null?s:(i=e.extra)==null?void 0:i.originalError,t=r instanceof Error||typeof r=="object"&&r&&"name"in r&&typeof r.name=="string"?r.name:void 0;return{type:e.kind,name:t,message:(d=e.message)!=null?d:ar(r),stack:lr(r),fileName:e.fileName,line:e.line,column:e.column}};var F=e=>new Set((e!=null?e:[]).map(r=>r.trim().toLowerCase()).filter(Boolean)),O=e=>({redactKeys:F(e.redactKeys),redactHeaders:F(e.redactHeaders),redactQueryParams:F(e.redactQueryParams),redactBodyPaths:F(e.redactBodyPaths)}),be=(e,r)=>O(r).redactKeys.has(e.trim().toLowerCase()),we=(e,r)=>{var o,a;let t=e.join(".").trim().toLowerCase();if(!t)return!1;let n=O(r);return n.redactBodyPaths.has(t)||n.redactKeys.has((a=(o=e[e.length-1])==null?void 0:o.toLowerCase())!=null?a:"")},q=(e,r)=>{var o,a;let t=(o=r.replacementText)!=null?o:"[Redacted]",n=O(r);if(!n.redactQueryParams.size)return e;try{let i=typeof window!="undefined"&&((a=window.location)!=null&&a.href)?window.location.href:"http://localhost/",s=new URL(e,i);return n.redactQueryParams.forEach(d=>{s.searchParams.has(d)&&s.searchParams.set(d,t)}),/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(e)?s.toString():e.startsWith("?")?s.search:e.startsWith("#")?s.hash:`${s.pathname}${s.search}${s.hash}`}catch{return e}};var dr=(e,r,t)=>{var n,o,a,i,s;return r==="console"?(n=e.maxConsoleEntryLength)!=null?n:1e3:r==="breadcrumb"?(o=e.maxBreadcrumbValueLength)!=null?o:240:t[t.length-1]==="stack"?(a=e.maxStackLength)!=null?a:8e3:t[t.length-1]==="snippet"?(i=e.maxDomSnippetLength)!=null?i:4e3:(s=e.maxStringLength)!=null?s:1e3},ee=(e,r,t)=>{let n=r.transform?r.transform(e,t):e;if(typeof n=="string"){let o=dr(r,t.source,t.path),i=t.path[t.path.length-1]==="url"||t.source==="query"?q(n,r):n;return C(i,o)}return n},re=(e,r,t)=>{var o,a;if(r.enabled===!1)return e;if(e==null||typeof e=="number"||typeof e=="boolean"||typeof e=="string")return ee(e,r,t);if(Array.isArray(e))return e.map((i,s)=>re(i,r,{...t,path:[...t.path,String(s)]}));if(!B(e)||!W(e))return ee(String(e),r,t);let n={};for(let[i,s]of Object.entries(e)){let d=[...t.path,i];if(be(i,r)||we(d,r)){n[i]=(o=r.replacementText)!=null?o:"[Redacted]";continue}if(t.source==="headers"&&O(r).redactHeaders.has(i.toLowerCase())){n[i]=(a=r.replacementText)!=null?a:"[Redacted]";continue}n[i]=re(s,r,{...t,key:i,path:d})}return n},cr=(e,r)=>{var o;let t=(o=r.maxConsoleEntries)!=null?o:20;return e.slice(-t).map(a=>{var i;return{...a,message:C(q(a.message,r),(i=r.maxConsoleEntryLength)!=null?i:1e3)}})},ve=(e,r)=>{var n,o;let t=re(e,r,{path:[],source:"payload"});return(n=t.page)!=null&&n.url&&(t.page.url=q(t.page.url,r)),(o=t.page)!=null&&o.query&&(t.page.query=q(t.page.query,r)),t.console&&(t.console=cr(t.console,r)),t.breadcrumbs&&(t.breadcrumbs=t.breadcrumbs.map(a=>{var i;return{...a,value:C(q(a.value,r),(i=r.maxBreadcrumbValueLength)!=null?i:240)}})),t},ur=(e,r)=>{var n,o;if(r.stripInputValues===!0)return!0;if(!r.stripInputValues||typeof r.stripInputValues!="object")return!1;if(e instanceof HTMLTextAreaElement)return(n=r.stripInputValues.textarea)!=null?n:!1;let t=e.type.toLowerCase()||"text";return(o=r.stripInputValues[t])!=null?o:!1},K=(e,r)=>{var n,o,a;if(r.enabled===!1)return;let t=(n=r.replacementText)!=null?n:"[Redacted]";(o=r.removeSelectors)==null||o.forEach(i=>{e.querySelectorAll(i).forEach(s=>s.remove())}),(a=r.maskSelectors)==null||a.forEach(i=>{e.querySelectorAll(i).forEach(s=>{s.textContent=t})}),e.querySelectorAll("input, textarea").forEach(i=>{ur(i,r)&&(i.value=t,i.setAttribute("value",t),i instanceof HTMLTextAreaElement&&(i.textContent=t))})};var pr=["[data-client-errors-snippet]","[role='dialog']","form","main","section","article","table",".modal",".dialog",".card"].join(", "),Se=e=>typeof Element!="undefined"&&e instanceof Element?e:null,mr=(e,r)=>{if(e){if(r!=null&&r.trim()){let n=y(()=>e.closest(r),null);if(n)return n}let t=y(()=>e.closest(pr),null);return t||e}return typeof document=="undefined"?null:document.body instanceof Element?document.body:null},fr=e=>e.replace(/\s+/g," ").replace(/>\s+</g,"><").trim(),xe=(e,r,t)=>{var l;let n=Se(e),o=typeof document!="undefined"?Se(document.activeElement):null,a=mr(n!=null?n:o,r),i={target:M(n!=null?n:o),activeElement:o?M(o):void 0};if(!a)return i.target||i.activeElement?i:void 0;let s=y(()=>a.cloneNode(!0),null);if(!(s instanceof Element))return i.target||i.activeElement?i:void 0;s.querySelectorAll("script, style, noscript").forEach(c=>c.remove()),K(s,t);let d=C(fr(s.outerHTML),(l=t.maxDomSnippetLength)!=null?l:4e3);return{...i,snippet:d}},Te=e=>{var r,t;return(t=e.target)!=null?t:(r=e.extra)==null?void 0:r.target};var ke=120,gr=e=>{var r;if(typeof window=="undefined"||!((r=window.location)!=null&&r.href))return null;try{return new URL(e,window.location.href)}catch{return null}},hr=e=>typeof window=="undefined"?!1:e.origin===window.location.origin,Cr=async(e,r)=>{let t=r.href,n=e.sourceFileCache.get(t);if(n)return n;let o=w(async()=>{let a=await fetch(t,{method:"GET",credentials:"same-origin",cache:"force-cache"});return a.ok?a.text():null},null);return e.sourceFileCache.set(t,o),o},yr=(e,r,t)=>{let n=Math.max(0,(t!=null?t:1)-1),o=Math.max(0,n-ke),a=Math.min(e.length,n+ke),i=o>0?"...":"",s=a<e.length?"...":"";return[{number:r,content:`${i}${e.slice(o,a)}${s}`,highlight:!0}]},Er=(e,r,t,n=2)=>{var c;if(!r||r<1)return;let o=e.split(/\r?\n/),a=r-1,i=o[a];if(typeof i!="string")return;if(o.length===1||i.length>360)return yr(i,r,t);let s=Math.max(0,a-n),d=Math.min(o.length-1,a+n),l=[];for(let u=s;u<=d;u+=1)l.push({number:u+1,content:C((c=o[u])!=null?c:"",500),highlight:u===a});return l},Pe=async(e,r,t,n)=>{if(!r)return;let o={fileName:r,line:t,column:n};if(!e.config.sourceContext.enabled)return o;let a=gr(r);if(!a||!hr(a))return o;let i=await Cr(e,a);if(!i)return o;let s=Er(i,t,n,e.config.sourceContext.contextLines);return s!=null&&s.length?{...o,lines:s}:o};var br=()=>{if(typeof window!="undefined")return{width:window.innerWidth,height:window.innerHeight}},wr=()=>{if(!(typeof window=="undefined"||!window.screen))return{width:window.screen.width,height:window.screen.height}},vr=()=>typeof window=="undefined"?{url:""}:{url:window.location.href,path:window.location.pathname,query:window.location.search||void 0,referrer:typeof document!="undefined"&&document.referrer||void 0,title:typeof document!="undefined"&&document.title||void 0},Sr=()=>{if(typeof navigator!="undefined")return{userAgent:navigator.userAgent,language:navigator.language,viewport:br(),screen:wr()}},Le=(e,r,t)=>{var c,u,m,h,v,S,x,b;let n=e.config.appName||e.config.environment||e.config.release?{name:e.config.appName,environment:e.config.environment,release:e.config.release}:void 0,o=y(()=>{var f,g;return(g=(f=e.config).getUserContext)==null?void 0:g.call(f)},void 0),a=y(()=>{var f,g;return(g=(f=e.config).getCustomContext)==null?void 0:g.call(f)},void 0),i={...(c=T(o))!=null?c:{},...(u=T(e.userContext))!=null?u:{},...(h=T((m=r.extra)==null?void 0:m.user))!=null?h:{}},s={...(v=T(a))!=null?v:{},...(S=T(e.customContext))!=null?S:{},...(b=T((x=r.extra)==null?void 0:x.custom))!=null?b:{}},d=Ee(r),l=e.config.dom.enabled?xe(Te(r),e.config.dom.rootSelector,e.config.sanitize):void 0;return Pe(e,d.fileName,d.line,d.column).then(f=>{var g,P,H,z,L,I;return{schemaVersion:"1.0",eventId:r.eventId,timestamp:r.timestamp,app:n,page:vr(),browser:Sr(),error:{...d,...l?{dom:l}:{},...f?{sourceContext:f}:{}},console:e.consoleEntries.slice(),breadcrumbs:[...e.breadcrumbs,...(P=(g=r.extra)==null?void 0:g.breadcrumbs)!=null?P:[]],network:(z=(H=r.extra)==null?void 0:H.network)==null?void 0:z.slice(),screenshot:t&&e.config.screenshot.includeInPayload?{format:e.config.screenshot.format,dataUrl:t}:void 0,user:Object.keys(i).length?i:void 0,custom:Object.keys(s).length?{...s,...(L=r.extra)!=null&&L.tags?{tags:r.extra.tags}:{}}:(I=r.extra)!=null&&I.tags?{tags:r.extra.tags}:void 0}})};var xr=()=>typeof document=="undefined"?"":Array.from(document.styleSheets).map(e=>{try{return Array.from(e.cssRules).map(r=>r.cssText).join(`
`)}catch{return""}}).join(`
`),Tr=(e,r,t,n)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${n}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:${t}px;height:${n}px;overflow:hidden;background:#fff;">
      <style>${r}</style>
      ${e}
    </div>
  </foreignObject>
</svg>`,kr=e=>new Promise((r,t)=>{let n=new Image;n.onload=()=>r(n),n.onerror=()=>t(new Error("Screenshot image could not be loaded.")),n.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(e)}`}),Pr=async e=>{var m,h;if(typeof document=="undefined"||typeof window=="undefined"||typeof XMLSerializer=="undefined")return null;let r=document.body;if(!r)return null;let t=r.cloneNode(!0);if(!(t instanceof HTMLElement))return null;K(t,e.sanitize);let n=Math.min(window.innerWidth||1280,(m=e.maxWidth)!=null?m:1440),o=Math.min(window.innerHeight||720,(h=e.maxHeight)!=null?h:1200),i=new XMLSerializer().serializeToString(t),s=xr(),d=Tr(i,s,n,o),l=await kr(d),c=document.createElement("canvas");c.width=n,c.height=o;let u=c.getContext("2d");return u?(u.drawImage(l,0,0,n,o),c.toDataURL(e.format,e.format==="image/jpeg"?e.quality:void 0)):null},Ie=async(e,r)=>{if(!e.enabled)return null;let t={format:e.format,quality:e.quality,maxWidth:e.maxWidth,maxHeight:e.maxHeight,sanitize:r};return e.provider?w(()=>{var n,o;return(o=(n=e.provider)==null?void 0:n.call(e,t))!=null?o:null},null):w(()=>Pr(t),null)};var Lr=e=>/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(e),Re=async e=>{var n;let r=await w(()=>typeof e=="function"?e():e,"");if(typeof r!="string")return null;let t=r.trim();if(!t)return null;try{return Lr(t)?new URL(t).toString():typeof window=="undefined"||typeof((n=window.location)==null?void 0:n.href)!="string"?null:new URL(t,window.location.href).toString()}catch{return null}};var Ir=60*1024,Rr=e=>typeof TextEncoder!="undefined"?new TextEncoder().encode(e).length:e.length,Mr=(e,r)=>{var t;return(t=e.screenshot)!=null&&t.dataUrl?!1:Rr(r)<=Ir},zr=e=>e.auth.type==="bearer"?{Authorization:`Bearer ${e.auth.token}`}:e.auth.type==="custom"?{...e.auth.headers}:{},Ar=async e=>{let r=await w(()=>{var t,n;return(n=(t=e.getHeaders)==null?void 0:t.call(e))!=null?n:{}},{});return{"Content-Type":"application/json",...e.headers,...zr(e),...r}},Dr=e=>{if(typeof AbortController=="undefined")return{cleanup:()=>{}};let r=new AbortController,t=globalThis.setTimeout(()=>r.abort(),e);return{signal:r.signal,cleanup:()=>globalThis.clearTimeout(t)}},Ur=e=>new Promise(r=>{globalThis.setTimeout(r,e)}),Me=async(e,r)=>{let t=await Re(e.endpoint);if(!t||typeof fetch!="function")throw new Error("Client errors endpoint could not be resolved.");let n=await Ar(e),o=JSON.stringify(r),a=Mr(r,o),i=0,s=new Error("Client errors transport failed.");for(;i<=e.maxRetries;){let{signal:d,cleanup:l}=Dr(e.timeoutMs);try{let c=await fetch(t,{method:e.method,headers:n,body:o,credentials:e.credentials,keepalive:a,signal:d});return l(),{ok:c.ok,status:c.status,statusText:c.statusText}}catch(c){l(),s=c,i+=1,i<=e.maxRetries&&await Ur(150*i)}}throw s};var ze=()=>{let e=globalThis.crypto;if(e&&typeof e.randomUUID=="function")return e.randomUUID();let r=Math.random().toString(16).slice(2);return`rvlce-${Date.now().toString(36)}-${r}`};var Ae="POST",De={type:"none"},Ue={enabled:!0,maxEntries:25,captureClicks:!0,captureNavigation:!0},qe={enabled:!1,rootSelector:""},He={enabled:!1,contextLines:2},_e={enabled:!1,format:"image/jpeg",quality:.82,maxWidth:1440,maxHeight:1200,includeInPayload:!0},te={enabled:!0,redactKeys:["password","token","authorization","cookie","secret","apikey","apiKey"],redactHeaders:["authorization","cookie","x-api-key"],redactQueryParams:["password","token","authorization","cookie","apikey","apiKey"],redactBodyPaths:["password","token","authorization","cookie","secret"],maskSelectors:[],removeSelectors:[],stripInputValues:!1,maxStringLength:1e3,maxStackLength:8e3,maxConsoleEntryLength:1e3,maxConsoleEntries:20,maxBreadcrumbValueLength:240,maxDomSnippetLength:4e3,replacementText:"[Redacted]"},Be={maxEvents:10,perMilliseconds:6e4};var qr=e=>{var t,n,o,a,i,s,d,l;let r=typeof(e==null?void 0:e.stripInputValues)=="object"?{text:(t=e.stripInputValues.text)!=null?t:!1,email:(n=e.stripInputValues.email)!=null?n:!1,password:(o=e.stripInputValues.password)!=null?o:!0,search:(a=e.stripInputValues.search)!=null?a:!1,tel:(i=e.stripInputValues.tel)!=null?i:!1,url:(s=e.stripInputValues.url)!=null?s:!1,textarea:(d=e.stripInputValues.textarea)!=null?d:!1}:(l=e==null?void 0:e.stripInputValues)!=null?l:te.stripInputValues;return{...te,...e,stripInputValues:r}},$e=e=>{var s,d,l,c,u,m,h,v,S,x,b,f,g;let r={...Ue,...e.breadcrumbs},t={...qe,...e.dom},n={...He,...e.sourceContext},o={..._e,...e.screenshot},a=qr(e.sanitize),i={...Be,...e.rateLimit};return{...e,method:Ae,enabled:(s=e.enabled)!=null?s:!0,debug:(d=e.debug)!=null?d:!1,auth:(l=e.auth)!=null?l:De,headers:(c=e.headers)!=null?c:{},credentials:(u=e.credentials)!=null?u:"omit",timeoutMs:(m=e.timeoutMs)!=null?m:6e3,maxRetries:(h=e.maxRetries)!=null?h:0,captureWindowErrors:(v=e.captureWindowErrors)!=null?v:!0,captureUnhandledRejections:(S=e.captureUnhandledRejections)!=null?S:!0,captureConsoleErrors:(x=e.captureConsoleErrors)!=null?x:!1,captureConsoleWarnings:(b=e.captureConsoleWarnings)!=null?b:!1,captureResourceErrors:(f=e.captureResourceErrors)!=null?f:!1,breadcrumbs:r,dom:t,sourceContext:n,screenshot:o,sanitize:a,rateLimit:i,dedupeWindowMs:(g=e.dedupeWindowMs)!=null?g:3e3}};var Hr=e=>{if(e.processing||e.inFlight>0||e.queue.length>0)return;e.flushResolvers.splice(0,e.flushResolvers.length).forEach(t=>t())},V=(e,r)=>{e.destroyed||e.scheduled||e.processing||(e.scheduled=!0,globalThis.setTimeout(async()=>{if(e.scheduled=!1,!(e.processing||e.destroyed)){e.processing=!0;try{for(;!e.destroyed&&e.queue.length>0;){let t=e.queue.shift();if(t){e.inFlight+=1;try{await r(t)}finally{e.inFlight-=1}}}}finally{e.processing=!1,Hr(e),e.queue.length>0&&V(e,r)}}},0))},Oe=(e,r,t)=>{e.destroyed||!e.config.enabled||(e.queue.push(r),V(e,t))},je=async e=>{!e.processing&&e.inFlight===0&&e.queue.length===0||await new Promise(r=>{e.flushResolvers.push(r)})};var Ne=(e,r)=>{let t=e.config.rateLimit.perMilliseconds,n=e.config.rateLimit.maxEvents;return e.rateWindow=e.rateWindow.filter(o=>r-o<=t),e.rateWindow.length>=n?!0:(e.rateWindow.push(r),!1)},We=(e,r,t)=>{var a,i,s;let n=[r.error.type,(a=r.error.name)!=null?a:"",r.error.message,(i=r.error.stack)!=null?i:"",(s=r.page.path)!=null?s:""].join("|");for(let[d,l]of e.dedupeMap.entries())t-l>e.config.dedupeWindowMs&&e.dedupeMap.delete(d);let o=e.dedupeMap.get(n);return o&&t-o<=e.config.dedupeWindowMs?!0:(e.dedupeMap.set(n,t),!1)};var Fe=e=>({config:e,queue:[],scheduled:!1,processing:!1,inFlight:0,destroyed:!1,flushResolvers:[],cleanupTasks:[],breadcrumbs:[],consoleEntries:[],dedupeMap:new Map,rateWindow:[],recursionGuard:0,sourceFileCache:new Map,originalConsole:{}});var Ke=async(e,r)=>{if(e.destroyed||!e.config.enabled)return;let t=Date.parse(r.timestamp)||Date.now();e.recursionGuard+=1;try{let n=ve(await Le(e,r),e.config.sanitize);if(Ne(e,t)||We(e,n,t)||!y(()=>{var s,d,l;return(l=(d=(s=e.config).shouldSend)==null?void 0:d.call(s,n))!=null?l:!0},!0))return;if(e.config.screenshot.enabled){let s=await Ie(e.config.screenshot,e.config.sanitize);s&&e.config.screenshot.includeInPayload&&(n={...n,screenshot:{format:e.config.screenshot.format,dataUrl:s}})}let a=await w(()=>{var s,d,l;return(l=(d=(s=e.config).beforeSend)==null?void 0:d.call(s,n))!=null?l:n},n);if(!a)return;let i=await Me(e.config,a);if(i.ok){R(()=>{var s,d;return(d=(s=e.config).onSuccess)==null?void 0:d.call(s,a,i)});return}R(()=>{var s,d;return(d=(s=e.config).onError)==null?void 0:d.call(s,new Error(`Client errors transport responded with ${i.status} ${i.statusText}`))})}catch(n){R(()=>{var o,a;return(a=(o=e.config).onError)==null?void 0:a.call(o,n)})}finally{e.recursionGuard=Math.max(0,e.recursionGuard-1)}},_r=e=>({eventId:ze(),timestamp:U(),...e}),Br=e=>r=>{if(e.destroyed||!e.config.enabled)return null;let t=_r(r);return Oe(e,t,async n=>Ke(e,n)),t.eventId},$r=e=>{e.destroyed||(e.destroyed=!0,e.cleanupTasks.splice(0,e.cleanupTasks.length).forEach(r=>r()),e.queue=[],e.flushResolvers.splice(0,e.flushResolvers.length).forEach(r=>r()))},Ve=e=>{let r=$e(e),t=Fe(r),n=Br(t),o=ye(t,n),a=Ce(t,n),i=he(t,n),s=ge(t);return t.cleanupTasks.push(...s,...i,...o?[o]:[],...a?[a]:[]),{get config(){return{...t.config}},async captureException(l,c){var u,m;return n({kind:"exception",source:(u=c==null?void 0:c.source)!=null?u:"manual.exception",error:l,target:c==null?void 0:c.target,extra:{...c,originalError:(m=c==null?void 0:c.originalError)!=null?m:l}})},async captureMessage(l,c="error",u){var m;return n({kind:"message",source:(m=u==null?void 0:u.source)!=null?m:"manual.message",level:c,message:l,target:u==null?void 0:u.target,extra:u})},addBreadcrumb(l){N(t,l)},setUserContext(l){t.userContext=l?T(l):void 0},setCustomContext(l){t.customContext=l?T(l):void 0},async flush(){V(t,async l=>Ke(t,l)),await je(t)},destroy(){$r(t)}}};var p=null,Qe=e=>(p==null||p.destroy(),p=Ve(e),p),Ge=(e,r)=>{var t;return(t=p==null?void 0:p.captureException(e,r))!=null?t:Promise.resolve(null)},Xe=(e,r,t)=>{var n;return(n=p==null?void 0:p.captureMessage(e,r,t))!=null?n:Promise.resolve(null)},Q=e=>{p==null||p.addBreadcrumb(e)};var G=()=>{var e;return(e=p==null?void 0:p.flush())!=null?e:Promise.resolve()},Je=()=>{p==null||p.destroy(),p=null};var Or=(e,r,t)=>`import { initClientErrors } from "@stackline/client-errors";

initClientErrors({
  endpoint: "${e}",
  appName: "docs-playground",
  environment: "development",
  release: "0.1.1",
  captureWindowErrors: true,
  captureUnhandledRejections: true,
  captureConsoleErrors: ${t},
  dom: {
    enabled: true
  },
  sourceContext: {
    enabled: true,
    contextLines: 2
  },
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
});`,Ze=async()=>new Promise(e=>{globalThis.requestAnimationFrame(()=>{globalThis.requestAnimationFrame(()=>e())})}),jr=()=>{throw new Error("Division by zero in checkout pricing engine")},ne=(e,r)=>{var n;if(!r){e.textContent="No payload received yet.";return}let t=(n=r.screenshot)!=null&&n.dataUrl?{...r,screenshot:{...r.screenshot,dataUrl:`${r.screenshot.dataUrl.slice(0,180)}... [truncated in docs preview]`}}:r;e.textContent=JSON.stringify(t,null,2)},X=(e,r,t,n)=>{var a,i,s,d;let o=(a=n==null?void 0:n.screenshot)==null?void 0:a.dataUrl;if(!o){e.hidden=!0,e.removeAttribute("src"),r.hidden=!1,t.textContent="The next captured event will render a full-screen screenshot of the page here.";return}e.src=o,e.alt="Captured screenshot of the client-errors playground action",e.hidden=!1,r.hidden=!0,t.textContent=`${(s=(i=n==null?void 0:n.screenshot)==null?void 0:i.format)!=null?s:"image/png"} attached to event ${(d=n==null?void 0:n.eventId)!=null?d:"unknown"}`},Ye=e=>{var ie,se,ae,le,de,ce,ue,pe;let r=console.error.bind(console),t=typeof window!="undefined"&&window.location.hostname.endsWith("github.io"),n=[];e.innerHTML=`
    <section class="playground">
      <div class="playground__header">
        <div>
          <span class="eyebrow">Live playground</span>
          <h2>Trigger an error and inspect the report</h2>
          <p>This demo initializes the SDK, triggers a checkout calculation error, and shows the normalized payload together with the captured screenshot.</p>
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
            <p class="preview-copy">${t?"On GitHub Pages this demo prepares the payload locally and skips the network request.":"Click the button to trigger a checkout error. The payload and screenshot will appear below."}</p>
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
              <div class="demo-surface__notice" id="playground-demo-note">Click the button to simulate a checkout rule that divides by zero.</div>
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
          <p class="preview-copy">This is the normalized payload generated for the last captured event.</p>
          <pre><code id="playground-output">No payload received yet.</code></pre>
        </div>
      </div>
      <div class="playground__row">
        <div class="preview-card">
          <h3>Captured screenshot</h3>
          <p class="preview-copy" id="playground-screenshot-meta">The next captured event will render a full-screen screenshot of the page here.</p>
          <div class="screenshot-card">
            <div class="screenshot-empty" id="playground-screenshot-empty">No screenshot captured yet.</div>
            <img id="playground-screenshot-image" class="screenshot-image" hidden />
          </div>
        </div>
      </div>
    </section>
  `;let o=e.querySelector("#playground-endpoint"),a=e.querySelector("#playground-auth"),i=e.querySelector("#playground-console-errors"),s=e.querySelector("#playground-code"),d=e.querySelector("#playground-output"),l=e.querySelector("#playground-status"),c=e.querySelector("#playground-count"),u=e.querySelector("#playground-screenshot-image"),m=e.querySelector("#playground-screenshot-empty"),h=e.querySelector("#playground-screenshot-meta"),v=e.querySelector("#playground-demo-surface"),S=e.querySelector("#playground-demo-phase"),x=e.querySelector("#playground-demo-action"),b=e.querySelector("#playground-demo-note"),f=e.querySelector("#playground-demo-error"),g=e.querySelector("#playground-demo-click"),P=e.querySelector("#playground-demo-total"),H=e.querySelector("#playground-demo-divider");if(!o||!a||!i||!s||!d||!l||!c||!u||!m||!h||!v||!S||!x||!b||!f||!g||!P||!H)return;let z=()=>{v.dataset.phase="ready",S.textContent="Checkout ready",x.textContent="Waiting for a user action",b.textContent="Click the button to simulate a checkout rule that divides by zero.",g.textContent="No click recorded yet",P.textContent="Pending calculation",H.textContent="0",f.hidden=!0,f.textContent=""},L=()=>{s.textContent=Or(o.value,a.value,i.checked)},I=async()=>{var A,E,D,_,me;if(t){let J=(A=n[n.length-1])!=null?A:null;c.textContent=`Prepared events: ${n.length}`,ne(d,J),X(u,m,h,J);return}try{let Z=await(await fetch("api/frontend-errors/logs")).json(),fe=(_=(D=(E=Z.items)==null?void 0:E[Z.items.length-1])==null?void 0:D.payload)!=null?_:null;c.textContent=`Server events: ${(me=Z.count)!=null?me:0}`,ne(d,fe),X(u,m,h,fe)}catch{c.textContent="Server events: unavailable",d.textContent="Unable to read server logs.",X(u,m,h,null)}},oe=async()=>{Je(),n.splice(0,n.length);let A=o.value.trim(),E=a.value,D=i.checked;Qe({endpoint:A,appName:"docs-playground",environment:"development",release:"0.1.1",captureWindowErrors:!0,captureUnhandledRejections:!0,captureConsoleErrors:D,dom:{enabled:!0},sourceContext:{enabled:!0,contextLines:2},screenshot:{enabled:!0,format:"image/png",includeInPayload:!0,maxWidth:1440,maxHeight:1200},auth:E==="bearer"?{type:"bearer",token:"public-ingest-token"}:E==="custom"?{type:"custom",headers:{"X-Ingest-Key":"demo-public-key"}}:{type:"none"},beforeSend:_=>t?(n.push(_),l.textContent="Payload prepared locally",I(),null):_,onSuccess:()=>{l.textContent="Payload delivered",I()},onError:()=>{l.textContent="Transport or SDK step failed silently"}}),l.textContent="SDK initialized",L(),t||await fetch("api/frontend-errors/logs",{method:"DELETE"}),await I()};(ie=e.querySelector("#playground-init"))==null||ie.addEventListener("click",()=>{oe()}),(se=e.querySelector("#playground-clear"))==null||se.addEventListener("click",async()=>{n.splice(0,n.length),t||await fetch("api/frontend-errors/logs",{method:"DELETE"}),ne(d,null),X(u,m,h,null),c.textContent=t?"Prepared events: 0":"Server events: 0",l.textContent=t?"Prepared payloads cleared":"Server logs cleared",z()}),(ae=e.querySelector("#playground-capture-message"))==null||ae.addEventListener("click",async()=>{Q({type:"manual",value:"captureMessage button clicked"}),await Xe("Playground informational message","warn",{custom:{channel:"docs-playground"}}),await G()}),(le=e.querySelector("#playground-trigger-console"))==null||le.addEventListener("click",async()=>{console.error("Playground console.error sample"),await G()}),(de=e.querySelector("#playground-trigger-rejection"))==null||de.addEventListener("click",()=>{Promise.reject(new Error("Playground unhandled rejection"))}),(ce=e.querySelector("#playground-breadcrumb"))==null||ce.addEventListener("click",()=>{Q({type:"manual",value:"Manual breadcrumb from playground"}),l.textContent="Breadcrumb added"}),(ue=e.querySelector("#playground-reset-demo"))==null||ue.addEventListener("click",()=>{z(),l.textContent="Demo surface reset"}),(pe=e.querySelector("#playground-trigger-demo"))==null||pe.addEventListener("click",async A=>{Q({type:"manual",value:"Checkout CTA clicked in playground"}),v.dataset.phase="processing",S.textContent="Repricing order",x.textContent="Checkout CTA clicked",b.textContent="The UI is recalculating the order total before the failure is reported.",g.textContent="Clicked: Trigger checkout error",P.textContent="Recomputing...",f.hidden=!0,f.textContent="",l.textContent="Simulating checkout failure",await Ze();try{let E=jr();P.textContent=`$${E.toFixed(2)}`,b.textContent="Calculation unexpectedly succeeded."}catch(E){let D=E instanceof Error?E.message:"Unknown checkout runtime error";v.dataset.phase="failed",S.textContent="Checkout failed",x.textContent="Division error visible in the UI",b.textContent="This visible error state is rendered first so the screenshot shows the exact broken page state.",P.textContent="Order total unavailable",f.hidden=!1,f.textContent=D,l.textContent="Division error captured, flushing queue",r("Playground checkout error:",E),await Ze(),await Ge(E,{source:"docs.checkout-demo",target:A.currentTarget,custom:{demo:"checkout-surface",action:"trigger-checkout-error",divider:0,orderId:"demo-order-2048",surfaceState:"failed"}}),await G()}}),o.addEventListener("input",L),a.addEventListener("change",L),i.addEventListener("change",L),L(),z(),I(),oe()};var rr=document.querySelector("#app");if(!rr)throw new TypeError("Docs app root was not found.");var Nr=Y.map(e=>`
      <section id="${e.id}" class="panel">
        <div class="page__head">
          <span class="eyebrow">${e.eyebrow}</span>
          <h3>${e.title}</h3>
          <p>${e.description}</p>
        </div>
        <div class="page__body">${e.body}</div>
      </section>
    `).join(""),Wr=['<a href="#playground">Live Playground</a>',...Y.map(e=>`<a href="#${e.id}">${e.title}</a>`)].join("");rr.innerHTML=`
  <div class="layout">
    <aside class="sidebar">
      <a class="brand" href="#playground">
        <span class="eyebrow">Stackline</span>
        <h1>@stackline/client-errors</h1>
        <p>Browser error reporting SDK for sending normalized client-side errors to your own endpoint.</p>
      </a>
      <nav class="nav">
        ${Wr}
      </nav>
    </aside>
    <main class="content">
      <div id="playground"></div>
      <section class="hero">
        <span class="eyebrow">Vanilla TypeScript SDK</span>
        <h2>Capture frontend errors and send them to your backend.</h2>
        <p><strong>@stackline/client-errors</strong> listens for browser runtime failures, normalizes the event into a predictable payload, applies sanitization rules, and sends the result with a POST request.</p>
        <div class="hero__meta">
          <span>Absolute and relative endpoints</span>
          <span>Pure POST or authenticated requests</span>
          <span>Queue-based fail-silent processing</span>
          <span>Optional screenshots</span>
        </div>
      </section>
      ${Nr}
    </main>
  </div>
`;var er=document.querySelector("#playground");er&&Ye(er);
