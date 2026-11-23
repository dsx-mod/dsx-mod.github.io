/**
 * 价格计算（纯函数，不依赖 wx API）
 * 规则与网站 index.html 的 updateSummary / getMissingRequired 保持一致：
 * - 基础键为默认价，@ 键仅在特定条件下覆盖
 * - 十字键/交互键的按键颜色加价只体现在选项标签上，与网站一致不计入总价
 */
const { PRICES, PRICES_BY_VALUE } = require('../data/prices.js');
const {
  UPGRADE_BOARDS,
  DUAL_TRIGGER_BOARDS,
  TMR_STICKS
} = require('../data/config.js');

function base(name) {
  return PRICES.hasOwnProperty(name) ? PRICES[name] : 0;
}

function isErGai(state) {
  return state.motherboard === '二改手柄';
}

function isGns(state) {
  return state.motherboard === 'GNS明日香主板';
}

// 选项的实际价格（含 @ 动态覆盖）
function effectivePrice(name, state) {
  if (name === '摇杆下压微动') {
    return isGns(state) ? PRICES['摇杆下压微动@GNS'] : base(name);
  }
  if (name === 'PS键微动') {
    return isErGai(state) ? PRICES['PS键微动@二改'] : base(name);
  }
  if (name === 'alps蓝边摇杆') {
    return isErGai(state) ? PRICES['alps蓝边摇杆@二改'] : base(name);
  }
  if (name === 'DS13MAX摇杆') {
    return isErGai(state) ? PRICES['DS13MAX摇杆@二改'] : base(name);
  }
  if (name === 'JS13PRO+摇杆') {
    return isErGai(state) ? PRICES['JS13PRO+摇杆@二改'] : base(name);
  }
  return base(name);
}

// 按键颜色价格：仅"原装软胶垫"时黑白加价，原装按键 0
function colorPrice(state, type) {
  return type === '原装软胶垫' ? PRICES['按键颜色加价'] : 0;
}

// 键帽动态价（与网站 calculateKeycapPrices 一致）
function keycapPrices(state) {
  const prices = {
    '刀片键帽': 0,
    '大圆点键帽': 0,
    '嵌入圆点键帽': 0,
    'DSE金属豆子键帽': 0,
    'DSE金属拨片键帽': 0
  };
  const count = state.backkey.count;
  if (!count) return prices;

  const hasBean = state.backkey.keycaps.indexOf('DSE金属豆子键帽') !== -1;
  const hasPaddle = state.backkey.keycaps.indexOf('DSE金属拨片键帽') !== -1;

  if (count === '2') {
    prices['DSE金属豆子键帽'] = PRICES['DSE金属键帽@2个背键'];
    prices['DSE金属拨片键帽'] = PRICES['DSE金属键帽@2个背键'];
  } else if (hasBean && hasPaddle) {
    prices['DSE金属豆子键帽'] = PRICES['DSE金属键帽@4个背键_双选'];
    prices['DSE金属拨片键帽'] = PRICES['DSE金属键帽@4个背键_双选'];
  } else {
    prices['DSE金属豆子键帽'] = PRICES['DSE金属键帽@4个背键_单选'];
    prices['DSE金属拨片键帽'] = PRICES['DSE金属键帽@4个背键_单选'];
  }
  return prices;
}

// 选配升级：当前主板可见的选项
function visibleUpgrades(state) {
  const board = state.motherboard;
  if (board === '自备主板') {
    return require('../data/config.js').UPGRADES;
  }
  return require('../data/config.js').UPGRADES.filter(u => u.boards.indexOf(board) !== -1);
}

function upgradeStepVisible(state) {
  return UPGRADE_BOARDS.indexOf(state.motherboard) !== -1;
}

