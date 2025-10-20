
// Simple turn-based prototype
let player = {
  name: "Hero",
  maxHP: 100,
  hp: 100,
  energy: 50,
  baseDamage: 12,
  level: 1,
  auto: false
};
let enemy = {
  name: "Sea Raider",
  maxHP: 80,
  hp: 80,
  baseDamage: 8
};
let orbs = Array.from({length:7}, (_,i) => ({id:i+1, collected:false}));

const pHpEl = document.getElementById('p-hp');
const eHpEl = document.getElementById('e-hp');
const pEnergyEl = document.getElementById('p-energy');
const logEl = document.getElementById('log');
const orbContainer = document.getElementById('orbContainer');
const autoBtn = document.getElementById('autoBtn');
const attackBtn = document.getElementById('attackBtn');
const skillBtn = document.getElementById('skillBtn');

function renderOrbs(){
  orbContainer.innerHTML = '';
  orbs.forEach(o=>{
    const d = document.createElement('div');
    d.className = 'orb';
    d.style.background = o.collected ? 'linear-gradient(135deg,#ffd700,#ff8c00)' : 'linear-gradient(135deg,#9b59b6,#3498db)';
    d.textContent = o.collected ? '✓' : o.id;
    orbContainer.appendChild(d);
  });
}

function log(text){
  const el = document.createElement('div');
  el.className = 'logitem';
  el.textContent = text;
  logEl.prepend(el);
}

function updateUI(){
  pHpEl.textContent = player.hp;
  eHpEl.textContent = enemy.hp;
  pEnergyEl.textContent = player.energy;
}

function enemyTurn(){
  if(enemy.hp <= 0) return;
  const dmg = Math.max(1, Math.round(enemy.baseDamage * (1 + Math.random()*0.3)));
  player.hp = Math.max(0, player.hp - dmg);
  log(`${enemy.name} hits ${player.name} for ${dmg} dmg.`);
  if(player.hp <= 0){
    log('You were defeated. Restarting...');
    setTimeout(resetBattle, 1200);
  }
  updateUI();
}

function playerAttack(){
  if(enemy.hp <= 0) return;
  const dmg = Math.max(1, Math.round(player.baseDamage * (1 + (player.level-1)*0.2) * (0.9 + Math.random()*0.2)));
  enemy.hp = Math.max(0, enemy.hp - dmg);
  log(`${player.name} attacks for ${dmg} dmg.`);
  if(enemy.hp <= 0){
    log('Enemy defeated!');
    collectOrb();
    setTimeout(spawnEnemy, 1000);
  } else {
    setTimeout(enemyTurn, 700);
  }
  updateUI();
}

function playerSkill(){
  if(player.energy < 20){ log('Not enough energy.'); return; }
  player.energy -= 20;
  const dmg = Math.max(5, Math.round((player.baseDamage*2.2) * (1+Math.random()*0.2)));
  enemy.hp = Math.max(0, enemy.hp - dmg);
  log(`${player.name} uses Skill for ${dmg} dmg.`);
  if(enemy.hp <= 0){
    log('Enemy defeated by Skill!');
    collectOrb();
    setTimeout(spawnEnemy, 1000);
  } else {
    setTimeout(enemyTurn, 700);
  }
  updateUI();
}

function collectOrb(){
  const next = orbs.find(o=>!o.collected);
  if(next){
    next.collected = true;
    log(`You collected Mystic Orb #${next.id}! (${orbs.filter(o=>o.collected).length}/7)`);
    renderOrbs();
    // reward: energy and level when collecting final orb
    player.energy = Math.min(100, player.energy + 20);
    if(orbs.every(o=>o.collected)){
      log('All 7 Mystic Orbs collected! You gain a level and full energy.');
      player.level += 1;
      player.maxHP += 20;
      player.hp = player.maxHP;
      player.energy = 100;
      // reset orbs for demo
      setTimeout(()=>{ orbs.forEach(o=>o.collected=false); renderOrbs(); }, 2000);
    }
  }
}

function spawnEnemy(){
  enemy = {
    name: "Sea Raider",
    maxHP: Math.round(80 * (1 + player.level*0.2)),
    hp: Math.round(80 * (1 + player.level*0.2)),
    baseDamage: Math.round(8 * (1 + player.level*0.15))
  };
  log('A new enemy appears!');
  updateUI();
  if(player.auto) autoFightStep();
}

function resetBattle(){
  player.hp = player.maxHP;
  player.energy = 50;
  enemy.hp = enemy.maxHP;
  log('Battle reset.');
  updateUI();
}

let autoInterval = null;
function autoFightStart(){
  player.auto = true;
  autoBtn.textContent = 'Stop Auto';
  autoInterval = setInterval(autoFightStep, 900);
}
function autoFightStop(){
  player.auto = false;
  autoBtn.textContent = 'Auto Fight';
  if(autoInterval) clearInterval(autoInterval);
}
function autoFightStep(){
  if(player.hp <= 0 || enemy.hp <= 0) return;
  // auto prioritize skill if energy enough
  if(player.energy >= 20 && Math.random()>0.4){
    playerSkill();
  } else {
    playerAttack();
  }
  // small energy regen
  player.energy = Math.min(100, player.energy + 5);
  updateUI();
}

autoBtn.addEventListener('click', ()=>{
  if(player.auto) autoFightStop(); else autoFightStart();
});
attackBtn.addEventListener('click', ()=>{ playerAttack(); });
skillBtn.addEventListener('click', ()=>{ playerSkill(); });

// init
renderOrbs();
updateUI();
log('Welcome to Orb Legends prototype. Collect 7 Mystic Orbs!');
