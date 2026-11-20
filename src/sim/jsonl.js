(function (root, factory) {
  const api = factory(); if (typeof module !== 'undefined') module.exports = api; if (root) root.LanternJSONL = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  return { event:(tick,name,data) => ({type:'event',tick,name,data}), end:(ticks,state,score) => ({type:'end',ticks,state,score}), stringify:JSON.stringify };
});