// 丢弃当前主板不支持的选择，保证状态与页面显示一致
function normalize(state) {
  // 选配升级
  if (!upgradeStepVisible(state)) {
    state.upgrades = [];
  } else {
    const allowed = visibleUpgrades(state).map(u => u.name);
    state.upgrades = state.upgrades.filter(n => allowed.indexOf(n) !== -1);
  }

  // TYPEC 规则随外壳/主板变化
  const shell = state.shell;
  const hasTypec = state.accessories.indexOf('TYPEC接口制作') !== -1;
  if (isErGai(state)) {
    state.typecDisabled = false;
    state.typecChecked = hasTypec;
  } else if (shell === '振飞扬国产外壳' || shell === 'BO5国产外壳') {
    state.typecDisabled = true;
    state.typecChecked = false;
  } else if (shell) {
    state.typecDisabled = true;
    state.typecChecked = true;
  } else {
    state.typecDisabled = false;
    state.typecChecked = hasTypec;
  }
  state.accessories = state.accessories.filter(n => {
    if (n === 'TYPEC接口制作') return false;
    if (n === '微动排线插座升级') return isErGai(state);
    if (n === '菜单背包微动') return !isGns(state);
    return true;
  });
  if (state.typecChecked) state.accessories.push('TYPEC接口制作');

  // 摇杆：非 alps 强制原装阻尼
  if (TMR_STICKS.indexOf(state.stick) !== -1) {
    state.damping = '原装阻尼';
  }

  // 扳机：肩键弹片微动时不可选普通微动
  if (state.shoulder.type === '肩键改装 凯隆弹片微动' &&
      state.trigger.type === '扳机键改装 凯隆普通微动') {
    state.trigger.type = '';
    state.trigger.config = '';
  }
  // 扳机：非指定主板不可选双切
  if (DUAL_TRIGGER_BOARDS.indexOf(state.motherboard) === -1 &&
      state.trigger.type === '扳机键改装 双切热插拔微动') {
    state.trigger.type = '';
    state.trigger.config = '';
  }
  // 扳机配置只在热插拔/双切时有效
  if (state.trigger.type !== '扳机键改装 热插拔大微动' &&
      state.trigger.type !== '扳机键改装 双切热插拔微动') {
    state.trigger.config = '';
  }

  // 背键：未选数量时清空子项
  if (!state.backkey.count) {
    state.backkey.keycaps = [];
    state.backkey.positions = [];
  }

  // DSE 金属键帽强制锁定 34 号位
  const hasDse = state.backkey.keycaps.indexOf('DSE金属豆子键帽') !== -1 ||
                 state.backkey.keycaps.indexOf('DSE金属拨片键帽') !== -1;
  const maxPos = state.backkey.count === '4' ? 2 : 1;
  if (state.backkey.count) {
    if (hasDse) {
      if (state.backkey.positions.indexOf('背键34号位置') === -1) {
        state.backkey.positions.unshift('背键34号位置');
      }
      // 34 号占位后裁剪超额的非 34 位置
      while (state.backkey.positions.length > maxPos) {
        const removable = state.backkey.positions.filter(p => p !== '背键34号位置');
        if (!removable.length) break;
        state.backkey.positions.splice(state.backkey.positions.indexOf(removable[0]), 1);
      }
    } else {
      state.backkey.positions = state.backkey.positions.filter(p => p !== '背键34号位置');
    }
    const maxKeycaps = state.backkey.count === '4' ? 2 : 1;
    while (state.backkey.keycaps.length > maxKeycaps) {
      state.backkey.keycaps.shift();
    }
  }

  // 麦克风微动背键仅 GNS 显示
  if (!isGns(state)) state.backkey.mic = false;

  return state;
}

