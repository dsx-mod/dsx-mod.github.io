/**
 * 分享参数编解码：把配置状态压成短字符串放进分享 path。
 * 只编码"选项下标 + 位掩码"，名称由本地 config 还原，不传中文，长度可控。
 */
const cfg = require('../data/config.js');

const BO5_ALL = (cfg.SHELLS[2].styles || []).concat(cfg.SHELLS[2].backShells || []);
const COLOR_ALL = cfg.COLORS.concat(['原装按键']);
const DPAD_CONFIGS = ['标配TTC金+青龙', '自备微动'];
const SHOULDER_CONFIGS = ['青龙微动', '自备微动'];
const TRIGGER_CONFIGS = ['TTC金微动', '自备微动'];

function idx(list, value) {
  return value ? list.indexOf(value) : -1;
}

function pick(list, i) {
  return i >= 0 && i < list.length ? list[i] : '';
}

function mask(list, values, map) {
  return (values || []).reduce((m, v) => {
    const i = list.indexOf(v);
    return i === -1 ? m : m | (1 << i);
  }, 0);
}

function unmask(list, m) {
  const out = [];
  list.forEach((v, i) => { if (m & (1 << i)) out.push(v); });
  return out;
}

function encodeState(state) {
  const b = state.backkey || {};
  const shell = cfg.SHELLS.filter(s => s.name === state.shell)[0] || {};
  const values = [
    idx(cfg.MOTHERBOARDS.map(m => m.name), state.motherboard),
    idx(cfg.SHELLS.map(s => s.name), state.shell),
    idx(shell.colors || [], state.shellColor),
    idx(BO5_ALL, state.bo5Style),
    idx(cfg.SHELLS[3].otherOptions || [], state.otherShell),
    idx(cfg.MIDFRAME, state.midframe),
    idx(cfg.STICKS.map(s => s.name), state.stick),
    idx(cfg.DAMPINGS.map(d => d.name), state.damping),
    mask(cfg.ACCESSORIES.map(a => a.name), state.accessories),
    mask(cfg.UPGRADES.map(u => u.name), state.upgrades),
    idx(cfg.MODULE_TYPES, state.dpad.type),
    idx(cfg.FORCES, state.dpad.force),
    idx(DPAD_CONFIGS, state.dpad.config),
    idx(COLOR_ALL, state.dpad.color),
    idx(cfg.MODULE_TYPES, state.interact.type),
    idx(cfg.FORCES, state.interact.force),
    idx(DPAD_CONFIGS, state.interact.config),
    idx(COLOR_ALL, state.interact.color),
    idx(cfg.SHOULDERS.map(s => s.name), state.shoulder.type),
    idx(cfg.FORCES, state.shoulder.force),
    idx(SHOULDER_CONFIGS, state.shoulder.config),
    idx(cfg.TRIGGERS.map(t => t.name), state.trigger.type),
    idx(TRIGGER_CONFIGS, state.trigger.config),
    b.count === '2' ? 1 : (b.count === '4' ? 2 : 0),
    mask(cfg.KEYCAPS, b.keycaps),
    mask(cfg.POSITIONS, b.positions),
    idx(cfg.EXTRA_SHOULDERS, b.extraShoulder),
    (b.fn ? 1 : 0) | (b.mic ? 2 : 0) | (b.hen ? 4 : 0)
  ];
  let code = 'v1.' + values.map(v => (v + 1).toString(36)).join('.');
  const text = (state.ergaiRequirement || '').slice(0, 60);
  if (text) code += '~' + encodeURIComponent(text);
  return code;
}

function decodeState(code) {
  const state = {
    motherboard: '',
    shell: '',
    shellColor: '',
    bo5Style: '',
    otherShell: '',
    midframe: '',
    upgrades: [],
    accessories: [],
    stick: '',
    damping: '',
    dpad: { type: '', force: '', config: '', color: '' },
    interact: { type: '', force: '', config: '', color: '' },
    shoulder: { type: '', force: '', config: '' },
    trigger: { type: '', config: '' },
    backkey: { count: '', keycaps: [], positions: [], extraShoulder: '', fn: false, mic: false, hen: false },
    ergaiRequirement: '',
    typecChecked: false,
    typecDisabled: false
  };
  if (!code || code.indexOf('v1.') !== 0) return state;

  const parts = code.slice(3).split('~');
  const nums = parts[0].split('.').map(x => parseInt(x, 36) - 1);
  if (nums.length < 28) return state;

  const shellIndex = nums[1];
  const shell = cfg.SHELLS[shellIndex] || {};
  const flags = nums[27];

  state.motherboard = pick(cfg.MOTHERBOARDS.map(m => m.name), nums[0]);
  state.shell = pick(cfg.SHELLS.map(s => s.name), shellIndex);
  state.shellColor = pick(shell.colors || [], nums[2]);
  state.bo5Style = pick(BO5_ALL, nums[3]);
  state.otherShell = pick(cfg.SHELLS[3].otherOptions || [], nums[4]);
  state.midframe = pick(cfg.MIDFRAME, nums[5]);
  state.stick = pick(cfg.STICKS.map(s => s.name), nums[6]);
  state.damping = pick(cfg.DAMPINGS.map(d => d.name), nums[7]);
  state.accessories = unmask(cfg.ACCESSORIES.map(a => a.name), nums[8]);
  state.upgrades = unmask(cfg.UPGRADES.map(u => u.name), nums[9]);
  state.dpad = {
    type: pick(cfg.MODULE_TYPES, nums[10]),
    force: pick(cfg.FORCES, nums[11]),
    config: pick(DPAD_CONFIGS, nums[12]),
    color: pick(COLOR_ALL, nums[13])
  };
  state.interact = {
    type: pick(cfg.MODULE_TYPES, nums[14]),
    force: pick(cfg.FORCES, nums[15]),
    config: pick(DPAD_CONFIGS, nums[16]),
    color: pick(COLOR_ALL, nums[17])
  };
  state.shoulder = {
    type: pick(cfg.SHOULDERS.map(s => s.name), nums[18]),
    force: pick(cfg.FORCES, nums[19]),
    config: pick(SHOULDER_CONFIGS, nums[20])
  };
  state.trigger = {
    type: pick(cfg.TRIGGERS.map(t => t.name), nums[21]),
    config: pick(TRIGGER_CONFIGS, nums[22])
  };
  state.backkey = {
    count: nums[23] === 1 ? '2' : (nums[23] === 2 ? '4' : ''),
    keycaps: unmask(cfg.KEYCAPS, nums[24]),
    positions: unmask(cfg.POSITIONS, nums[25]),
    extraShoulder: pick(cfg.EXTRA_SHOULDERS, nums[26]),
    fn: !!(flags & 1),
    mic: !!(flags & 2),
    hen: !!(flags & 4)
  };
  try {
    state.ergaiRequirement = parts[1] ? decodeURIComponent(parts[1]) : '';
  } catch (e) {
    state.ergaiRequirement = '';
  }
  return state;
}

module.exports = { encodeState, decodeState };
