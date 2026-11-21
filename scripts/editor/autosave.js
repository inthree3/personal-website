export function createAutosave({body,revision,send,onState=()=>{},delay=500}){
 let latest=body,saved=body,timer,inFlight,error,warning,unconfirmed;
 const emit=(state,extra={})=>onState({state,...extra});
 const dirty=()=>latest!==saved||Boolean(inFlight)||Boolean(unconfirmed);
 function schedule(){
  clearTimeout(timer);
  if(latest!==saved&&!error)timer=setTimeout(()=>{flush().catch(()=>{});},delay);
 }
 function change(next){
  latest=next;
  if(!error)emit(latest===saved?'saved':'pending');
  schedule();
 }
 function flush({force=false}={}){
  clearTimeout(timer);
  if(inFlight)return inFlight;
  error=null;
  if(latest===saved&&!force&&!unconfirmed)return Promise.resolve();
  inFlight=(async()=>{
   do{
    const update=unconfirmed||{body:latest,revision};
    unconfirmed=update;
    emit('saving');
    const result=await send(update);
    revision=result.revision;saved=update.body;warning=result.warning;unconfirmed=null;
   }while(latest!==saved);
   emit(warning?'warning':'saved',warning?{message:warning}:{});
  })().catch(e=>{if(e.status>=400&&e.status<500)unconfirmed=null;error=e;emit('error',{message:e.message});throw e;}).finally(()=>{inFlight=null;});
  return inFlight;
 }
 return {change,flush,get dirty(){return dirty();},setDelay(ms){if(!Number.isFinite(ms)||ms<0)throw new Error('Invalid delay');delay=ms;schedule();}};
}
