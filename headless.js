#!/usr/bin/env node
'use strict';
const fs=require('fs'), {Simulation,validateInputs}=require('./game'), JSONL=require('./src/sim/jsonl');
function fail(message, code=1){process.stderr.write(message+'\n');process.exit(code);}
const a=process.argv.slice(2), value=k=>{const i=a.indexOf(k);return i<0?undefined:a[i+1];};
const required=['--seed','--night','--ticks','--out']; for(const k of required)if(value(k)===undefined)fail(`missing ${k}`);
const night=Number(value('--night')); if(![1,2,3].includes(night))fail('night must be 1, 2, or 3'); const seed=Number(value('--seed')),ticks=Number(value('--ticks')), every=Number(value('--snapshot-every')||10);if(!Number.isInteger(seed)||!Number.isInteger(ticks)||ticks<0||!Number.isInteger(every)||every<1)fail('invalid numeric argument');
function json(path,label){try{return JSON.parse(fs.readFileSync(path,'utf8'));}catch(e){fail(`invalid ${label}: ${e.message}`,2);}}
let scenario,inputs={frames:[]};try {if(value('--scenario'))scenario=json(value('--scenario'),'scenario');if(value('--inputs'))inputs=json(value('--inputs'),'inputs');validateInputs(inputs);}catch(e){fail(e.message,2);}
const frames=new Map(inputs.frames.map(f=>[f.tick,f]));const sim=new Simulation(seed,scenario,night),out=[sim.snapshot()];out.push(JSONL.event(0,'night_start',{night}));for(let k=0;k<ticks&&sim.state!=='won'&&sim.state!=='lost';k++){const patch=frames.get(k)||{};const events=sim.step(patch);out.push(...events);if(sim.tick%every===0)out.push(sim.snapshot());}out.push(JSONL.end(sim.tick,sim.state,sim.score));try{fs.writeFileSync(value('--out'),out.map(JSONL.stringify).join('\n')+'\n');}catch(e){fail(e.message);}
