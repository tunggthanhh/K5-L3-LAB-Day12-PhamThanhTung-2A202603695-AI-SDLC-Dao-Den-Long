(function (root, factory) {
  const api = factory(); if (typeof module !== 'undefined') module.exports = api; if (root) root.LanternMaps = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const positions = { 1:[[0,0,25],[23.8,0,7.7],[14.7,0,-20.2],[-14.7,0,-20.2],[-23.8,0,7.7]], 2:[[0,0,20],[17,0,-10],[-17,0,-10],[70,0,20],[87,0,-10],[53,0,-10]], 3:[[0,6,6],[18,3,10],[-18,3,10],[35,0,-10],[-35,0,-10],[20,0,-35],[-20,0,-35]] };
  const lanterns = night => positions[night].map((pos, i) => ({ id:`L${i + 1}`, pos:[...pos], lit:false, deposited:0, fuel:0, ever_lit:false, relit_count:0 }));
  const charms = night => (night === 2 ? [[35,0,0]] : night === 3 ? [[30,0,25],[-30,0,25]] : []).map((pos,i) => ({id:`C${i+1}`,pos,available:true,respawn:0}));
  return { lanterns, charms };
});
