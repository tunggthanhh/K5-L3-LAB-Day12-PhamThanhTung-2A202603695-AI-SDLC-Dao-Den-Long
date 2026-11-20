(function (root, factory) {
  const api = factory(); if (typeof module !== 'undefined') module.exports = api; if (root) root.LanternDrifter = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const d = (a,b) => Math.hypot(a[0]-b[0],a[2]-b[2]);
  function create(id,pos){ return {id,pos:[...pos],state:'idle',stolen:0,fleeTicks:0}; }
  function updateState(drifter, player) {
    if (drifter.state === 'removed' || drifter.state === 'flee') return;
    drifter.state = player.carried >= 5 && d(drifter.pos,player.pos) <= 15 ? 'chase' : 'idle';
  }
  function moveToward(drifter,target,speed) { const dx=target[0]-drifter.pos[0], dz=target[2]-drifter.pos[2], n=Math.hypot(dx,dz)||1; drifter.pos[0]+=dx/n*speed/60; drifter.pos[2]+=dz/n*speed/60; }
  function steal(drifter,player) { if(drifter.state!=='chase'||d(drifter.pos,player.pos)>1.2)return 0; const amount=Math.min(3,player.carried); player.carried-=amount;drifter.stolen=amount;drifter.state='flee';drifter.fleeTicks=240;return amount; }
  return {create,updateState,moveToward,steal,distance:d};
});