// 计算已选项目、合计、缺失必选项
function compute(rawState) {
  const state = normalize(rawState);
  const items = [];
  let total = 0;

  const add = (name, price) => {
    items.push({ name, price });
    total += price;
  };

  // 主板
  if (state.motherboard) add(state.motherboard, base(state.motherboard));

  // 外壳
  if (state.shell) {
    if (state.shell === 'BO5国产外壳') {
      if (state.bo5Style) {
        const p = (PRICES_BY_VALUE['bo5-style'] || {})[state.bo5Style] || 0;
        add(state.shell + ' ' + state.bo5Style, p);
      } else {
        add(state.shell, 0);
      }
    } else if (state.shell === '其他外壳') {
      if (state.otherShell) {
        const p = (PRICES_BY_VALUE['other-shell'] || {})[state.otherShell] || 0;
        add(state.shell + ' ' + state.otherShell, p);
      } else {
        add(state.shell, 0);
      }
    } else {
      add(state.shellColor ? state.shell + ' ' + state.shellColor : state.shell, base(state.shell));
    }
  }

  // 中框
  if (state.midframe) add(state.midframe, base(state.midframe));

  // 摇杆 + 阻尼
  if (state.stick) {
    const sp = effectivePrice(state.stick, state);
    const dp = state.damping ? base(state.damping) : 0;
    const name = state.damping && state.damping !== '原装阻尼'
      ? state.stick + ' ' + state.damping
      : state.stick;
    add(name, sp + dp);
  }

  // 十字键
  if (state.dpad.type) {
    const extra = [state.dpad.force, state.dpad.config, state.dpad.color].filter(Boolean);
    add('十字键 ' + state.dpad.type + (extra.length ? ' ' + extra.join(' ') : ''), base(state.dpad.type));
  }

  // 交互键
  if (state.interact.type) {
    const extra = [state.interact.force, state.interact.config, state.interact.color].filter(Boolean);
    add('交互键 ' + state.interact.type + (extra.length ? ' ' + extra.join(' ') : ''), base(state.interact.type));
  }

  // 肩键
  if (state.shoulder.type) {
    const extra = [state.shoulder.force, state.shoulder.config].filter(Boolean);
    add(state.shoulder.type + (extra.length ? ' ' + extra.join(' ') : ''), base(state.shoulder.type));
  }

  // 扳机
  if (state.trigger.type) {
    const extra = [state.trigger.config].filter(Boolean);
    add(state.trigger.type + (extra.length ? ' ' + extra.join(' ') : ''), base(state.trigger.type));
  }

  // 微动背键
  if (state.backkey.count) {
    const countName = state.backkey.count === '2' ? '2个背键' : '4个背键';
    const kp = keycapPrices(state);
    let extraPrice = 0;
    state.backkey.keycaps.forEach(n => { extraPrice += kp[n] || 0; });
    state.backkey.positions.forEach(n => { extraPrice += base(n); });
    const extra = state.backkey.keycaps.concat(state.backkey.positions);
    add('微动背键 ' + countName + (extra.length ? ' ' + extra.join(' ') : ''), base(countName) + extraPrice);
  }

  // 额外肩键
  if (state.backkey.extraShoulder) {
    add(state.backkey.extraShoulder, base(state.backkey.extraShoulder));
  }

  // 其他配件
  state.accessories.forEach(name => {
    add(name, effectivePrice(name, state));
  });

  // 选配升级
  state.upgrades.forEach(name => {
    add(name, base(name));
  });

  // 特殊背键 / 芯片
  if (state.backkey.fn) add('FN摇杆微动背键', base('FN摇杆微动背键'));
  if (state.backkey.mic) add('麦克风微动背键', base('麦克风微动背键'));
  if (state.backkey.hen) add('HEN版本芯片', base('HEN版本芯片'));

  const missing = getMissing(state);

  return { items, total, missing };
}

// 缺失必选项（与网站 getMissingRequired 一致）
function getMissing(state) {
  const missing = [];

  if (!state.motherboard) missing.push('主板');

  if (!state.shell) {
    missing.push('手柄外壳');
  } else if (state.shell === '振飞扬国产外壳' || state.shell === '欧升腾国产类肤壳') {
    if (!state.shellColor) missing.push('外壳颜色');
  } else if (state.shell === 'BO5国产外壳') {
    if (!state.bo5Style) missing.push('BO5外壳款式');
  } else if (state.shell === '其他外壳') {
    if (!state.otherShell) missing.push('其他外壳类型');
  }

  if (!state.midframe) missing.push('手柄中框');
  if (!state.stick) missing.push('摇杆本体');
  if (!state.damping) missing.push('摇杆减阻尼');

  if (!state.dpad.type) missing.push('十字键改装');
  if (state.dpad.type) {
    if (state.dpad.type === '凯隆小微动' && !state.dpad.force) missing.push('微动力度');
    if (state.dpad.type === '热插拔大微动' && !state.dpad.config) missing.push('大微动配置');
    if (!state.dpad.color) missing.push('按键颜色');
  }

  if (!state.interact.type) missing.push('交互键改装');
  if (state.interact.type) {
    if (state.interact.type === '凯隆小微动' && !state.interact.force) missing.push('微动力度');
    if (state.interact.type === '热插拔大微动' && !state.interact.config) missing.push('大微动配置');
    if (!state.interact.color) missing.push('按键颜色');
  }

  if (!state.shoulder.type) missing.push('肩键改装');
  if (state.shoulder.type === '肩键改装 凯隆普通微动' && !state.shoulder.force) missing.push('微动力度');
  if (state.shoulder.type === '肩键改装 热插拔大微动' && !state.shoulder.config) missing.push('大微动配置');

  if (!state.trigger.type) missing.push('扳机键改装');

  if (state.backkey.count) {
    const requiredPositions = state.backkey.count === '4' ? 2 : 1;
    if (!state.backkey.keycaps.length) missing.push('键帽');
    if (state.backkey.positions.length < requiredPositions) missing.push('背键位置');
  }

  return Array.from(new Set(missing));
}

module.exports = {
  base,
  effectivePrice,
  colorPrice,
  keycapPrices,
  visibleUpgrades,
  upgradeStepVisible,
  compute,
  normalize,
  isErGai,
  isGns
};
